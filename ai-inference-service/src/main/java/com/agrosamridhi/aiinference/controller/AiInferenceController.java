package com.agrosamridhi.aiinference.controller;

import com.agrosamridhi.aiinference.AiInferenceServiceApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.agrosamridhi.aiinference.dto.CropAnalysisRequest;
import com.agrosamridhi.aiinference.dto.CropAnalysisResponse;
import com.agrosamridhi.aiinference.service.CropInferenceService;

import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/ai")
public class AiInferenceController {

    //private final AiInferenceServiceApplication aiInferenceServiceApplication;
    private final CropInferenceService inferenceService;

    @Autowired
    public AiInferenceController(CropInferenceService inferenceService) {
        this.inferenceService = inferenceService;
        //this.aiInferenceServiceApplication = aiInferenceServiceApplication;
    }

    @PostMapping(value="/analyze-crop", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CropAnalysisResponse analyzeCrop(
       
        @RequestPart("imageFile") MultipartFile imageFile) 
        {
        return inferenceService.analyzeCrop(imageFile);
    }
    
}