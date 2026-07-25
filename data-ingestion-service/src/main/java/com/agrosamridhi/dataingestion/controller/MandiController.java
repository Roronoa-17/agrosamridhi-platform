
package com.agrosamridhi.dataingestion.controller;

import com.agrosamridhi.dataingestion.entity.MandiPrice;
import com.agrosamridhi.dataingestion.service.MandiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mandi")
public class MandiController {

    @Autowired
    private MandiService mandiService;

    @GetMapping("/all")
    public List<MandiPrice> getAllMandiPrices() {
        return mandiService.getAllMandiPrices();
    }

    @PostMapping("/fetch")
public String fetchMandiPrices() {
    mandiService.fetchAndSaveMandiPrices();
    return "Mandi prices fetched successfully.";
}


    @GetMapping("/trends")
    public String getPriceTrend(@RequestParam String cropName) {
        return mandiService.getPriceTrend(cropName);
    }
}