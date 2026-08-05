package com.agrosamridhi.agro_auth_service.security;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

@Component @Slf4j
public class JwtUtil {
	
	@Value("${app.jwt.secret}")
	private String secret;
	
	@Value("${app.jwt.expiration-ms}")
	private long expirationMs;
	
	private Key getKey() {
		return Keys.hmacShaKeyFor(secret.getBytes());
	}
	
	public String generateToken(Long farmerId, String email) {
		return Jwts.builder()
				.setSubject(email)
				.claim("farmerId", farmerId)
				.setIssuer("agro-auth-service")
				.setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis()+expirationMs))
				.signWith(getKey(),SignatureAlgorithm.HS256)
				.compact();
	}
	
	public boolean validateToken(String token) {
		try {
			Jwts.parserBuilder()
				.setSigningKey(getKey())
				.build()
				.parseClaimsJws(token);
			return true;
		} catch (JwtException ex) {
			log.warn("Invalid Jwt:{}",ex.getMessage());
			return false;
		} 
	}
	
	public String extractEmail(String token) {
		return getClaims(token).getSubject();
	}
	
	public Long extractFarmerId(String token) {
		Object id = getClaims(token).get("farmerId");
		if(id instanceof Number) {
			return ((Number) id).longValue();
		}
		return getClaims(token).get("farmerId",Long.class);
	}
	
	public Claims getClaims(String token) {
		return Jwts.parserBuilder()
				.setSigningKey(getKey()).build()
				.parseClaimsJws(token).getBody();
	}
}
