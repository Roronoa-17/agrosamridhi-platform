package com.agrosamridhi.agro_auth_service.dto;

import java.util.List;

import com.agrosamridhi.agro_auth_service.model.Scheme;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SchemeMatchResult {
	String name;
	String benefit;
	String category;
	String applyLink;
	Scheme scheme;
	int eligibilityScore;
	List<String> matchedCriteria;
	List<String> unmatchedCriteria;
	List<String> requiredDocuments;
	
	
	public static SchemeMatchResult of(Scheme scheme,int eligibilityScore,
			List<String> matchedCriteria,List<String> unmatchedCriteria) {
		return SchemeMatchResult.builder()
				.scheme(scheme)
				.eligibilityScore(eligibilityScore)
				.matchedCriteria(matchedCriteria)
				.unmatchedCriteria(unmatchedCriteria)
				.build();
	}
}
