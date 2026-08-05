package com.agrosamridhi.agro_auth_service.dto;

import java.math.BigDecimal;

import com.agrosamridhi.agro_auth_service.entity.Farmer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RegisterRequest {
	
	@NotBlank(message="Name is Required")
	String name;
	
	@Email(message="Invalid email format")
	@NotBlank(message="Email is required")
	String email;
	
	@Pattern(regexp="^[6-9]\\d{9}$",
			message="Enter valid 10-digit mobile number")
	String phone;
	
	@NotBlank(message="Password si required")
	String password;
	
	String state;
	String district;
	BigDecimal landSizeAcres;
	Long annualIncome;
	String primaryCrop;
	Farmer.CasteCategory casteCategory;
	Farmer.Language preferredLanguage;
}
