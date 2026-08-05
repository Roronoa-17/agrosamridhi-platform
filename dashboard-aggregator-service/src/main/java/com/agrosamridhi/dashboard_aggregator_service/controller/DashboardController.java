package com.agrosamridhi.dashboard_aggregator_service.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agrosamridhi.dashboard_aggregator_service.security.JwtUtil;
import com.agrosamridhi.dashboard_aggregator_service.service.DashboardAggregatorService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardAggregatorService dashboardService;
    private final JwtUtil jwtUtil;

    // Identity comes from the caller's own verified JWT, never from a client-supplied
    // path value - there is no legitimate reason for one farmer to view another's
    // aggregated profile/weather data.
    @GetMapping("/summary")
    public ResponseEntity<?> getDashboard(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        // Defense in depth: this service has no Spring Security filter chain of its
        // own, so it must not rely solely on the gateway having already checked the
        // token before forwarding the request.
        if (jwtUtil.extractFarmerId(authHeader) == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(dashboardService.getAggregatedDashboard());
    }
}