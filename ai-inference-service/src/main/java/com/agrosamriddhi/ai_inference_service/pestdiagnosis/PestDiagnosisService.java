package com.agrosamriddhi.ai_inference_service.pestdiagnosis;

import org.springframework.stereotype.Service;

import com.agrosamriddhi.ai_inference_service.common.GeminiClient;
import com.agrosamriddhi.ai_inference_service.pestdiagnosis.dto.PestDiagnosisResponse;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import reactor.core.publisher.Mono;

@Service
public class PestDiagnosisService {

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public PestDiagnosisService(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    private static final String PEST_PROMPT = """
            You are an expert Indian agricultural pathologist.
            Analyze this crop image and diagnose any pest infestation or disease.

            Identify:
            - the crop shown in the image
            - the disease or pest affecting it
            - severity (must be exactly one of: LOW, MEDIUM, HIGH)
            - visible symptoms
            - organic remedies suitable for small Indian farmers
            - chemical remedies with commonly available product names in India
            - preventive measures for future seasons

            Return ONLY a valid JSON object in EXACTLY this format, with no explanation,
            no markdown, no code fences:
            {
              "cropName": "<string>",
              "diseaseName": "<string>",
              "severity": "<LOW|MEDIUM|HIGH>",
              "symptoms": ["<string>", "<string>"],
              "organicRemedies": ["<string>", "<string>"],
              "chemicalRemedies": ["<string>", "<string>"],
              "preventiveMeasures": ["<string>", "<string>"]
            }

            If the image does not show a crop or plant, set diseaseName to "NOT_A_CROP"
            and use empty arrays for all lists.
            """;

    public Mono<PestDiagnosisResponse> diagnose(String base64Image, String mimeType) {
        return geminiClient.analyzeImage(PEST_PROMPT, base64Image, mimeType)
                .map(this::parseResponse);
    }

    private PestDiagnosisResponse parseResponse(String geminiText) {
        try {

            int start = geminiText.indexOf('{');
            int end = geminiText.lastIndexOf('}');
            if (start == -1 || end == -1 || end < start) {
                throw new IllegalStateException("No JSON object found in response");
            }
            String json = geminiText.substring(start, end + 1);
            return objectMapper.readValue(json, PestDiagnosisResponse.class);
        } catch (Exception e) {
            System.out.println("PEST PARSE ERROR: " + e.getMessage());
            PestDiagnosisResponse fallback = new PestDiagnosisResponse();
            fallback.setRawText(geminiText);
            return fallback;
        }
    }
}
