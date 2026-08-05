package com.agrosamriddhi.ai_inference_service.common;

import java.util.Base64;
import java.util.Set;

import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.server.ResponseStatusException;

import reactor.core.publisher.Mono;

public class ImageUtils {

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private ImageUtils() { }

    public static Mono<String> toBase64(FilePart filePart) {
        return DataBufferUtils.join(filePart.content())
                .map(dataBuffer -> {
                    int size = dataBuffer.readableByteCount();
                    if (size > MAX_FILE_SIZE_BYTES) {
                        DataBufferUtils.release(dataBuffer);
                        throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,
                                "Image exceeds maximum allowed size of 5MB");
                    }
                    byte[] bytes = new byte[size];
                    dataBuffer.read(bytes);
                    DataBufferUtils.release(dataBuffer);
                    return Base64.getEncoder().encodeToString(bytes);
                });
    }

    public static String resolveMimeType(FilePart filePart) {
        String mimeType = filePart.headers().getContentType() != null
                ? filePart.headers().getContentType().toString()
                : null;
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unsupported file type - only JPEG, PNG, and WEBP images are accepted");
        }
        return mimeType;
    }
}
