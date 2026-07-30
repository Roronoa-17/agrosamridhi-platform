package com.agrosamridhi.dashboard_aggregator_service.service;

import com.agrosamridhi.dashboard_aggregator_service.client.AuthServiceClient;
import com.agrosamridhi.dashboard_aggregator_service.client.DataIngestionClient;
import com.agrosamridhi.dashboard_aggregator_service.dto.FarmerProfileDTO;
import com.agrosamridhi.dashboard_aggregator_service.dto.MandiTrendDTO;
import com.agrosamridhi.dashboard_aggregator_service.dto.UnifiedDashboardResponse;
import com.agrosamridhi.dashboard_aggregator_service.dto.WeatherAdvisoryDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardAggregatorService {

    private final AuthServiceClient authServiceClient;
    private final DataIngestionClient dataIngestionClient;

    public UnifiedDashboardResponse getAggregatedDashboard(String farmerId) {
        log.info("Aggregating dashboard data for Farmer ID: {}", farmerId);

        // 1. Fetch Auth Profile
        FarmerProfileDTO profile = authServiceClient.getProfile(farmerId);

        // 2. Wrap downstream calls in try-catch so the dashboard doesn't crash if weather fails
        WeatherAdvisoryDTO weather = null;
        MandiTrendDTO mandiTrends = null;
        
        try {
            if(profile.getLocation() != null) {
                weather = dataIngestionClient.getWeatherAdvisory(profile.getLocation());
            }
            if(profile.getPrimaryCrop() != null) {
                mandiTrends = dataIngestionClient.getMandiTrends(profile.getPrimaryCrop());
            }
        } catch (Exception e) {
            log.error("Failed to fetch downstream data: {}", e.getMessage());
        }

        return new UnifiedDashboardResponse(profile, weather, mandiTrends, System.currentTimeMillis());
    }
}