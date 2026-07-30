package com.agrosamridhi.apigateway.filter;

import com.agrosamridhi.apigateway.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class AuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    // Only allow the login/register endpoints and public scheme endpoints without a token.
    private final List<String> openApiEndpoints = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/schemes",
            "/api/schemes/",
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

        // 1. If it's a public route, let it pass immediately
        // Using a standard for-loop guarantees absolutely zero type-inference errors!
        boolean isPublic = false;
        for (String endpoint : openApiEndpoints) {
            if (path.contains(endpoint)) {
                isPublic = true;
                break;
            }
        }

        if (isPublic) {
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
            System.out.println("JWT VALIDATION FAILED: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Unauthorized Access - Invalid Token");
            return;
        }

        // 4. Token is good, continue routing
        filterChain.doFilter(request, response);
    }
}