package com.styora.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.Customizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * 🎓 LESSON: What is SecurityConfig?
 *
 * This is the "master rulebook" for your API's security.
 * It answers three key questions:
 * 1. WHICH endpoints are public? (Anyone can call /api/auth/signup,
 * /api/auth/login)
 * 2. WHICH endpoints are protected? (Only logged-in users with a valid JWT can
 * call /api/orders/**, etc.)
 * 3. HOW are passwords stored? (BCrypt — a one-way hash, never plain text)
 *
 * Key Concepts:
 * - @Configuration: This class provides Spring "beans" (objects it manages)
 * - @EnableWebSecurity: Activates Spring Security for this application
 * - SessionCreationPolicy.STATELESS: We DON'T use sessions/cookies.
 * Instead, every request must carry its own JWT. This is perfect for REST APIs.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    /**
     * PasswordEncoder Bean — BCryptPasswordEncoder.
     *
     * When saving a password: encoder.encode("hello123") → "$2a$10$..."
     * When checking a password: encoder.matches("hello123", "$2a$10$...") →
     * true/false
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * AuthenticationManager — Spring's built-in component that handles the
     * "does this username + password match what's in the database?" check.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // 🎓 NOTE: We no longer need to manually create DaoAuthenticationProvider.
    // Spring Boot 3.x automatically detects our PasswordEncoder +
    // UserDetailsService beans
    // and wires them together. This eliminates the deprecation warnings!

    /**
     * SecurityFilterChain — THE MAIN SECURITY CONFIGURATION.
     *
     * This defines EXACTLY which URLs are allowed and which are blocked.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF (Cross-Site Request Forgery).
                // CSRF protection is for browser session-based apps (cookies).
                // Our API uses JWT tokens (stateless), so CSRF protection is unnecessary and
                // would block our calls.
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())

                // AUTHORIZATION RULES: who can access what?
                .authorizeHttpRequests(auth -> auth
                        // ✅ PUBLIC routes — no token needed
                        .requestMatchers(
                                "/api/auth/**", // signup and login
                                "/h2-console/**", // H2 database browser (for development)
                                "/api/products/**", // Anyone can browse products
                                "/api/ai/**" // Anyone can see recommendations
                        ).permitAll()
                        // 🔒 EVERYTHING ELSE requires a valid JWT token
                        .anyRequest().authenticated())

                // Use STATELESS session management — no server-side sessions, we rely purely on
                // JWT
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Allow H2 console to display properly (it uses frames, which Spring Security
                // blocks by default)
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))

                // Register our JWT filter. It runs BEFORE Spring's default login filter.
                // So the request is either authenticated via JWT by our filter, or blocked.
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); // Support all origins in dev
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "accept",
                "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration
                .setExposedHeaders(Arrays.asList("Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
