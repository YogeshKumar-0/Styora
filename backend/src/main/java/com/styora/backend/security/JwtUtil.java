package com.styora.backend.security;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

/**
 * 🎓 LESSON: What is JwtUtil?
 *
 * Think of a JWT like a signed hotel key card.
 * - generateToken() → The hotel "creates" a key card and embeds your room
 * number (email) into it.
 * - extractEmail() → Any reader can "scan" the key card to know who you are.
 * - isTokenValid() → Check the card hasn't expired and belongs to this hotel.
 *
 * JWT Structure: header.payload.signature (3 parts separated by dots)
 * - Header: algorithm used (HS512 here)
 * - Payload: data stored (email, expiry)
 * - Signature: tamper-proof seal using our secret key
 */
@Component // Tells Spring: "Manage this as a bean — make it available everywhere via
           // @Autowired"
public class JwtUtil {

    // @Value reads the jwt.secret property from application.properties at startup
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationMs;

    /**
     * Converts the secret string into a cryptographic Key object.
     * Keys.hmacShaKeyFor() requires at least 64 bytes for HS512.
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Generates a JWT token for a given email address.
     * Called after a successful login.
     *
     * @param email The authenticated user's email (used as the "subject" of the
     *              token)
     * @return A signed JWT string like "eyJhbGci..."
     */
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email) // Who is this token for?
                .setIssuedAt(new Date()) // When was it created?
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs)) // When does it expire?
                .signWith(getSigningKey(), SignatureAlgorithm.HS512) // Sign it with our secret
                .compact(); // Build and return the string
    }

    /**
     * Reads the "subject" (email) out of a JWT token.
     * Called by JwtFilter on every request.
     */
    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Checks if the token's expiry date is in the future AND the email matches.
     */
    public boolean isTokenValid(String token, String email) {
        try {
            String extractedEmail = extractEmail(token);
            return extractedEmail.equals(email) && !isTokenExpired(token);
        } catch (Exception e) {
            // If anything goes wrong (wrong signature, malformed token), it's invalid
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }

    /**
     * "Claims" is the payload section of the JWT.
     * parseClaimsJws() also VERIFIES the signature — if someone tampered with the
     * token, this throws an exception.
     */
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
