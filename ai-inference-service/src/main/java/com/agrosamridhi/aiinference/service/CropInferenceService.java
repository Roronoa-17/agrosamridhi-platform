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

import com.agrosamridhi.aiinference.dto.CropAnalysisResponse;
import com.agrosamridhi.aiinference.entity.InferenceHistory;
import com.agrosamridhi.aiinference.repository.InferenceHistoryRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class CropInferenceService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final InferenceHistoryRepository historyRepository;

    @Value("${gemini.api.url}")
    private String geminiUrl;

    @Value("${gemini.api.key}")
    private String geminiKey;

    public CropInferenceService(RestTemplate restTemplate, ObjectMapper objectMapper, InferenceHistoryRepository historyRepository) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.historyRepository = historyRepository;
    }

    public CropAnalysisResponse analyzeCrop(MultipartFile imageFile) {
        String fullUrl = geminiUrl + geminiKey;

        // 1. Fixed prompt key typos (confidenceScore & recommendedTreatments)
        String prompt = String.format(
            "You are an expert agricultural AI. Analyze this image of a plant/crop. " +
            "Identify the crop, observe any visible symptoms of pests, damage, or diseases, and provide a dignosis. " +
            "Respond ONLY in a flat JSON object with these exact keys: " +
            "cropType (string), observedSymptoms (string), diseaseName (string), confidenceScore (number 0-100), severityLevel (LOW, MEDIUM, HIGH), and recommendedTreatments (array of strings)."
        );

        // 2. Build payload parts safely
        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("text", prompt));

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String base64Image = Base64.getEncoder().encodeToString(imageFile.getBytes());
                parts.add(Map.of("inline_data", Map.of(
                    "mime_type", "image/jpeg",
                    "data", base64Image
                )));
            } catch (Exception e) {
                return new CropAnalysisResponse("Unknow", "Unknown", "File Error", 0.0, "UNKNOWN", List.of("Failed to read image file."));
            }
        }

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(Map.of("parts", parts)),
            "generationConfig", Map.of("responseMimeType", "application/json")
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            // 3. Call Gemini API
            String responseStr = restTemplate.postForObject(fullUrl, entity, String.class);

            // 4. Extract JSON response text
            JsonNode rootNode = objectMapper.readTree(responseStr);
            JsonNode textNode = rootNode.at("/candidates/0/content/parts/0/text");

            if (textNode.isMissingNode() || textNode.asText().isEmpty()) {
                System.out.println("Gemini Response: " + responseStr);
                return new CropAnalysisResponse("Unknow", "Unknow","Analysis Blocked", 0.0, "UNKNOWN", List.of("Google AI returned an empty response. It may have flagged the image via safety filters."));
            }

            String aiJsonOutput = textNode.asText().replace("```json", "").replace("```", "").trim();

            // 5. Map JSON to DTO
            CropAnalysisResponse dtrResponse = objectMapper.readValue(aiJsonOutput, CropAnalysisResponse.class);

            // 6. Save record to MySQL with null checks
            InferenceHistory history = new InferenceHistory();
            history.setPredictedDisease(dtrResponse.diseaseName());
            history.setConfidenceScore(dtrResponse.confidenceScore());
            history.setSeverityLevel(dtrResponse.severityLevel());

            List<String> treatments = dtrResponse.recommendedTreatments();
            String treatmentsStr = (treatments != null && !treatments.isEmpty()) 
                    ? String.join(", ", treatments) 
                    : "No specific treatment provided";
            history.setTreatments(treatmentsStr);

            historyRepository.save(history);

            return dtrResponse;

        } catch (Exception e) {
            e.printStackTrace();
            return new CropAnalysisResponse("Unknown", "Unknown","Analysis Failed", 0.0, "UNKNOWN", List.of("Error: " + e.getMessage()));
        }
    }
}