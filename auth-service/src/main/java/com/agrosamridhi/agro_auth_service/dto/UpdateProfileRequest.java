package com.agrosamridhi.agro_auth_service.dto;

import java.math.BigDecimal;

import com.agrosamridhi.agro_auth_service.entity.Farmer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

@Getter
public class UpdateProfileRequest {

	@NotBlank(message = "Name is Required")
	String name;

	@Pattern(regexp = "^[6-9]\\d{9}$",
			message = "Enter valid 10-digit mobile number")
	String phone;

	String state;
	String district;
	BigDecimal landSizeAcres;
	Long annualIncome;
	String primaryCrop;
	Farmer.CasteCategory casteCategory;
	Farmer.Language preferredLanguage;
}
