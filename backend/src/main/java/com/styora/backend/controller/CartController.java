package com.styora.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.styora.backend.entity.CartItem;
import com.styora.backend.entity.Product;
import com.styora.backend.entity.User;
import com.styora.backend.repository.CartRepository;
import com.styora.backend.repository.ProductRepository;
import com.styora.backend.repository.UserRepository;

/**
 * 🎓 LESSON: Cart Controller
 *
 * This handles saving and retrieving items from the user's cart in the
 * database.
 * We use the authenticated user's email (from JWT) to ensure they only access
 * their own cart.
 */
@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart() {
        User user = getAuthenticatedUser();
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cartRepository.findByUser(user));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> request) {
        User user = getAuthenticatedUser();
        if (user == null)
            return ResponseEntity.status(401).build();

        Object pIdObj = request.get("productId");
        if (pIdObj == null)
            return ResponseEntity.badRequest().body("Product ID is required");
        long productId = Long.parseLong(pIdObj.toString());
        int quantity = Integer.parseInt(request.get("quantity").toString());

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null)
            return ResponseEntity.badRequest().body("Product not found");

        // Check if item already exists in cart, if so update quantity
        Optional<CartItem> existingItem = cartRepository.findByUserAndProduct(user, product);
        CartItem cartItem;
        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        } else {
            cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
        }

        cartRepository.save(cartItem);
        return ResponseEntity.ok(Map.of("message", "Item added to cart"));
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long id) {
        if (id == null)
            return ResponseEntity.badRequest().build();
        User user = getAuthenticatedUser();
        if (user == null)
            return ResponseEntity.status(401).build();

        cartRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
    }
}
