package com.agrosamridhi.dataingestion.service;
import com.agrosamridhi.dataingestion.entity.MandiPrice;
import java.util.List;

public interface MandiService {

    void fetchAndSaveMandiPrices();

    List<MandiPrice> getAllMandiPrices();

    String getPriceTrend(String cropName);
}