package com.agrosamridhi.dashboard_aggregator_service.service;

import com.agrosamridhi.dashboard_aggregator_service.client.AuthServiceClient;
import com.agrosamridhi.dashboard_aggregator_service.client.DataIngestionClient;
import com.agrosamridhi.dashboard_aggregator_service.dto.FarmerProfileDTO;
import com.agrosamridhi.dashboard_aggregator_service.dto.MandiTrendDTO;
import com.agrosamridhi.dashboard_aggregator_service.dto.UnifiedDashboardResponse;
import com.agrosamridhi.dashboard_aggregator_service.dto.WeatherAdvisoryDTO;
import com.agrosamridhi.dashboard_aggregator_service.dto.WeatherRecordDTO;
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

        // 2. Each downstream call fails independently so one outage doesn't blank the whole card
        WeatherAdvisoryDTO weather = null;
        MandiTrendDTO mandiTrends = null;

        if (profile.getLocation() != null) {
            weather = fetchWeather(profile.getLocation());
        }
        if (profile.getPrimaryCrop() != null) {
            try {
                mandiTrends = dataIngestionClient.getMandiTrends(profile.getPrimaryCrop());
            } catch (Exception e) {
                log.error("Failed to fetch mandi trends for crop {}: {}", profile.getPrimaryCrop(), e.getMessage());
            }
        }

        return new UnifiedDashboardResponse(profile, weather, mandiTrends, System.currentTimeMillis());
    }

    private WeatherAdvisoryDTO fetchWeather(String district) {
        WeatherAdvisoryDTO weather = new WeatherAdvisoryDTO();

        try {
            weather.setAdvisoryMessage(dataIngestionClient.getWeatherAdvisory(district));
        } catch (Exception e) {
            log.error("Failed to fetch weather advisory for {}: {}", district, e.getMessage());
        }

        try {
            WeatherRecordDTO current = dataIngestionClient.getCurrentWeather(district);
            if (current != null) {
                weather.setTemperature(current.getTemperature() != null ? current.getTemperature() + "°C" : null);
                weather.setCondition(current.getRainfall() != null && current.getRainfall() > 0.0 ? "Rainy" : "Clear");
            }
        } catch (Exception e) {
            log.error("Failed to fetch current weather for {}: {}", district, e.getMessage());
        }

        return weather;
    }
}