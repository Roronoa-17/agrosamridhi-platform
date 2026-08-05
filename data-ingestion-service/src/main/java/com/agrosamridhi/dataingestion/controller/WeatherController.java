package com.agrosamridhi.dataingestion.controller;

import com.agrosamridhi.dataingestion.entity.WeatherData;
import com.agrosamridhi.dataingestion.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    @Autowired
    private WeatherService weatherService;

    // this triggers to fetch and save data
    @PostMapping("/fetch")
    public String fetchWeatherData(@RequestParam(value = "district", required = false) String district) {
        if (district == null || district.isBlank()) {
            weatherService.fetchAndSaveWeatherData();
            return "Weather data successfully fetched and saved to MySQL.";
        }
        weatherService.fetchAndSaveWeatherData(district);
        return "Weather data for " + district + " successfully fetched and saved to MySQL.";
    }

    @GetMapping("/all")
    public List<WeatherData> getAllWeatherData() {
        return weatherService.getAllWeatherData();
    }

    @GetMapping("/advisory")
    public String getWeatherAdvisory(@RequestParam("district") String district) {
        return weatherService.generateWeatherAdvisory(district);
    }

    @GetMapping("/current")
    public ResponseEntity<WeatherData> getCurrentWeather(@RequestParam("district") String district) {
        WeatherData latest = weatherService.getLatestWeather(district);
        return latest == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(latest);
    }
}