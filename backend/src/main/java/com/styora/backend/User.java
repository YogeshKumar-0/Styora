package com.styora.backend;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data // Lombok: Automatically creates getters, setters, toString(), etc.
@Entity // JPA: Marks this class as a database entity (a table).
@Table(name = "users") // Specifies the actual table name.
public class User {

    @Id // Marks this field as the primary key.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Configures the ID to be auto-incremented.
    private Long id;

    private String fullName;

    @Column(unique = true) // Ensures every email is unique in the database.
    private String email;

    private String password;
}