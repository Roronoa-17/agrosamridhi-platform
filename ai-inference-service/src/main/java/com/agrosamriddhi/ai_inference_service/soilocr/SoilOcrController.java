package com.agrosamriddhi.ai_inference_service.soilocr;

import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import com.agrosamriddhi.ai_inference_service.common.ImageUtils;
import com.agrosamriddhi.ai_inference_service.soilocr.dto.SoilNutrientsResponse;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/ai")
public class SoilOcrController {

    private final SoilOcrService soilOcrService;

    public SoilOcrController(SoilOcrService soilOcrService) {
        this.soilOcrService = soilOcrService;
    }

    @PostMapping("/soil-ocr")
    public Mono<SoilNutrientsResponse> soilOcr(@RequestPart("file") FilePart filePart) {
        String mimeType = ImageUtils.resolveMimeType(filePart);

        return ImageUtils.toBase64(filePart)
                .flatMap(base64 -> soilOcrService.extractNutrients(base64, mimeType));
    }
}
