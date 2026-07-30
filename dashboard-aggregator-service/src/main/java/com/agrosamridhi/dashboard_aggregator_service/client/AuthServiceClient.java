package com.agrosamridhi.dashboard_aggregator_service.client;

import com.agrosamridhi.dashboard_aggregator_service.config.FeignClientInterceptor;
import com.agrosamridhi.dashboard_aggregator_service.dto.FarmerProfileDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "agro-auth-service", configuration = FeignClientInterceptor.class)
public interface AuthServiceClient {
    @GetMapping("/api/auth/profile/{id}")
    FarmerProfileDTO getProfile(@PathVariable("id") String id);
}