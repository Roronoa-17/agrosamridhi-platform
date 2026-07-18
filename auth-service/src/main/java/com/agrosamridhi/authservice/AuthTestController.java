package com.agrosamridhi.authservice;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthTestController {

    @GetMapping("/status")
    public String getStatus() {
        return "Auth Service is up and running securely through the API Gateway!";
    }
}