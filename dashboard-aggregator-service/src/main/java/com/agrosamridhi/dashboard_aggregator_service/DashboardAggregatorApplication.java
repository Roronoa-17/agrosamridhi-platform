package com.agrosamridhi.dashboard_aggregator_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class DashboardAggregatorApplication {

    public static void main(String[] args) {
        SpringApplication.run(DashboardAggregatorApplication.class, args);
    }
}