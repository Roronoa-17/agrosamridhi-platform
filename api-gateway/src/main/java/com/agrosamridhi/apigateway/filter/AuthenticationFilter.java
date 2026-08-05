package com.agrosamridhi.apigateway.filter;

import com.agrosamridhi.apigateway.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@Slf4j
public class AuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    // Exact-match only - every real endpoint under these services requires a
    // valid JWT. There is no publicly-readable schemes endpoint: /api/schemes/match
    // and /api/schemes/all both require auth (enforced again by auth-service's own
    // @PreAuthorize, but the gateway must not wave them through first).
    private final List<String> openApiEndpoints = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/actuator/health"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // CORS preflight requests never carry the Authorization header - let them
        // through so the browser's actual request isn't blocked as a CORS failure.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();

        // 1. If it's an exact public route, let it pass immediately.
        if (openApiEndpoints.contains(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Check for Token on protected routes
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Missing or Invalid Authorization Header");
            return;
        }

        // 3. Validate Token
        String token = authHeader.substring(7);
        try {
            jwtUtil.validateToken(token);
        } catch (Exception e) {
            log.warn("JWT validation failed: {} - {}", e.getClass().getSimpleName(), e.getMessage());
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Unauthorized Access - Invalid Token");
            return;
        }

        // 4. Token is good, continue routing
        filterChain.doFilter(request, response);
    }
}