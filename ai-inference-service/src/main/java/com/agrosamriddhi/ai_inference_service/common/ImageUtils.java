package com.agrosamriddhi.ai_inference_service.common;

import java.util.Base64;

import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.codec.multipart.FilePart;

import reactor.core.publisher.Mono;

public class ImageUtils {

    private ImageUtils() { }

    public static Mono<String> toBase64(FilePart filePart) {
        return DataBufferUtils.join(filePart.content())
                .map(dataBuffer -> {
                    byte[] bytes = new byte[dataBuffer.readableByteCount()];
                    dataBuffer.read(bytes);
                    DataBufferUtils.release(dataBuffer);
                    return Base64.getEncoder().encodeToString(bytes);
                });
    }

    public static String resolveMimeType(FilePart filePart) {
        return filePart.headers().getContentType() != null
                ? filePart.headers().getContentType().toString()
                : "image/jpeg";
    }
}
