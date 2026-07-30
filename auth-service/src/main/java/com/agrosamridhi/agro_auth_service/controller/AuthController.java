package com.agrosamridhi.agro_auth_service.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import com.agrosamridhi.agro_auth_service.dto.AuthResponse;
import com.agrosamridhi.agro_auth_service.dto.LoginRequest;
import com.agrosamridhi.agro_auth_service.dto.RegisterRequest;
import com.agrosamridhi.agro_auth_service.entity.Farmer;
import com.agrosamridhi.agro_auth_service.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
	
	private final AuthService authService;
	
	@PostMapping("/register")
	public ResponseEntity<AuthResponse> register(
			@Valid @RequestBody RegisterRequest req){
		log.info("Register request received: email={}",req.getEmail());
		
		return ResponseEntity
				.status(HttpStatus.CREATED)
				.body(authService.register(req));
	}
	
	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(
			@RequestBody LoginRequest req){
		log.info("Login request received: email={}", req.getEmail());
		AuthResponse response = authService.login(req);
		log.info("Login response body: {}", response);
		return ResponseEntity.ok(response);
	}
	
	@GetMapping("/profile")
	@PreAuthorize("hasAuthority('FARMER') or hasRole('FARMER')") 
	public ResponseEntity<Farmer> getProfile(){
		Authentication auth=SecurityContextHolder
				.getContext()
				.getAuthentication();
		
		Long farmerId=(Long)auth.getCredentials();
		return ResponseEntity.ok(authService.getProfile(farmerId));
	}


	@GetMapping("/profile/{id}")
	public ResponseEntity getProfileById(@PathVariable Long id) {
		// This reuses your existing AuthService logic to find the farmer by ID
		return ResponseEntity.ok(authService.getProfile(id));
	}
}
