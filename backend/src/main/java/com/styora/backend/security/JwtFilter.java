package com.styora.backend.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 🎓 LESSON: What is a Filter?
 *
 * Every HTTP request to your server passes through a "filter chain" before
 * reaching your controller.
 * Think of it like airport security — your bag (request) is checked at multiple
 * checkpoints.
 *
 * OncePerRequestFilter means this filter runs exactly once per request (Spring
 * guarantee).
 *
 * What this filter does:
 * 1. Reads the "Authorization" header from the request
 * 2. Extracts the JWT token (format: "Bearer eyJhbGci...")
 * 3. Validates the token with JwtUtil
 * 4. If valid, tells Spring Security "this user is authenticated" — so
 * controllers can run
 * 5. If invalid/missing, does nothing — Spring Security will block the request
 * (401 Unauthorized)
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService; // Spring Security's built-in way to load a user

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Step 1: Get the Authorization header from the request
        String authHeader = request.getHeader("Authorization");

        String token = null;
        String email = null;

        // Step 2: The token format is "Bearer eyJhbGci..."
        // Check it starts with "Bearer " and extract the token part
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Remove the "Bearer " prefix (7 characters)
            email = jwtUtil.extractEmail(token); // Read the email from the token payload
        }

        // Step 3: If we found an email AND no one is already authenticated in this
        // request
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Load the UserDetails from the database using the email
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // Step 4: Validate the token against the loaded user
            if (jwtUtil.isTokenValid(token, userDetails.getUsername())) {
                // Step 5: Create an authentication object and give it to Spring Security
                // This is like showing your valid ID at the checkpoint
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null, // No credentials needed (we already have the token)
                        userDetails.getAuthorities() // User's roles/permissions
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                // ✅ From this point on, this request is "authenticated"
            }
        }

        // Step 6: Always pass the request to the next filter in the chain
        filterChain.doFilter(request, response);
    }
}
