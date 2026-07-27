package com.agrosamriddhi.ai_inference_service.cropsuggestion.dto;

import lombok.Data;

@Data
public class CropSuggestionRequest {
    private Double nitrogen;
    private Double phosphorus;
    private Double potassium;
    private Double ph;
    private Double budget;
    private String location;
    private Double farmSizeAcres;
    private String season;
}
