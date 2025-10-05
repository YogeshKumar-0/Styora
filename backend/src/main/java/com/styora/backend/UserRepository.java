package com.styora.backend;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

// JpaRepository handles all standard database operations for the User entity.
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring will automatically implement this method for you:
    // It finds a user in the database by their email address.
    Optional<User> findByEmail(String email);
}