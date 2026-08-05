package com.agrosamridhi.dataingestion.service.impl;

import com.agrosamridhi.dataingestion.dto.AgmarknetRecord;
import com.agrosamridhi.dataingestion.dto.AgmarknetResponse;
import com.agrosamridhi.dataingestion.dto.MandiTrendResponse;
import com.agrosamridhi.dataingestion.entity.MandiPrice;
import com.agrosamridhi.dataingestion.repository.MandiRepository;
import com.agrosamridhi.dataingestion.service.MandiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Service
public class MandiServiceImpl implements MandiService {

    private static final DateTimeFormatter ARRIVAL_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final int RECORDS_PER_TREND = 20;

    private final MandiRepository mandiRepository;
    private final WebClient.Builder webClientBuilder;

    @Value("${agmarknet.base-url}")
    private String agmarknetBaseUrl;

    @Value("${agmarknet.api-key}")
    private String apiKey;

    public MandiServiceImpl(MandiRepository mandiRepository,
                            WebClient.Builder webClientBuilder) {
        this.mandiRepository = mandiRepository;
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public void fetchAndSaveMandiPrices() {
        AgmarknetResponse response = webClientBuilder.build()
                .get()
                .uri(agmarknetBaseUrl +
                        "?api-key=" + apiKey +
                        "&format=json" +
                        "&limit=100")
                .retrieve()
                .bodyToMono(AgmarknetResponse.class)
                .block();

        int inserted = saveAgmarknetRecords(response);
        System.out.println("Inserted: " + inserted);
    }

    private List<MandiPrice> fetchFreshByCommodity(String cropName) {
        String encodedCrop = URLEncoder.encode(cropName, StandardCharsets.UTF_8);

        AgmarknetResponse response = webClientBuilder.build()
                .get()
                .uri(agmarknetBaseUrl +
                        "?api-key=" + apiKey +
                        "&format=json" +
                        "&limit=50" +
                        "&filters%5BCommodity%5D=" + encodedCrop)
                .retrieve()
                .bodyToMono(AgmarknetResponse.class)
                .block();

        saveAgmarknetRecords(response);

        return mandiRepository.findByCropNameContainingIgnoreCase(cropName);
    }

    private int saveAgmarknetRecords(AgmarknetResponse response) {
        if (response == null || response.getRecords() == null) {
            return 0;
        }

        int inserted = 0;

        for (AgmarknetRecord record : response.getRecords()) {
            LocalDate arrivalDate;
            try {
                arrivalDate = LocalDate.parse(record.getArrivalDate(), ARRIVAL_DATE_FORMAT);
            } catch (Exception ex) {
                continue;
            }

            List<MandiPrice> existingRecords =
                    mandiRepository.findByCropNameAndMandiNameAndArrivalDate(
                            record.getCommodity(),
                            record.getMarket(),
                            arrivalDate
                    );

            if (existingRecords.isEmpty()) {
                MandiPrice mandiPrice = new MandiPrice();

                mandiPrice.setCropName(record.getCommodity());
                mandiPrice.setMandiName(record.getMarket());
                mandiPrice.setDistrict(record.getDistrict());
                mandiPrice.setState(record.getState());

                mandiPrice.setMinPrice(record.getMinPrice());
                mandiPrice.setMaxPrice(record.getMaxPrice());
                mandiPrice.setModalPrice(record.getModalPrice());

                mandiPrice.setArrivalDate(arrivalDate);
                mandiPrice.setCreatedAt(LocalDateTime.now());

                mandiRepository.save(mandiPrice);
                inserted++;
            }
        }

        return inserted;
    }

    @Override
    public List<MandiPrice> getAllMandiPrices(String state, String district) {
        if (district != null && !district.isBlank()) {
            List<MandiPrice> local = mandiRepository.findByDistrictIgnoreCase(district.trim());
            if (!local.isEmpty()) {
                return local;
            }
        }

        if (state != null && !state.isBlank()) {
            List<MandiPrice> local = mandiRepository.findByStateIgnoreCase(state.trim());
            if (!local.isEmpty()) {
                return local;
            }
        }

        return mandiRepository.findAll();
    }

    @Override
    public MandiTrendResponse getPriceTrend(String cropName, String state, String district) {
        List<MandiPrice> records = List.of();
        String scope = "none";

        if (district != null && !district.isBlank()) {
            records = mandiRepository.findByCropNameContainingIgnoreCaseAndDistrictIgnoreCase(cropName, district.trim());
            if (!records.isEmpty()) {
                scope = "district";
            }
        }

        if (records.isEmpty() && state != null && !state.isBlank()) {
            records = mandiRepository.findByCropNameContainingIgnoreCaseAndStateIgnoreCase(cropName, state.trim());
            if (!records.isEmpty()) {
                scope = "state";
            }
        }

        if (records.isEmpty()) {
            records = mandiRepository.findByCropNameContainingIgnoreCase(cropName);
            if (!records.isEmpty()) {
                scope = "nationwide";
            }
        }

        if (records.isEmpty()) {
            records = fetchFreshByCommodity(cropName);
            if (!records.isEmpty()) {
                scope = "live";
            }
        }

        MandiTrendResponse response = new MandiTrendResponse();
        response.setCropName(cropName);
        response.setLocationScope(scope);

        if (records.isEmpty()) {
            response.setAveragePrice(null);
            response.setMinimumPrice(null);
            response.setMaximumPrice(null);
            response.setTotalRecords(0L);
            response.setRecords(List.of());
            return response;
        }

        double averagePrice = records.stream()
                .mapToDouble(record -> record.getModalPrice() != null ? record.getModalPrice() : 0.0)
                .average()
                .orElse(0.0);

        double minimumPrice = records.stream()
                .mapToDouble(record -> record.getMinPrice() != null ? record.getMinPrice() : 0.0)
                .min()
                .orElse(0.0);

        double maximumPrice = records.stream()
                .mapToDouble(record -> record.getMaxPrice() != null ? record.getMaxPrice() : 0.0)
                .max()
                .orElse(0.0);

        response.setAveragePrice(averagePrice);
        response.setMinimumPrice(minimumPrice);
        response.setMaximumPrice(maximumPrice);
        response.setTotalRecords((long) records.size());
        response.setRecords(records.stream()
                .sorted(Comparator.comparing(MandiPrice::getArrivalDate).reversed())
                .limit(RECORDS_PER_TREND)
                .toList());

        return response;
    }
}
