package com.agrosamridhi.aiinference.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.agrosamridhi.aiinference.dto.CropSuggestionRequest;
import com.agrosamridhi.aiinference.dto.CropSuggestionResponse;
import com.agrosamridhi.aiinference.entity.SoilHealthRecord;
import com.agrosamridhi.aiinference.repository.SoilHealthRecordRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;


@Service
public class CropSuggestionService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final SoilHealthRecordRepository soilRepository;
    private final LocationWeatherService locationService;
    
    @Value("${gemini.api.url}")
    private String geminiUrl;

    @Value("${gemini.api.key}")
    private String geminiKey;

    public CropSuggestionService(RestTemplate restTemplate, ObjectMapper objectMapper, SoilHealthRecordRepository soilRepository, LocationWeatherService locationService) {
        this.restTemplate=restTemplate;
        this.objectMapper=objectMapper;
        this.soilRepository=soilRepository;
        this.locationService = locationService;
    }

    public CropSuggestionResponse suggestCrops(CropSuggestionRequest request) {
        // Fetch the OCR data from the databse!
        Optional optionalRecord = soilRepository.findById(request.soilRecordId());

        if(optionalRecord.isEmpty()) {
            return new CropSuggestionResponse(List.of(
                new CropSuggestionResponse.CropSuggestion("Error", "N/A", List.of(),  "Soil record not found in database.")
            ));
        }

        SoilHealthRecord soilData = (SoilHealthRecord) optionalRecord.get();

        // Automatically fetch the context
        String region = locationService.getRegionName(request.latitude(), request.longitude());
        String season = locationService.getCurrentSeason();

        String fullUrl = geminiUrl + geminiKey;

        String prompt = String.format(
            "You are an expert agronomist. Based on the following soil and environmental data, recommend the top 3 most profitable and viable crops. " +
            "Soil Data: Nitrogen=%.2f, Phosphorun=%.2f, Potassium=%.2f, pH=%.2f, Organic Carbon=%.2f. " +
            "Season: %s. Region: %s. " +
            "Respond ONLY in a flat JSON object with a single key 'recommendedCrops' which is an array of objects containing: " +
            "cropName (string), expectedYieldTimeline (string), requiredFertilizers (array of strings), and reasoning (string).",
            soilData.getNitrogen(), soilData.getPhosphorus(), soilData.getPotassium(),
            soilData.getPhLevel(), soilData.getOrganicCarbon(), season,region
        );

        Map requestBody = Map.of(
            "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
            "generationConfig", Map.of("responseMimeType", "application/json")
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            String responseStr = restTemplate.postForObject(fullUrl, entity, String.class);

            JsonNode rootNode = objectMapper.readTree(responseStr);
            JsonNode textNode = rootNode.at("/candidates/0/content/parts/0/text");

            if(textNode.isMissingNode() || textNode.asText().isEmpty()) {
                return new CropSuggestionResponse(List.of());
            }

            String aiJsonOutput = textNode.asText().replace("```json", "");
            return objectMapper.readValue(aiJsonOutput, CropSuggestionResponse.class);
        } catch (Exception e) {
            e.printStackTrace();
            return new CropSuggestionResponse(List.of(
                new CropSuggestionResponse.CropSuggestion("Error", "N/A", List.of(), "Failed to generate suggestions: " + e.getMessage())
            ));
        }
    }
}
