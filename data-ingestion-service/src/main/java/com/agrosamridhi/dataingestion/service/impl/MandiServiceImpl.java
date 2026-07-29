package com.agrosamridhi.dataingestion.service.impl;

import java.util.Optional;
import com.agrosamridhi.dataingestion.dto.AgmarknetRecord;
import com.agrosamridhi.dataingestion.dto.AgmarknetResponse;
import com.agrosamridhi.dataingestion.dto.MandiTrendResponse;
import com.agrosamridhi.dataingestion.entity.MandiPrice;
import com.agrosamridhi.dataingestion.repository.MandiRepository;
import com.agrosamridhi.dataingestion.service.MandiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class MandiServiceImpl implements MandiService {

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

    if (response != null && response.getRecords() != null) {

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("dd/MM/yyyy");

        int inserted = 0;
        int skipped = 0;

        for (AgmarknetRecord record : response.getRecords()) {

            LocalDate arrivalDate =
                    LocalDate.parse(record.getArrivalDate(), formatter);

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

            } else {

                skipped++;

            }
        }

        System.out.println("Inserted: " + inserted +
                " | Skipped duplicates: " + skipped);
    }
}

    @Override
    public List<MandiPrice> getAllMandiPrices() {
        return mandiRepository.findAll();
    }

  @Override
public MandiTrendResponse getPriceTrend(String cropName) {

    List<Object[]> result = mandiRepository.getPriceTrend(cropName);

    if (result.isEmpty()) {
        return null;
    }

    Object[] row = result.get(0);

    MandiTrendResponse response = new MandiTrendResponse();

    response.setCropName((String) row[0]);
    response.setAveragePrice(((Number) row[1]).doubleValue());
    response.setMinimumPrice(((Number) row[2]).doubleValue());
    response.setMaximumPrice(((Number) row[3]).doubleValue());
    response.setTotalRecords(((Number) row[4]).longValue());

    return response;
}
}