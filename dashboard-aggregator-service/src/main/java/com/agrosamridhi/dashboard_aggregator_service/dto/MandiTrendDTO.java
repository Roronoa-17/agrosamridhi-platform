package com.agrosamridhi.dashboard_aggregator_service.dto;
import lombok.Data;

@Data
public class MandiTrendDTO {
    private String cropName;
    private Double currentPrice;
    private String trend; // e.g., "UP", "DOWN"
}