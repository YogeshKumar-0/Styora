package com.styora.backend;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // Tells Spring this class defines REST API endpoints.
@RequestMapping("/api/auth") // Sets the base URL for all endpoints in this class.
public class AuthController {

    @Autowired // Spring's dependency injection: automatically provides an instance of UserRepository.
    private UserRepository userRepository;

    @PostMapping("/signup") // Defines the signup endpoint, handles POST requests.
    public ResponseEntity<?> signup(@RequestBody User signupRequest) {
        // Check if the email is already taken.
        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Email is already in use!");
        }

        // ⚠️ SECURITY WARNING: In a real app, you MUST HASH the password before saving!
        // This is just a simple example.
        User user = new User();
        user.setFullName(signupRequest.getFullName());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(signupRequest.getPassword()); // HASH THIS in production!

        // Save the new user to the database.
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login") // Defines the login endpoint.
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        Optional<User> userData = userRepository.findByEmail(email);

        if (userData.isPresent()) {
            User user = userData.get();
            // ⚠️ SECURITY WARNING: In a real app, compare HASHED passwords!
            if (user.getPassword().equals(password)) {
                // Create a response object that includes user details (without password).
                Map<String, String> response = Map.of(
                    "message", "Login successful!",
                    "fullName", user.getFullName(),
                    "email", user.getEmail()
                );
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Invalid email or password.");
    }
}