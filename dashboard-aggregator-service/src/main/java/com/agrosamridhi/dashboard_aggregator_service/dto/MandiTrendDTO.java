package com.agrosamridhi.dashboard_aggregator_service.dto;
import lombok.Data;

@Data
public class MandiTrendDTO {
    private String cropName;
    private Double averagePrice;
    private Double minimumPrice;
    private Double maximumPrice;
    private Long totalRecords;
}