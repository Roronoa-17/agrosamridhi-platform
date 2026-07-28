package com.agrosamridhi.aiinference.controller;

import com.agrosamridhi.aiinference.AiInferenceServiceApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.agrosamridhi.aiinference.dto.CropAnalysisRequest;
import com.agrosamridhi.aiinference.dto.CropAnalysisResponse;
import com.agrosamridhi.aiinference.dto.CropSuggestionRequest;
import com.agrosamridhi.aiinference.service.CropInferenceService;
import com.agrosamridhi.aiinference.service.CropSuggestionService;
import com.agrosamridhi.aiinference.service.SoilOcrService;

import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/ai")
public class AiInferenceController {

    //private final AiInferenceServiceApplication aiInferenceServiceApplication;
    private final CropInferenceService inferenceService;
    private final SoilOcrService soilOcrService;
    private final CropSuggestionService suggestionService;

    @Autowired
    public AiInferenceController(CropInferenceService inferenceService, SoilOcrService soilOcrService, CropSuggestionService suggestionService) {
        this.inferenceService = inferenceService;
        //this.aiInferenceServiceApplication = aiInferenceServiceApplication;
        this.suggestionService = suggestionService;
        this.soilOcrService = soilOcrService;
    }

    // Pest & Disease Diagnosis 
    @PostMapping(value="/analyze-crop", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CropAnalysisResponse analyzeCrop(
       
        @RequestPart("imageFile") MultipartFile imageFile) 
        {
        return inferenceService.analyzeCrop(imageFile);
    }

    @PostMapping(value="analyze-soil-card", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity analyzeSoilCard(@RequestPart("imageFile") MultipartFile imageFile) {
        return ResponseEntity.ok(soilOcrService.analyzeSoilCard(imageFile));
    }

    // AI Crop Suggestion Engine 
    @PostMapping(value = "/suggest-crops", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity suggestCrops(@RequestBody CropSuggestionRequest request) {
        return ResponseEntity.ok(suggestionService.suggestCrops(request));
    }
    
}