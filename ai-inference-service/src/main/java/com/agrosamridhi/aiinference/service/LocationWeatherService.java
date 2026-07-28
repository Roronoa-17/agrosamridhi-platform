package com.agrosamridhi.aiinference.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;

@Service
public class LocationWeatherService {
    private final RestTemplate restTemplate;

    public LocationWeatherService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Turns Lat/Lon into "Pune, Maharashtra"
    public String getRegionName(Double latitude, Double longitude) {
        if(latitude == null || longitude == null) return "Unknown Region";

        try {
            String url = String.format(
                "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=%s&longitude=%s&localityLanguage=en",
                latitude, longitude
            );
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);

            String city = response.path("city").asText("Unknown City");
            String state = response.path("principalSubdivision").asText("Unknown State");
            return city + ", " + state;
        } catch (Exception e) {
            return "Unknown Region";
        }
    }

    // Determines the Indian Agricultural Season based on the current month
    public String getCurrentSeason() {
        int month = LocalDate.now().getMonthValue();

        if(month >= 6 && month <= 10) {
            return "Kharif (Monsoon)";
        } else if (month >= 11 || month <= 3) {
            return "Rabi (Winter)";
        } else {
            return "Zaid (Summer)";
        }
    }
}
