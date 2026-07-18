package com.agrosamridhi.aiinference;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiInferenceController {

    @GetMapping("/predict-yield")
    public Map predictYield() {
        return Map.of(
            "model", "CropYieldPredictor-v1",
            "predictedYieldQuintalsPerAcre", 18.5,
            "confidenceScore", "94.2%",
            "status", "Inference processed successfully"
        );
    }
}