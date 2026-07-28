package com.agrosamridhi.agro_auth_service.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {
	String token;
	Long farmerId;
	String name;
	String email;
	String state;
	String district;
	String preferredLanguage;
}
