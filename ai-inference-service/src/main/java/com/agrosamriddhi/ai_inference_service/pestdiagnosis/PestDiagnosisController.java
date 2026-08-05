package com.agrosamriddhi.ai_inference_service.pestdiagnosis;

import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import com.agrosamriddhi.ai_inference_service.common.ImageUtils;
import com.agrosamriddhi.ai_inference_service.pestdiagnosis.dto.PestDiagnosisResponse;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/ai")
public class PestDiagnosisController {

    private final PestDiagnosisService pestDiagnosisService;

    public PestDiagnosisController(PestDiagnosisService pestDiagnosisService) {
        this.pestDiagnosisService = pestDiagnosisService;
    }

    @PostMapping("/pest-diagnosis")
    public Mono<PestDiagnosisResponse> diagnose(@RequestPart("file") FilePart filePart) {
        String mimeType = ImageUtils.resolveMimeType(filePart);

        return ImageUtils.toBase64(filePart)
                .flatMap(base64 -> pestDiagnosisService.diagnose(base64, mimeType));
    }
}
