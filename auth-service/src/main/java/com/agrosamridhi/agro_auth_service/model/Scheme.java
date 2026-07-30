package com.agrosamridhi.agro_auth_service.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Scheme {

    private String schemeId;
    private String name;
    private String benefit;
    private String ministry;
    private String description;
    private SchemeEligibility criteria;
    private List<String> documents;
    private String applyLink;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SchemeEligibility {

        private Double maxLandAcres;
        private Long minIncome;
        private Long maxIncome;
        private List<String> allowedCaste;
        private List<String> allowedStates;
        private boolean requiresBankAccount;
        private boolean requiresAadhaar;
    }
}