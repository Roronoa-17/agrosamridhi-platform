package com.agrosamriddhi.ai_inference_service.cropsuggestion;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.agrosamriddhi.ai_inference_service.cropsuggestion.dto.CropSuggestionRequest;

@Component
public class CropRuleEngine {

    private record Crop(String name, String season, double minPh, double maxPh,
                        String waterNeed, double approxCostPerAcre) { }

    private static final List<Crop> CROP_DB = List.of(
            new Crop("Rice",        "KHARIF", 5.0, 6.5, "HIGH",   35000),
            new Crop("Maize",       "KHARIF", 5.5, 7.5, "MEDIUM", 25000),
            new Crop("Cotton",      "KHARIF", 6.0, 8.0, "MEDIUM", 40000),
            new Crop("Soybean",     "KHARIF", 6.0, 7.5, "MEDIUM", 22000),
            new Crop("Wheat",       "RABI",   6.0, 7.5, "MEDIUM", 28000),
            new Crop("Chickpea",    "RABI",   6.0, 8.0, "LOW",    18000),
            new Crop("Mustard",     "RABI",   6.0, 7.5, "LOW",    15000),
            new Crop("Potato",      "RABI",   5.0, 6.5, "MEDIUM", 45000),
            new Crop("Watermelon",  "ZAID",   6.0, 7.0, "MEDIUM", 30000),
            new Crop("Cucumber",    "ZAID",   5.5, 7.0, "MEDIUM", 20000),
            new Crop("Muskmelon",   "ZAID",   6.0, 7.0, "MEDIUM", 25000)
    );

    public List<String> getEligibleCrops(CropSuggestionRequest req) {
        List<String> eligible = new ArrayList<>();

        for (Crop crop : CROP_DB) {

            if (req.getSeason() != null && !crop.season().equalsIgnoreCase(req.getSeason())) {
                continue;
            }

            if (req.getPh() != null && (req.getPh() < crop.minPh() || req.getPh() > crop.maxPh())) {
                continue;
            }

            if (req.getBudget() != null && crop.approxCostPerAcre() > req.getBudget()) {
                continue;
            }
            eligible.add(crop.name());
        }
        return eligible;
    }
}
