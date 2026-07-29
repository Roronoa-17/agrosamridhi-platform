package com.agrosamridhi.dataingestion.controller;

import com.agrosamridhi.dataingestion.entity.WeatherData;
import com.agrosamridhi.dataingestion.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    @Autowired
    private WeatherService weatherService;

    // this triggers to fetch and save data
    @PostMapping("/fetch")
    public String fetchWeatherData() {
        weatherService.fetchAndSaveWeatherData();
        return "Weather data successfully fetched and saved to MySQL.";
    }

    @GetMapping("/all")
    public List<WeatherData> getAllWeatherData() {
        return weatherService.getAllWeatherData();
    }

    @GetMapping("/advisory")
    public String getWeatherAdvisory(@RequestParam("district") String district) {
        return weatherService.generateWeatherAdvisory(district);
    }
}