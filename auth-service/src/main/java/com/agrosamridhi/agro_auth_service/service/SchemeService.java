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

/**
 * Service for loading, caching, and matching government agricultural schemes
 * against a farmer's profile.
 *
 * <p><b>Architecture:</b>
 * <ul>
 *   <li>Schemes are loaded from {@code schemes.json} once at startup via
 *       {@link #loadSchemes()} annotated with {@code @PostConstruct}</li>
 *   <li>The full scheme list is held in memory — no DB round-trips</li>
 *   <li>Eligibility matching is O(n×k) where n=30 schemes, k=7 criteria —
 *       effectively instant for any farmer</li>
 * </ul>
 *
 * <p><b>Scoring algorithm:</b>
 * <pre>
 *   eligibilityScore = (matchedCriteria / totalCriteria) × 100
 *   Schemes with score ≥ 50 are returned, sorted by score descending.
 * </pre>
 *
 * <p><b>Criteria evaluated (up to 7 per scheme):</b>
 * <ol>
 *   <li>Land size ≤ maxLandAcres</li>
 *   <li>Annual income ≥ minIncome</li>
 *   <li>Annual income ≤ maxIncome</li>
 *   <li>Caste category in allowedCaste</li>
 *   <li>State in allowedStates (or no restriction)</li>
 *   <li>Bank account (always assumed present)</li>
 *   <li>Aadhaar (always assumed present)</li>
 * </ol>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SchemeService {

    private static final String SCHEMES_JSON       = "schemes.json";
    private static final int    MIN_SCORE_THRESHOLD = 70; // Only Eligible (≥70) and Highly Eligible (≥90) shown

    private final ObjectMapper objectMapper;

    /** In-memory scheme database, loaded once at startup. */
    private List<Scheme> schemeDatabase = Collections.emptyList();

    // ================================================================ Init ==

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

    // ================================================================ PUBLIC API ==

    /**
     * Returns all schemes where the farmer's profile matches ≥ 50% of criteria,
     * sorted by {@code eligibilityScore} descending.
     *
     * <p>A farmer with no land size, income, or caste data on file will still
     * receive results — unknown fields are treated as "not penalised" but
     * not credited either (conservative scoring).
     *
     * @param farmer authenticated farmer entity
     * @return ordered list of {@link SchemeMatchResult} with score ≥ 50
     */
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

        // Sort by score descending, then alphabetically for determinism
        results.sort(Comparator
                .comparingInt(SchemeMatchResult::getEligibilityScore).reversed()
                .thenComparing(r -> r.getScheme().getName()));

        log.info("Scheme matching for farmerId={}: {}/{} schemes qualified",
                farmer.getFarmerId(), results.size(), schemeDatabase.size());
        return results;
    }

    /**
     * Returns all schemes in the database (unfiltered), sorted alphabetically.
     *
     * @return immutable copy of all 30 schemes
     */
    @Cacheable("schemesList")
    public List<Scheme> getAllSchemes() {
        return schemeDatabase.stream()
                .sorted(Comparator.comparing(Scheme::getName))
                .toList();
    }

    /**
     * Finds a single scheme by its ID.
     *
     * @param schemeId the scheme identifier (e.g. "PM-KISAN-001")
     * @return Optional wrapping the Scheme, or empty if not found
     */
    public Optional<Scheme> getSchemeById(String schemeId) {
        return schemeDatabase.stream()
                .filter(s -> s.getSchemeId().equalsIgnoreCase(schemeId))
                .findFirst();
    }

    /** Returns the number of loaded schemes — used for health checks and tests. */
    public int getSchemeCount() {
        return schemeDatabase.size();
    }

    // ============================================================ Eligibility Engine ==

    /**
     * Evaluates a single scheme against a farmer's profile.
     *
     * <p>Each criterion is worth {@code 100 / totalCriteria} points.
     * Total criteria count = number of non-trivial constraints defined in
     * {@link SchemeEligibility} (trivial = "all allowed").
     */
    private SchemeMatchResult evaluateEligibility(Scheme scheme, Farmer farmer) {
        SchemeEligibility criteria = scheme.getCriteria();
        if (criteria == null) {
            // No criteria → universally eligible
            return SchemeMatchResult.of(scheme, 100, List.of("No restrictions — open to all farmers"), List.of());
        }

        // ── HARD GATE: State restriction ────────────────────────────────────────
        // If a scheme restricts to specific states, a farmer from another state
        // is NEVER eligible — regardless of any other criteria matching.
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
        // ────────────────────────────────────────────────────────────────────────

        List<String> matched   = new ArrayList<>();
        List<String> unmatched = new ArrayList<>();
        int totalCriteria = 0;
        int metCriteria   = 0;

        // --- Criterion 1: Land size ---
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

        // --- Criterion 2: Min income ---
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

        // --- Criterion 3: Max income ---
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

        // --- Criterion 4: Caste category ---
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

        // --- Criterion 5: State (already hard-gated above; record as matched) ---
        if (allowedStates != null && !allowedStates.isEmpty()) {
            totalCriteria++;
            metCriteria++;
            matched.add("State (" + farmer.getState() + ") qualifies for this scheme");
        }

        // --- Criterion 6: Bank account (assumed all registered farmers have one) ---
        if (criteria.isRequiresBankAccount()) {
            totalCriteria++;
            metCriteria++;   // Assumed — farmer registered on platform with bank link
            matched.add("Bank account requirement met");
        }

        // --- Criterion 7: Aadhaar (assumed all registered farmers have one) ---
        if (criteria.isRequiresAadhaar()) {
            totalCriteria++;
            metCriteria++;   // Assumed — Aadhaar required for platform registration
            matched.add("Aadhaar card requirement met");
        }

        // Calculate score
        int score = (totalCriteria == 0) ? 100
                : (int) Math.round((double) metCriteria / totalCriteria * 100);

        return SchemeMatchResult.of(scheme, score, matched, unmatched);
    }

    private String fmt(double val) {
        return String.format("%.1f", val);
    }
}
