package com.agrosamridhi.dataingestion.service;

import com.agrosamridhi.dataingestion.entity.WeatherData;
import java.util.List;

public interface WeatherService {

    void fetchAndSaveWeatherData();

    List<WeatherData> getAllWeatherData();

    String generateWeatherAdvisory(String district);
}