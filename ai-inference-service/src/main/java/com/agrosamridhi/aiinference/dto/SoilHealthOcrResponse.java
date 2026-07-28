package com.agrosamridhi.aiinference.dto;

public record SoilHealthOcrResponse (
    Long recordId,
    Double nitrogen,
    Double phosphorun,
    Double potassium,
    Double phLevel,
    Double organicCarbon
) {}
