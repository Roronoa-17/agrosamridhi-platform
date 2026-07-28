
package com.agrosamridhi.dataingestion.service.impl;
import com.agrosamridhi.dataingestion.entity.WeatherData;
import com.agrosamridhi.dataingestion.repository.WeatherRepository;
import com.agrosamridhi.dataingestion.service.WeatherService;
import com.agrosamridhi.dataingestion.dto.WeatherResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WeatherServiceImpl implements WeatherService {

private final WeatherRepository weatherRepository;
private final WebClient.Builder webClientBuilder;

@Value("${weather.api.url}")
private String weatherApiUrl;

public WeatherServiceImpl(WeatherRepository weatherRepository,
                          WebClient.Builder webClientBuilder) {
    this.weatherRepository = weatherRepository;
    this.webClientBuilder = webClientBuilder;
}



   
@Override
public void fetchAndSaveWeatherData() {

    Double latitude = 19.0760;
    Double longitude = 72.8777;

    WeatherResponse response = webClientBuilder.build()
            .get()
            .uri(weatherApiUrl +
                    "?latitude=" + latitude +
                    "&longitude=" + longitude +
                    "&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m")
            .retrieve()
            .bodyToMono(WeatherResponse.class)
            .block();

    if (response != null && response.getCurrent() != null) {

        WeatherData weatherData = new WeatherData();

        // done for testing
        weatherData.setDistrict("Mumbai");
        weatherData.setState("Maharashtra");
        weatherData.setLatitude(latitude);
        weatherData.setLongitude(longitude);

        weatherData.setTemperature(response.getCurrent().getTemperature_2m());
        weatherData.setHumidity(response.getCurrent().getRelative_humidity_2m().doubleValue());
        weatherData.setRainfall(response.getCurrent().getPrecipitation());
        weatherData.setWindSpeed(response.getCurrent().getWind_speed_10m());

        weatherData.setForecastDate(LocalDate.now());
        weatherData.setCreatedAt(LocalDateTime.now());

        weatherRepository.save(weatherData);
    }
}

    @Override
    public List<WeatherData> getAllWeatherData() {

        return weatherRepository.findAll();
    }

    @Override
    public String generateWeatherAdvisory(String district) {

        return "Weather advisory will be generated here.";
    }
}