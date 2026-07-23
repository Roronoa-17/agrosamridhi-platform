package com.agrosamridhi.agro_auth_service.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SchemeMatchResult {
	String name;
	String benefit;
	String category;
	String applyLink;
	int eligibilityScore;
	List<String> matchedCriteria;
	List<String> requiredDocuments;
}
