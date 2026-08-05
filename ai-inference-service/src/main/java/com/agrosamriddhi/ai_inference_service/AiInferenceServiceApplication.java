package com.agrosamriddhi.ai_inference_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AiInferenceServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiInferenceServiceApplication.class, args);
    }
}
