package com.agrosamriddhi.ai_inference_service.cropsuggestion;

import java.util.List;

import org.springframework.stereotype.Service;

import com.agrosamriddhi.ai_inference_service.common.GeminiClient;
import com.agrosamriddhi.ai_inference_service.cropsuggestion.dto.CropSuggestionRequest;
import com.agrosamriddhi.ai_inference_service.cropsuggestion.dto.CropSuggestionResponse;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import reactor.core.publisher.Mono;

@Service
public class CropSuggestionService {

    private final GeminiClient geminiClient;
    private final CropRuleEngine ruleEngine;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public CropSuggestionService(GeminiClient geminiClient, CropRuleEngine ruleEngine) {
        this.geminiClient = geminiClient;
        this.ruleEngine = ruleEngine;
    }

    public Mono<CropSuggestionResponse> suggest(CropSuggestionRequest req) {

        List<String> eligibleCrops = ruleEngine.getEligibleCrops(req);

        if (eligibleCrops.isEmpty()) {
            CropSuggestionResponse empty = new CropSuggestionResponse();
            empty.setEligibleCrops(List.of());
            empty.setAdvisory("No suitable crops found for the given soil, season, and budget. "
                    + "Consider adjusting budget or checking soil pH.");
            return Mono.just(empty);
        }

        String prompt = buildPrompt(req, eligibleCrops);

        return geminiClient.analyzeText(prompt)
                .map(geminiText -> parseResponse(geminiText, eligibleCrops));
    }

    private String buildPrompt(CropSuggestionRequest req, List<String> eligibleCrops) {
        return """
                You are an expert Indian agronomist creating a 3-year crop rotation plan.

                Farmer details:
                - Location: %s
                - Farm size: %.1f acres
                - Soil: N=%.1f, P=%.1f, K=%.1f, pH=%.1f (kg/ha)
                - Budget per acre: INR %.0f
                - Current season: %s

                You MUST only choose crops from this pre-approved eligible list:
                %s

                Create a 3-year rotation plan that maintains soil health, rotates crop families,
                and stays within budget. For each year give the crop, a short reason,
                estimated cost per acre, and expected profit per acre (in INR).

                Return ONLY a valid JSON object in EXACTLY this format,
                no markdown, no code fences, no explanation:
                {
                  "rotationPlan": [
                    {"year": 1, "season": "<season>", "recommendedCrop": "<crop>", "reason": "<short>", "estimatedCostPerAcre": <number>, "expectedProfitPerAcre": <number>},
                    {"year": 2, "season": "<season>", "recommendedCrop": "<crop>", "reason": "<short>", "estimatedCostPerAcre": <number>, "expectedProfitPerAcre": <number>},
                    {"year": 3, "season": "<season>", "recommendedCrop": "<crop>", "reason": "<short>", "estimatedCostPerAcre": <number>, "expectedProfitPerAcre": <number>}
                  ],
                  "advisory": "<overall 2-3 sentence advice for the farmer>"
                }
                """.formatted(
                        req.getLocation(),
                        req.getFarmSizeAcres() != null ? req.getFarmSizeAcres() : 0.0,
                        req.getNitrogen()   != null ? req.getNitrogen()   : 0.0,
                        req.getPhosphorus() != null ? req.getPhosphorus() : 0.0,
                        req.getPotassium()  != null ? req.getPotassium()  : 0.0,
                        req.getPh()         != null ? req.getPh()         : 0.0,
                        req.getBudget()     != null ? req.getBudget()     : 0.0,
                        req.getSeason(),
                        String.join(", ", eligibleCrops)
                );
    }

    private CropSuggestionResponse parseResponse(String geminiText, List<String> eligibleCrops) {
        try {
            int start = geminiText.indexOf('{');
            int end = geminiText.lastIndexOf('}');
            if (start == -1 || end == -1 || end < start) {
                throw new IllegalStateException("No JSON found");
            }
            String json = geminiText.substring(start, end + 1);
            CropSuggestionResponse response = objectMapper.readValue(json, CropSuggestionResponse.class);

            response.setEligibleCrops(eligibleCrops);
            return response;
        } catch (Exception e) {
            System.out.println("CROP PARSE ERROR: " + e.getMessage());
            CropSuggestionResponse fallback = new CropSuggestionResponse();
            fallback.setEligibleCrops(eligibleCrops);
            fallback.setRawText(geminiText);
            return fallback;
        }
    }
}
