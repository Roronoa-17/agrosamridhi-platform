package com.agrosamriddhi.ai_inference_service.soilocr;

import org.springframework.stereotype.Service;

import com.agrosamriddhi.ai_inference_service.common.GeminiClient;
import com.agrosamriddhi.ai_inference_service.soilocr.dto.SoilNutrientsResponse;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import reactor.core.publisher.Mono;

@Service
public class SoilOcrService {

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public SoilOcrService(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    private static final String SOIL_PROMPT = """
            You are an expert at reading Indian Soil Health Cards.
            Extract the following nutrient values from this soil health card image:
            - nitrogen (N) in kg/ha
            - phosphorus (P) in kg/ha
            - potassium (K) in kg/ha
            - ph value

            Return ONLY a valid JSON object in EXACTLY this format, with no explanation,
            no markdown, no code fences:
            {"nitrogen": <number>, "phosphorus": <number>, "potassium": <number>, "ph": <number>}

            If any value is not found, use null for that field.
            """;

    public Mono<SoilNutrientsResponse> extractNutrients(String base64Image, String mimeType) {
        return geminiClient.analyzeImage(SOIL_PROMPT, base64Image, mimeType)
                .map(this::parseResponse);
    }

    private SoilNutrientsResponse parseResponse(String geminiText) {
        try {

            int start = geminiText.indexOf('{');
            int end = geminiText.lastIndexOf('}');
            if (start == -1 || end == -1 || end < start) {
                throw new IllegalStateException("No JSON object found in response");
            }
            String json = geminiText.substring(start, end + 1);
            return objectMapper.readValue(json, SoilNutrientsResponse.class);
        } catch (Exception e) {
            System.out.println("SOIL PARSE ERROR: " + e.getMessage());

            SoilNutrientsResponse fallback = new SoilNutrientsResponse();
            fallback.setRawText(geminiText);
            return fallback;
        }
    }
}
