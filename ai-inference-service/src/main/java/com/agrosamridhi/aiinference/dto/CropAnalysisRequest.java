package com.agrosamridhi.aiinference.dto;

public record CropAnalysisRequest(
    String cropType,
    String imageBase64,
    String observedSymptoms
) {
}
