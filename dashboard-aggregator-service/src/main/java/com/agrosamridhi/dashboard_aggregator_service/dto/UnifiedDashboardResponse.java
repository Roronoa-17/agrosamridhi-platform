package com.agrosamridhi.dashboard_aggregator_service.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UnifiedDashboardResponse {
    private FarmerProfileDTO profile;
    private WeatherAdvisoryDTO weather;
    private MandiTrendDTO mandiTrends;
    private Long timestamp;
}