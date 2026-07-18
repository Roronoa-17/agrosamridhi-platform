package com.agrosamridhi.dataingestion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.web.reactive.function.client.WebClient;

@SpringBootApplication
@EnableDiscoveryClient
public class DataIngestionServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DataIngestionServiceApplication.class, args);
    }

    // Makes WebClient available for dependency injection
    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}