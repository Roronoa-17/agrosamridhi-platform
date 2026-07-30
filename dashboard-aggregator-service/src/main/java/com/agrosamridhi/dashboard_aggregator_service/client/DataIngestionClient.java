package com.agrosamridhi.dashboard_aggregator_service.client;

import com.agrosamridhi.dashboard_aggregator_service.config.FeignClientInterceptor;
import com.agrosamridhi.dashboard_aggregator_service.dto.MandiTrendDTO;
import com.agrosamridhi.dashboard_aggregator_service.dto.WeatherRecordDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@FeignClient(name = "data-ingestion-service", configuration = FeignClientInterceptor.class)
public interface DataIngestionClient {

    @GetMapping("/api/weather/advisory")
    String getWeatherAdvisory(@RequestParam("district") String district);

    @GetMapping("/api/weather/current")
    WeatherRecordDTO getCurrentWeather(@RequestParam("district") String district);

    @GetMapping("/api/mandi/trends")
    MandiTrendDTO getMandiTrends(@RequestParam("cropName") String cropName);
}