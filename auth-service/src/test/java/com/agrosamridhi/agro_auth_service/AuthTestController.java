package com.agrosamridhi.agro_auth_service;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.agrosamridhi.agro_auth_service.dto.LoginRequest;
import com.agrosamridhi.agro_auth_service.dto.RegisterRequest;
import com.agrosamridhi.agro_auth_service.entity.Farmer;
import com.agrosamridhi.agro_auth_service.repository.FarmerRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthTestController {

    @Autowired MockMvc      mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired FarmerRepository farmerRepository;

    private static final String EMAIL = "test@agro.com";
    private static final String PASS  = "Test@1234";

    @Test @Order(1)
    @DisplayName("Register — success returns 201 with token")
    void register_success() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .name("Test Farmer")
                .email(EMAIL)
                .phone("9876543210")
                .password(PASS)
                .state("Maharashtra")
                .district("Pune")
                .landSizeAcres(BigDecimal.valueOf(3.0))
                .casteCategory(Farmer.CasteCategory.GEN)
                .annualIncome(100000L)
                .preferredLanguage(Farmer.Language.EN)
                .build();

        mockMvc.perform(
                    post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req))
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.farmerId").isNumber())
                .andExpect(jsonPath("$.name").value("Test Farmer"));
    }

    @Test @Order(2)
    @DisplayName("Register — duplicate email returns 409 Conflict")
    void register_duplicateEmail() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .name("Another Farmer")
                .email(EMAIL)
                .phone("9123456789")
                .password(PASS)
                .state("Punjab")
                .district("Ludhiana")
                .build();

        mockMvc.perform(
                    post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req))
                )
                .andExpect(status().isConflict());
    }

    @Test @Order(3)
    @DisplayName("Login — correct credentials returns 200 with token")
    void login_success() throws Exception {
        LoginRequest req = new LoginRequest(EMAIL, PASS);

        mockMvc.perform(
                    post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test @Order(4)
    @DisplayName("Login — wrong password returns 401 Unauthorized")
    void login_wrongPassword() throws Exception {
        LoginRequest req = new LoginRequest(EMAIL, "WrongPass@99");

        mockMvc.perform(
                    post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req))
                )
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(5)
    @DisplayName("Profile — without token returns 401")
    void profile_noToken() throws Exception {
        mockMvc.perform(get("/api/auth/profile"))
                .andExpect(status().isUnauthorized());
    }

    @AfterAll
    static void cleanup(@Autowired FarmerRepository repo) {
        repo.findByEmail(EMAIL).ifPresent(repo::delete);
    }
}