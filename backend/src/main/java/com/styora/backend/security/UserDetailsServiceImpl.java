package com.styora.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.styora.backend.entity.User;
import com.styora.backend.repository.UserRepository;

import java.util.ArrayList;

/**
 * 🎓 LESSON: What is UserDetailsService?
 *
 * Spring Security doesn't know anything about YOUR database or your User class.
 * It needs you to implement this interface to tell it:
 * "Hey, when someone says their email is 'yogesh@example.com', here's what you
 * load from the database."
 *
 * Spring Security calls loadUserByUsername() internally during authentication
 * checks.
 * The "username" here is actually the email address in our case.
 */
@Service // Spring manages this as a Service bean
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Loads a user from the database by their email (used as "username" in Spring
     * Security).
     *
     * We wrap our User entity in Spring Security's User object so Spring Security
     * can:
     * - Access the password (to verify, using BCrypt)
     * - Access the user's roles/authorities
     *
     * @param email The email address from the JWT token or login request
     * @return A Spring Security UserDetails object
     * @throws UsernameNotFoundException if no user with that email exists
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // new ArrayList<>() means "no roles" — we'll add roles (ADMIN, USER) later if
        // needed
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                new ArrayList<>());
    }
}
