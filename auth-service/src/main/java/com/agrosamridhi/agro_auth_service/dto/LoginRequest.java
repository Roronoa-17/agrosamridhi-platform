package com.agrosamridhi.agro_auth_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {
	@JsonProperty("email")
	String email;
	@JsonProperty("password")
	String password;
}