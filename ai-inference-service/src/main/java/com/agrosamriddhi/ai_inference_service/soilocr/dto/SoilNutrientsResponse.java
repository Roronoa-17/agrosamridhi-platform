package com.agrosamriddhi.ai_inference_service.soilocr.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SoilNutrientsResponse {
    private Double nitrogen;
    private Double phosphorus;
    private Double potassium;
    private Double ph;
    private String rawText;
}
