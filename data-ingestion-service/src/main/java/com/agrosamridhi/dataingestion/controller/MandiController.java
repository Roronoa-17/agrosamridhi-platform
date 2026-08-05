
package com.agrosamridhi.dataingestion.controller;

import com.agrosamridhi.dataingestion.dto.MandiTrendResponse;
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
    public List<MandiPrice> getAllMandiPrices(
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "district", required = false) String district) {
        return mandiService.getAllMandiPrices(state, district);
    }

    @PostMapping("/fetch")
public String fetchMandiPrices() {
    mandiService.fetchAndSaveMandiPrices();
    return "Mandi prices fetched successfully.";
}


@GetMapping("/trends")
public MandiTrendResponse getPriceTrend(
        @RequestParam("cropName") String cropName,
        @RequestParam(value = "state", required = false) String state,
        @RequestParam(value = "district", required = false) String district) {
    return mandiService.getPriceTrend(cropName, state, district);
}
}