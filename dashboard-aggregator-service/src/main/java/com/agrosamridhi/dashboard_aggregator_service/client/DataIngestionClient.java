package com.agrosamridhi.dashboard_aggregator_service.client;

import com.agrosamridhi.dashboard_aggregator_service.config.FeignClientInterceptor;
import com.agrosamridhi.dashboard_aggregator_service.dto.MandiTrendDTO;
import com.agrosamridhi.dashboard_aggregator_service.dto.WeatherAdvisoryDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@FeignClient(name = "data-ingestion-service", configuration = FeignClientInterceptor.class)
public interface DataIngestionClient {
    
    @GetMapping("/api/data/weather")
    WeatherAdvisoryDTO getWeatherAdvisory(@RequestParam("location") String location);

    @GetMapping("/api/data/mandi")
    MandiTrendDTO getMandiTrends(@RequestParam("crop") String crop);
}