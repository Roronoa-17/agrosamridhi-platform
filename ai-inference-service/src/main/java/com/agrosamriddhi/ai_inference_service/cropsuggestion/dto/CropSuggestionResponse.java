package com.agrosamriddhi.ai_inference_service.cropsuggestion.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CropSuggestionResponse {
    private List<String> eligibleCrops;
    private List<YearPlan> rotationPlan;
    private String advisory;
    private String rawText;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class YearPlan {
        private int year;
        private String season;
        private String recommendedCrop;
        private String reason;
        private Double estimatedCostPerAcre;
        private Double expectedProfitPerAcre;
    }
}
