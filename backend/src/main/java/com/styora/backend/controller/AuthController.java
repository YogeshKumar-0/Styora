package com.styora.backend.controller;

import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.styora.backend.entity.User;
import com.styora.backend.repository.UserRepository;
import com.styora.backend.security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User signupRequest) {
        if (signupRequest.getEmail() != null && userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error: Email is already in use!"));
        }
        if (signupRequest.getPhoneNumber() != null
                && userRepository.findByPhoneNumber(signupRequest.getPhoneNumber()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error: Phone number is already in use!"));
        }

        User user = new User();
        user.setFullName(signupRequest.getFullName());
        user.setEmail(signupRequest.getEmail());
        user.setPhoneNumber(signupRequest.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String phoneNumber = loginRequest.get("phoneNumber");
        String password = loginRequest.get("password");

        Optional<User> userData = Optional.empty();
        if (email != null && !email.isEmpty()) {
            userData = userRepository.findByEmail(email);
        } else if (phoneNumber != null && !phoneNumber.isEmpty()) {
            userData = userRepository.findByPhoneNumber(phoneNumber);
        }

        if (userData.isPresent()) {
            User user = userData.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                String token = jwtUtil.generateToken(user.getEmail() != null ? user.getEmail() : user.getPhoneNumber());
                Map<String, String> response = Map.of(
                        "message", "Login successful!",
                        "fullName", user.getFullName(),
                        "email", user.getEmail() != null ? user.getEmail() : "",
                        "phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
                        "token", token);
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Error: Invalid credentials."));
    }
}