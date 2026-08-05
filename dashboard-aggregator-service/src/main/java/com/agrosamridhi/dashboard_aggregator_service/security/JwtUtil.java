package com.agrosamridhi.dashboard_aggregator_service.security;

import java.security.Key;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Verifies the JWT issued by auth-service so the caller's own farmerId can be
 * derived from a trusted source, rather than accepted as a client-supplied
 * path variable.
 */
@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Returns the authenticated farmerId, or null if the token is missing/invalid.
     */
    public Long extractFarmerId(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            return null;
        }
        String token = bearerToken.substring(7);
        try {
            Object id = Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .get("farmerId");
            return id instanceof Number ? ((Number) id).longValue() : null;
        } catch (JwtException | IllegalArgumentException ex) {
            return null;
        }
    }
}
