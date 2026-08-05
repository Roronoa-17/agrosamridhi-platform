package com.agrosamridhi.dataingestion.service;

import com.agrosamridhi.dataingestion.dto.MandiTrendResponse;
import com.agrosamridhi.dataingestion.entity.MandiPrice;

import java.util.List;

public interface MandiService {

    void fetchAndSaveMandiPrices();

    List<MandiPrice> getAllMandiPrices(String state, String district);

    MandiTrendResponse getPriceTrend(String cropName, String state, String district);
}