package com.agrosamridhi.dashboard_aggregator_service.client;

import com.agrosamridhi.dashboard_aggregator_service.dto.FarmerProfileDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {

    @GetMapping("/api/auth/profile/{farmerId}")
    FarmerProfileDTO getProfile(@PathVariable("farmerId") String farmerId);
}