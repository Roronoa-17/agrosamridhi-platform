package com.agrosamridhi.dashboard_aggregator_service.dto;
import lombok.Data;

// Mirrors the relevant fields of data-ingestion-service's WeatherData entity.
@Data
public class WeatherRecordDTO {
    private Double temperature;
    private Double humidity;
    private Double rainfall;
    private Double windSpeed;
}
