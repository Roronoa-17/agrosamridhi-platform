package com.agrosamridhi.dashboard_aggregator_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.agrosamridhi.dashboard_aggregator_service.dto.MandiTrendDTO;
import com.agrosamridhi.dashboard_aggregator_service.dto.WeatherAdvisoryDTO;

@FeignClient(name = "data-ingestion-service")
public interface DataIngestionClient {

	@GetMapping("/api/weather")
	WeatherAdvisoryDTO getWeatherAdvisory(@RequestParam("location") String location);

	@GetMapping("/api/mandi")
	MandiTrendDTO getMandiTrends(@RequestParam("crop") String crop);
}