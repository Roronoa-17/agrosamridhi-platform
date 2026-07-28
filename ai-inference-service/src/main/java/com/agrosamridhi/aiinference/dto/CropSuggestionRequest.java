package com.agrosamridhi.aiinference.dto;

public record CropSuggestionRequest (
    Long soilRecordId,
    Double latitude,
    Double longitude
) {}
