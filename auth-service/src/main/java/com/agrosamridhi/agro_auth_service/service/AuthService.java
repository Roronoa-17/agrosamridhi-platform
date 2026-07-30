package com.agrosamridhi.agro_auth_service.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.agrosamridhi.agro_auth_service.dto.AuthResponse;
import com.agrosamridhi.agro_auth_service.dto.LoginRequest;
import com.agrosamridhi.agro_auth_service.dto.RegisterRequest;
import com.agrosamridhi.agro_auth_service.entity.Farmer;
import com.agrosamridhi.agro_auth_service.repository.FarmerRepository;
import com.agrosamridhi.agro_auth_service.security.JwtUtil;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

	private final FarmerRepository farmerRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;
	
	@Transactional
	public AuthResponse register(RegisterRequest req) {
		if(farmerRepository.existsByEmail(req.getEmail()))
			throw new ResponseStatusException(
					HttpStatus.CONFLICT,
					"Email Already Registered");
		
		if(farmerRepository.existsByPhone(req.getPhone()))
			throw new ResponseStatusException(
					HttpStatus.CONFLICT,
					"Phone number already Registered");
			
Farmer.CasteCategory casteCategory = req.getCasteCategory();
		if (casteCategory == null) {
			casteCategory = Farmer.CasteCategory.GEN;
		}
		if ("GENERAL".equalsIgnoreCase(String.valueOf(req.getCasteCategory()))) {
			casteCategory = Farmer.CasteCategory.GENERAL;
		}

		Farmer farmer=Farmer.builder()
				.name(req.getName())
				.email(req.getEmail())
				.phone(req.getPhone())
				.password(passwordEncoder.encode(req.getPassword()))
				.state(req.getState())
				.district(req.getDistrict())
				.landSizeAcres(req.getLandSizeAcres())
				.annualIncome(req.getAnnualIncome())
				.casteCategory(casteCategory)
				.preferredLanguage(req.getPreferredLanguage()!=null
							?req.getPreferredLanguage()
							:Farmer.Language.EN
							)
				.build();
				
		Farmer saved=farmerRepository.save(farmer);
		
		String token = jwtUtil.generateToken(saved.getFarmerId(), saved.getEmail());
		
		log.info("Farmer registered successfully: id={}, email={}, token={}",
				saved.getFarmerId(), saved.getEmail(), token);
		
		return buildResponse(saved,token);
			
	}
	
	public AuthResponse login(LoginRequest req) {
		Farmer farmer=farmerRepository.findByEmail(req.getEmail())
				.orElseThrow(()->new ResponseStatusException(
						HttpStatus.NOT_FOUND,"No account found with this email"));
		
		if(!passwordEncoder.matches(req.getPassword(), farmer.getPassword()))
			throw new ResponseStatusException(
					HttpStatus.UNAUTHORIZED,"Incorrect password");
		
		
		String token=jwtUtil.generateToken(farmer.getFarmerId(), farmer.getEmail());
		
		log.info("Farmer logged in: id={}, token={}", farmer.getFarmerId(), token);
		
		return buildResponse(farmer,token);
	}
	
	public Farmer getProfile(Long farmerId) {
		return farmerRepository.findById(farmerId)
				.orElseThrow(()->new ResponseStatusException(
						HttpStatus.NOT_FOUND,"Farmer not found"));
	}
	
	private AuthResponse buildResponse(Farmer f,String token) {
		return AuthResponse.builder()
				.token(token)
				.farmerId(f.getFarmerId())
				.name(f.getName())
				.email(f.getEmail())
				.state(f.getState())
				.district(f.getDistrict())
				.preferredLanguage(f.getPreferredLanguage()!=null
						?f.getPreferredLanguage().name():"EN")
				.build();
	}
}