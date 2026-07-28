package com.agrosamridhi.aiinference.service;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.agrosamridhi.aiinference.dto.SoilHealthOcrResponse;
import com.agrosamridhi.aiinference.entity.SoilHealthRecord;
import com.agrosamridhi.aiinference.repository.SoilHealthRecordRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class SoilOcrService {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final SoilHealthRecordRepository repository;

    @Value("${gemini.api.url}")
    private String geminiUrl;

    @Value("${gemini.api.key}")
    private String geminiKey;

    public SoilOcrService(RestTemplate restTemplate, ObjectMapper objectMapper, SoilHealthRecordRepository repository) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.repository = repository;
    }

    public SoilHealthOcrResponse analyzeSoilCard(MultipartFile imageFile) {
        String fullUrl = geminiUrl + geminiKey;
        
        String prompt = String.format(
                        "You are an expert agricultural AI. Read this Soil Health Card. " +
                        "Extract the numeric values for Nitrogen, Phosphorus, Potassium, pH level, and Organic Carbon. " +
                        "Respond ONLY in a flat JSON object with these exact keys: " + 
                        "nitrogen (number), phosphorun (number), potassium (number), phLevel (number), organicCarbon (number)."
        );

        List parts = new ArrayList<>();
        parts.add(Map.of("text", prompt));

        if(imageFile != null && !imageFile.isEmpty()) {
            try {
                String base64Image = Base64.getEncoder().encodeToString(imageFile.getBytes());
                parts.add(Map.of("inline_data", Map.of("mime_type", "image/jpeg", "data", base64Image)));
            } catch (Exception e) {
                throw new RuntimeException("Image read failed");
            }
        }

        Map requestBody = Map.of(
            "contents", List.of(Map.of("parts", parts)),
            "generationConfig", Map.of("responseMimeType", "application/json")
        );
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity entity = new HttpEntity<>(requestBody, headers);
        
        try {
            String responseStr = restTemplate.postForObject(fullUrl, entity, String.class);
            JsonNode rootNode = objectMapper.readTree(responseStr);
            JsonNode textNode = rootNode.at("/candidates/0/content/parts/0/text");

            String aiJsonOutput = textNode.asText().replace("```json", "").replace("```", "");
            JsonNode aiData = objectMapper.readTree(aiJsonOutput);

            // Saving to Database
            SoilHealthRecord record = new SoilHealthRecord();
            record.setNitrogen(aiData.path("nitrogen").asDouble(0.0));
            record.setPhosphorus(aiData.path("phosphorus").asDouble(0.0));
            record.setPotassium(aiData.path("potassium").asDouble(0.0));
            record.setPhLevel(aiData.path("phLevel").asDouble(0.0));
            record.setOrganicCarbon(aiData.path("organicCarbon").asDouble(0.0));

            record = repository.save(record);

            return new SoilHealthOcrResponse(
                record.getId(), record.getNitrogen(), record.getPhosphorus(),
                record.getPotassium(), record.getPhLevel(), record.getOrganicCarbon()
            );
        } catch (Exception e) {
            e.printStackTrace();
            return new SoilHealthOcrResponse(null, 0.0, 0.0, 0.0, 0.0, 0.0);
        }
    }
}
