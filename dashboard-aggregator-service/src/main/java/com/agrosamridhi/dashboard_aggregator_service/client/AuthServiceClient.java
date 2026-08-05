package com.agrosamridhi.dashboard_aggregator_service.client;

import com.agrosamridhi.dashboard_aggregator_service.config.FeignClientInterceptor;
import com.agrosamridhi.dashboard_aggregator_service.dto.FarmerProfileDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

// FeignClientInterceptor forwards the caller's own Authorization header, so
// auth-service derives the farmer's identity from that JWT - no id parameter
// needed, and no way to request someone else's profile.
@FeignClient(name = "agro-auth-service", configuration = FeignClientInterceptor.class)
public interface AuthServiceClient {
    @GetMapping("/api/auth/profile")
    FarmerProfileDTO getProfile();
}