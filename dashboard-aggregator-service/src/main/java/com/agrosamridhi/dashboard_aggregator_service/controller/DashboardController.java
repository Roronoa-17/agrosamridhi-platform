package com.agrosamridhi.dashboard_aggregator_service.controller;

import com.agrosamridhi.dashboard_aggregator_service.dto.UnifiedDashboardResponse;
import com.agrosamridhi.dashboard_aggregator_service.service.DashboardAggregatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardAggregatorService dashboardService;
    
    public DashboardController(DashboardAggregatorService dashboardService) {
    	this.dashboardService = dashboardService;
    }
    @GetMapping("/{farmerId}")
    public ResponseEntity<UnifiedDashboardResponse> getDashboard(@PathVariable String farmerId) {
        return ResponseEntity.ok(dashboardService.getAggregatedDashboard(farmerId));
    }
}