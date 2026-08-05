package com.agrosamriddhi.ai_inference_service.cropsuggestion;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agrosamriddhi.ai_inference_service.cropsuggestion.dto.CropSuggestionRequest;
import com.agrosamriddhi.ai_inference_service.cropsuggestion.dto.CropSuggestionResponse;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/ai")
public class CropSuggestionController {

    private final CropSuggestionService cropSuggestionService;

    public CropSuggestionController(CropSuggestionService cropSuggestionService) {
        this.cropSuggestionService = cropSuggestionService;
    }

    @PostMapping("/crop-suggestions")
    public Mono<CropSuggestionResponse> suggest(@RequestBody CropSuggestionRequest request) {
        return cropSuggestionService.suggest(request);
    }
}
