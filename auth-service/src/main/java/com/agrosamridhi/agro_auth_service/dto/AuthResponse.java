package com.agrosamridhi.agro_auth_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.ALWAYS)
public class AuthResponse {
	@JsonProperty("token")
	private String token;
	@JsonProperty("farmerId")
	private Long farmerId;
	@JsonProperty("name")
	private String name;
	@JsonProperty("email")
	private String email;
	@JsonProperty("state")
	private String state;
	@JsonProperty("district")
	private String district;
	@JsonProperty("preferredLanguage")
	private String preferredLanguage;
}
