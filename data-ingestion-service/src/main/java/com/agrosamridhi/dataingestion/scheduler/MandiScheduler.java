package com.agrosamridhi.dataingestion.scheduler;

import com.agrosamridhi.dataingestion.service.MandiService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class MandiScheduler {

    private final MandiService mandiService;

    public MandiScheduler(MandiService mandiService) {
        this.mandiService = mandiService;
    }

    @Scheduled(cron = "0 30 */6 * * *")
    public void fetchMandiPrices() {

        mandiService.fetchAndSaveMandiPrices();

        System.out.println("Mandi prices updated successfully.");
    }
}