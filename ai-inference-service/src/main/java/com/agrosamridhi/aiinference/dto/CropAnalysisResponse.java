package com.agrosamridhi.aiinference.dto;

import java.util.List;

public record CropAnalysisResponse(
    String cropType,
    String observedSymptoms,
    String diseaseName,
    double confidenceScore,
    String severityLevel,
    List recommendedTreatments
) {
    
}
