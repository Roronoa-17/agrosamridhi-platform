package com.agrosamridhi.dataingestion.service.impl;

import com.agrosamridhi.dataingestion.dto.AgmarknetRecord;
import com.agrosamridhi.dataingestion.dto.AgmarknetResponse;
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

            for (AgmarknetRecord record : response.getRecords()) {

                MandiPrice mandiPrice = new MandiPrice();

                mandiPrice.setCropName(record.getCommodity());
                mandiPrice.setMandiName(record.getMarket());
                mandiPrice.setDistrict(record.getDistrict());
                mandiPrice.setState(record.getState());

                mandiPrice.setMinPrice(record.getMinPrice());
                mandiPrice.setMaxPrice(record.getMaxPrice());
                mandiPrice.setModalPrice(record.getModalPrice());

                mandiPrice.setArrivalDate(
                        LocalDate.parse(record.getArrivalDate(), formatter));

                mandiPrice.setCreatedAt(LocalDateTime.now());

                mandiRepository.save(mandiPrice);
            }

            System.out.println("Mandi prices fetched successfully.");
        }
    }

    @Override
    public List<MandiPrice> getAllMandiPrices() {
        return mandiRepository.findAll();
    }

    @Override
    public String getPriceTrend(String cropName) {
        return "90-day trend will be calculated here.";
    }
}