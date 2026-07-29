package com.agrosamridhi.dashboard_aggregator_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnifiedDashboardResponse implements Serializable {
	
	private FarmerProfileDTO profile;
    private WeatherAdvisoryDTO weather;
    private MandiTrendDTO mandiTrends;
    private long lastUpdatedTimestamp;
}