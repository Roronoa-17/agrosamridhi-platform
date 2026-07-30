package com.agrosamridhi.dashboard_aggregator_service.dto;
import lombok.Data;

@Data
public class WeatherAdvisoryDTO {
    private String temperature;
    private String condition;
    private String advisoryMessage;
}