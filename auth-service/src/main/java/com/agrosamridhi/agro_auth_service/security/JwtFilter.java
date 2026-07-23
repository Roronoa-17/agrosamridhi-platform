package com.agrosamridhi.agro_auth_service.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication
    .UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority
    .SimpleGrantedAuthority;
import org.springframework.security.core.context
    .SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter{
	
	private final JwtUtil jwtUtil;
	
	@Override
	protected void doFilterInternal(
			HttpServletRequest req,
			HttpServletResponse res,
			FilterChain chain
			) throws ServletException, IOException{
		String header = req.getHeader("Authorization");
		
		if(header!=null && header.startsWith("Bearer ")) {
			String token=header.substring(7);
			
			if(jwtUtil.validateToken(token)) {
				String email=jwtUtil.extractEmail(token);
				Long farmerId=jwtUtil.extractFarmerId(token);
				
				var auth=new UsernamePasswordAuthenticationToken(
						email,
						farmerId,
						List.of(new SimpleGrantedAuthority("ROLE_FARMER"))
						);
				
				SecurityContextHolder
					.getContext()
					.setAuthentication(auth);
				
			}
		}
		
		chain.doFilter(req, res);
	}
}
