package com.agrosamridhi.dashboard_aggregator_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MandiTrendDTO implements Serializable {
    private String cropName;
    private Double currentPrice;
    private String priceTrend90Days;
}