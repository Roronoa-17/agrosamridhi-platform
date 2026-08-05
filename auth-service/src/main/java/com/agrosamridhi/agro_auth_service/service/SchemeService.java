package com.agrosamridhi.agro_auth_service.service;


import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.agrosamridhi.agro_auth_service.dto.SchemeMatchResult;
import com.agrosamridhi.agro_auth_service.entity.Farmer;
import com.agrosamridhi.agro_auth_service.model.Scheme;
import com.agrosamridhi.agro_auth_service.model.Scheme.SchemeEligibility;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Service
@RequiredArgsConstructor
@Slf4j
public class SchemeService {

    private static final String SCHEMES_JSON       = "schemes.json";
    private static final int    MIN_SCORE_THRESHOLD = 70; 

    private final ObjectMapper objectMapper;

    private List<Scheme> schemeDatabase = Collections.emptyList();


    @PostConstruct
    public void loadSchemes() {
        try (InputStream is = new ClassPathResource(SCHEMES_JSON).getInputStream()) {
            schemeDatabase = objectMapper.readValue(is, new TypeReference<List<Scheme>>() {});
            log.info("Scheme database loaded: {} schemes from {}", schemeDatabase.size(), SCHEMES_JSON);
        } catch (IOException ex) {
            log.error("CRITICAL: Failed to load schemes.json — scheme matching unavailable: {}",
                    ex.getMessage(), ex);
            schemeDatabase = Collections.emptyList();
        }
    }

   
    public List<SchemeMatchResult> matchSchemes(Farmer farmer) {
        if (schemeDatabase.isEmpty()) {
            log.warn("Scheme database is empty — returning no results");
            return Collections.emptyList();
        }

        List<SchemeMatchResult> results = new ArrayList<>();

        for (Scheme scheme : schemeDatabase) {
            SchemeMatchResult match = evaluateEligibility(scheme, farmer);
            if (match.getEligibilityScore() >= MIN_SCORE_THRESHOLD) {
                results.add(match);
            }
        }

        results.sort(Comparator
                .comparingInt(SchemeMatchResult::getEligibilityScore).reversed()
                .thenComparing(r -> r.getScheme().getName()));

        log.info("Scheme matching for farmerId={}: {}/{} schemes qualified",
                farmer.getFarmerId(), results.size(), schemeDatabase.size());
        return results;
    }

  
    @Cacheable("schemesList")
    public List<Scheme> getAllSchemes() {
        return schemeDatabase.stream()
                .sorted(Comparator.comparing(Scheme::getName))
                .toList();
    }

   
    public Optional<Scheme> getSchemeById(String schemeId) {
        return schemeDatabase.stream()
                .filter(s -> s.getSchemeId().equalsIgnoreCase(schemeId))
                .findFirst();
    }

    public int getSchemeCount() {
        return schemeDatabase.size();
    }

 
    private SchemeMatchResult evaluateEligibility(Scheme scheme, Farmer farmer) {
        SchemeEligibility criteria = scheme.getCriteria();
        if (criteria == null) {
            return SchemeMatchResult.of(scheme, 100, List.of("No restrictions — open to all farmers"), List.of());
        }


        List<String> allowedStates = criteria.getAllowedStates();
        if (allowedStates != null && !allowedStates.isEmpty()) {
            String farmerState = farmer.getState() != null ? farmer.getState().trim() : "";
            boolean stateMatch = allowedStates.stream()
                    .anyMatch(s -> s.equalsIgnoreCase(farmerState));
            if (!stateMatch) {
                return SchemeMatchResult.of(scheme, 0,
                        List.of(),
                        List.of("This scheme is only available in: "
                                + String.join(", ", allowedStates)
                                + ". Your registered state: " + (farmerState.isEmpty() ? "Not specified" : farmerState)));
            }
        }

        List<String> matched   = new ArrayList<>();
        List<String> unmatched = new ArrayList<>();
        int totalCriteria = 0;
        int metCriteria   = 0;

        if (criteria.getMaxLandAcres() != null && criteria.getMaxLandAcres() < 9999) {
            totalCriteria++;
            double farmerLand = farmer.getLandSizeAcres() != null
                    ? farmer.getLandSizeAcres().doubleValue() : 0.0;
            if (farmerLand <= criteria.getMaxLandAcres()) {
                metCriteria++;
                matched.add("Land holding (" + fmt(farmerLand) + " acres) within limit of "
                        + fmt(criteria.getMaxLandAcres()) + " acres");
            } else {
                unmatched.add("Land holding (" + fmt(farmerLand) + " acres) exceeds limit of "
                        + fmt(criteria.getMaxLandAcres()) + " acres");
            }
        }

        if (criteria.getMinIncome() != null && criteria.getMinIncome() > 0) {
            totalCriteria++;
            long farmerIncome = farmer.getAnnualIncome() != null ? farmer.getAnnualIncome() : 0L;
            if (farmerIncome >= criteria.getMinIncome()) {
                metCriteria++;
                matched.add("Annual income meets minimum requirement of ₹" + criteria.getMinIncome());
            } else {
                unmatched.add("Annual income below minimum requirement of ₹" + criteria.getMinIncome());
            }
        }

        if (criteria.getMaxIncome() != null && criteria.getMaxIncome() < 9_000_000L) {
            totalCriteria++;
            long farmerIncome = farmer.getAnnualIncome() != null ? farmer.getAnnualIncome() : 0L;
            if (farmerIncome <= criteria.getMaxIncome()) {
                metCriteria++;
                matched.add("Annual income (₹" + farmerIncome + ") within scheme limit of ₹" + criteria.getMaxIncome());
            } else {
                unmatched.add("Annual income (₹" + farmerIncome + ") exceeds scheme limit of ₹" + criteria.getMaxIncome());
            }
        }

        List<String> allowedCastes = criteria.getAllowedCaste();
        if (allowedCastes != null && !allowedCastes.isEmpty()
                && !allowedCastes.containsAll(List.of("GEN", "OBC", "SC", "ST"))) {
            totalCriteria++;
            String farmerCaste = farmer.getCasteCategory() != null
                    ? farmer.getCasteCategory().name() : "";
            if (!farmerCaste.isEmpty() && allowedCastes.contains(farmerCaste)) {
                metCriteria++;
                matched.add("Caste category (" + farmerCaste + ") is eligible");
            } else if (farmerCaste.isEmpty()) {
                // Unknown caste — give partial credit (don't penalise missing data)
                metCriteria++;
                matched.add("Caste category not specified — assumed eligible");
            } else {
                unmatched.add("Caste category (" + farmerCaste + ") not in allowed list: "
                        + String.join(", ", allowedCastes));
            }
        }

        if (allowedStates != null && !allowedStates.isEmpty()) {
            totalCriteria++;
            metCriteria++;
            matched.add("State (" + farmer.getState() + ") qualifies for this scheme");
        }

        if (criteria.isRequiresBankAccount()) {
            totalCriteria++;
            metCriteria++;  
            matched.add("Bank account requirement met");
        }

        if (criteria.isRequiresAadhaar()) {
            totalCriteria++;
            metCriteria++;   
            matched.add("Aadhaar card requirement met");
        }

        int score = (totalCriteria == 0) ? 100
                : (int) Math.round((double) metCriteria / totalCriteria * 100);

        return SchemeMatchResult.of(scheme, score, matched, unmatched);
    }

    private String fmt(double val) {
        return String.format("%.1f", val);
    }
}
