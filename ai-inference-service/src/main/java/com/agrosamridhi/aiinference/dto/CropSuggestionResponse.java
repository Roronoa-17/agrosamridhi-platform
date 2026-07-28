package com.agrosamridhi.aiinference.dto;

import java.util.List;

public record CropSuggestionResponse(
    List recommendedCrops
) {
    public record CropSuggestion(
        String cropName,
        String expectedYieldTimeline,
        List requiredFertilizers,
        String reasoning
    ) {}
}