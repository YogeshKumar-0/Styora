package com.styora.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.styora.backend.entity.CartItem;
import com.styora.backend.entity.Product;
import com.styora.backend.entity.User;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    // Find all items in a specific user's cart
    List<CartItem> findByUser(User user);
    
    // Find a specific product in a user's cart (to see if we should increment quantity)
    Optional<CartItem> findByUserAndProduct(User user, Product product);
    
    // Clear a user's cart after they place an order
    void deleteByUser(User user);
}
