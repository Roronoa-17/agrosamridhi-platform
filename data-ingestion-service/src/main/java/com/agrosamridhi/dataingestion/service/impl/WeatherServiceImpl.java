
package com.agrosamridhi.dataingestion.service.impl;
import com.agrosamridhi.dataingestion.entity.WeatherData;
import com.agrosamridhi.dataingestion.repository.WeatherRepository;
import com.agrosamridhi.dataingestion.service.WeatherService;
import com.agrosamridhi.dataingestion.dto.GeocodingResponse;
import com.agrosamridhi.dataingestion.dto.WeatherResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClient;
import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;
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

@Value("${weather.geocoding.url}")
private String geocodingApiUrl;

@Value("${weather.default.latitude}")
private Double defaultLatitude;

@Value("${weather.default.longitude}")
private Double defaultLongitude;

@Value("${weather.default.district}")
private String defaultDistrict;

@Value("${weather.default.state}")
private String defaultState;

public WeatherServiceImpl(WeatherRepository weatherRepository,
                          WebClient.Builder webClientBuilder) {
    this.weatherRepository = weatherRepository;
    this.webClientBuilder = webClientBuilder;
}




@Override
public void fetchAndSaveWeatherData() {
    fetchAndSave(defaultDistrict, defaultState, defaultLatitude, defaultLongitude);
}

@Override
public void fetchAndSaveWeatherData(String district) {
    if (district == null || district.isBlank()) {
        fetchAndSaveWeatherData();
        return;
    }

    GeocodingResponse.Result location = geocodeDistrict(district);
    if (location == null) {
        throw new IllegalArgumentException("Could not resolve location for district: " + district);
    }

    fetchAndSave(district, location.getAdmin1(), location.getLatitude(), location.getLongitude());
}

private GeocodingResponse.Result geocodeDistrict(String district) {
    String encodedDistrict = URLEncoder.encode(district, StandardCharsets.UTF_8);
    GeocodingResponse response = webClientBuilder.build()
            .get()
            .uri(geocodingApiUrl +
                    "?name=" + encodedDistrict +
                    "&count=1&language=en&format=json")
            .retrieve()
            .bodyToMono(GeocodingResponse.class)
            .block();

    if (response == null || response.getResults() == null || response.getResults().isEmpty()) {
        return null;
    }
    return response.getResults().get(0);
}

private void fetchAndSave(String district, String state, Double latitude, Double longitude) {

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

        weatherData.setDistrict(district);
        weatherData.setState(state);
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
    public WeatherData getLatestWeather(String district) {
        List<WeatherData> weatherList = weatherRepository.findByDistrictOrderByCreatedAtDesc(district);
        return (weatherList == null || weatherList.isEmpty()) ? null : weatherList.get(0);
    }

    @Override
    public String generateWeatherAdvisory(String district) {
        // 1. Fetch the most recent entry for this district
        WeatherData currentData = getLatestWeather(district);

        if (currentData == null) {
            return "No weather data found for " + district + ". Please run the /fetch endpoint first.";
        }

        // 3. Generate the advisory
        StringBuilder advisory = new StringBuilder();
        advisory.append("Advisory for ").append(district).append(":\n");
        advisory.append("Current Temp: ").append(currentData.getTemperature()).append("°C.\n");
        
        if (currentData.getTemperature() != null && currentData.getTemperature() > 35.0) {
            advisory.append("WARNING: High heat detected. Increase irrigation frequency to prevent crop stress.");
        } else if (currentData.getRainfall() != null && currentData.getRainfall() > 10.0) {
            advisory.append("ALERT: Heavy rainfall expected. Ensure proper field drainage and delay pesticide spraying.");
        } else {
            advisory.append("Conditions are optimal. Continue standard farming schedules.");
        }
        
        return advisory.toString();
    }
}