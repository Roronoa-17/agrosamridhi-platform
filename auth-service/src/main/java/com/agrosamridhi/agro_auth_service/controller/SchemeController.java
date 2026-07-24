package com.agrosamridhi.agro_auth_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agrosamridhi.agro_auth_service.dto.SchemeMatchResult;
import com.agrosamridhi.agro_auth_service.entity.Farmer;
import com.agrosamridhi.agro_auth_service.repository.FarmerRepository;
import com.agrosamridhi.agro_auth_service.service.SchemeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/schemes")
@RequiredArgsConstructor
@Slf4j
public class SchemeController {
	
	private final SchemeService schemeService;
	private final FarmerRepository farmerRepository;
	
	@GetMapping("/match")
	@PreAuthorize("hasRole('FARMER')")
	public ResponseEntity<List<SchemeMatchResult>> matchSchemes(){
		
		Authentication auth=SecurityContextHolder
				.getContext().getAuthentication();
		Long farmerId=(Long)auth.getCredentials();
		
		Farmer farmer=farmerRepository.findById(farmerId)
				.orElseThrow();
		
		List<SchemeMatchResult> results=schemeService.matchSchemes(farmer);
		
		return ResponseEntity.ok(results);
	}
	
	@GetMapping("/all")
	@PreAuthorize("hasRole('FARMER')")
	public ResponseEntity<?> getAllSchemes(){
		return ResponseEntity.ok(schemeService.getAllSchemes());
	}
}
