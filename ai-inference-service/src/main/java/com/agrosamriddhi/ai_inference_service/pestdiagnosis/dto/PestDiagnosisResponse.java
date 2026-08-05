package com.agrosamriddhi.ai_inference_service.pestdiagnosis.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PestDiagnosisResponse {
    private String cropName;
    private String diseaseName;
    private String severity;
    private List<String> symptoms;
    private List<String> organicRemedies;
    private List<String> chemicalRemedies;
    private List<String> preventiveMeasures;
    private String rawText;
}
