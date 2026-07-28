package com.agrosamridhi.dashboard_aggregator_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnifiedDashboardResponse implements Serializable {
	
    public UnifiedDashboardResponse(FarmerProfileDTO profile2, WeatherAdvisoryDTO weather2, MandiTrendDTO mandiTrends2,
			long timeMillis) {

	}
	private FarmerProfileDTO profile;
    private WeatherAdvisoryDTO weather;
    private MandiTrendDTO mandiTrends;
    private long lastUpdatedTimestamp;
}