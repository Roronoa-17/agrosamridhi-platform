package com.agrosamridhi.dashboard_aggregator_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeatherAdvisoryDTO implements Serializable {
    private String location;
    private String temperature;
    private String rainfallForecast;
    private List<String> farmingAlerts;
}