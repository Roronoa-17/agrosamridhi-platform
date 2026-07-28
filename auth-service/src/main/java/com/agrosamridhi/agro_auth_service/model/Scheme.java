package com.agrosamridhi.agro_auth_service.model;


import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * POJO representing a government agricultural scheme.
 *
 * <p>Not a JPA entity — schemes are loaded once from {@code schemes.json} at
 * application startup and held in memory by {@link com.agrosamridhi.service.SchemeService}.
 * This avoids database overhead for static reference data that rarely changes.
 *
 * <p>Each scheme carries an {@link SchemeEligibility} inner object defining the
 * criteria that must be matched against a {@link com.agrosamridhi.entity.Farmer}'s
 * profile to determine eligibility.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Scheme {

    /** Unique scheme identifier, e.g. "PM-KISAN-001" */
    private String schemeId;

    /** Official scheme name */
    private String name;

    /** Short description of the monetary or non-monetary benefit */
    private String benefit;

    /** Implementing ministry/department */
    private String ministry;

    /** Detailed description of the scheme's purpose */
    private String description;

    /** Eligibility criteria for matching against farmer profile */
    private SchemeEligibility criteria;

    /** List of documents required to apply */
    private List<String> documents;

    /** Official online application / information URL */
    private String applyLink;

    // ================================================================ Inner Class ==

    /**
     * Eligibility criteria for a scheme.
     *
     * <p>Each field acts as a filter — if the farmer satisfies all applicable
     * criteria, the scheme is considered eligible. Fields with no constraint
     * use sentinel values (e.g., empty lists mean "all allowed").
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SchemeEligibility {

        /**
         * Maximum land holding in acres.
         * Use 99999 to represent "no upper limit" (all farmer sizes eligible).
         */
        private Double maxLandAcres;

        /**
         * Minimum annual income in INR (0 = no minimum).
         */
        private Long minIncome;

        /**
         * Maximum annual income in INR (99999999 = no upper limit).
         */
        private Long maxIncome;

        /**
         * Allowed caste categories. Empty list means all categories are eligible.
         * Values: "GEN", "OBC", "SC", "ST"
         */
        private List<String> allowedCaste;

        /**
         * Restricted to specific states. Empty list means all states are eligible.
         */
        private List<String> allowedStates;

        /**
         * Whether the scheme requires the farmer to have a bank account.
         */
        private boolean requiresBankAccount;

        /**
         * Whether the scheme requires Aadhaar card for application.
         */
        private boolean requiresAadhaar;
    }
}
