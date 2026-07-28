package com.agrosamridhi.dashboard_aggregator_service.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.agrosamridhi.dashboard_aggregator_service.client.AuthServiceClient;
import com.agrosamridhi.dashboard_aggregator_service.client.DataIngestionClient;
import com.agrosamridhi.dashboard_aggregator_service.dto.FarmerProfileDTO;
import com.agrosamridhi.dashboard_aggregator_service.dto.MandiTrendDTO;
import com.agrosamridhi.dashboard_aggregator_service.dto.UnifiedDashboardResponse;
import com.agrosamridhi.dashboard_aggregator_service.dto.WeatherAdvisoryDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardAggregatorService {

    private  AuthServiceClient authServiceClient;
    private  DataIngestionClient dataIngestionClient;

    @Cacheable(value = "dashboardCache", key = "#farmerId")
    public UnifiedDashboardResponse getAggregatedDashboard(String farmerId) {
        FarmerProfileDTO profile = authServiceClient.getProfile(farmerId);

        WeatherAdvisoryDTO weather = dataIngestionClient.getWeatherAdvisory(profile.getLocation());
        MandiTrendDTO mandiTrends = dataIngestionClient.getMandiTrends(profile.getPrimaryCrop());

        return new UnifiedDashboardResponse(profile,weather,mandiTrends,System.currentTimeMillis());
    }
} 