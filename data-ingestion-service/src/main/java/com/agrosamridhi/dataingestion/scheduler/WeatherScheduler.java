package com.agrosamridhi.dataingestion.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.agrosamridhi.dataingestion.service.WeatherService;

@Component
public class WeatherScheduler {

    private final WeatherService weatherService;

    public WeatherScheduler(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @Scheduled(cron = "0 0 */6 * * *")
    public void fetchWeatherData() {

        weatherService.fetchAndSaveWeatherData();

        System.out.println("Weather data updated successfully.");
    }
}