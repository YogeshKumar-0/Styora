package com.styora.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * 🎓 LESSON: The Product Entity
 *
 * This class represents a "Product" row in your database.
 * Every field here (name, price, imageUrl) will become a column in the
 * 'products' table.
 */
@Data
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private double price;
    private String category;
    private String imageUrl;
    private int stock;
}
