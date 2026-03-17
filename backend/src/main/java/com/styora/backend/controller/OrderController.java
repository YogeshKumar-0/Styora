package com.styora.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.styora.backend.entity.Order;
import com.styora.backend.entity.User;
import com.styora.backend.repository.UserRepository;
import com.styora.backend.service.OrderService;

/**
 * 🎓 LESSON: Order Controller
 *
 * This provides endpoints to place an order and view order history.
 * - POST /api/orders/place → Creates a real order in the DB
 * - GET /api/orders/my → Lists all previous orders for the logged-in user
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        String identifier = SecurityContextHolder.getContext().getAuthentication().getName();
        // The identifier could be an email or a phone number depending on how the user
        // logged in.
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByPhoneNumber(identifier))
                .orElse(null);
    }

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, String> request) {
        User user = getAuthenticatedUser();
        if (user == null)
            return ResponseEntity.status(401).build();

        String shippingAddress = request.get("address");
        if (shippingAddress == null || shippingAddress.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Shipping address is required"));
        }

        try {
            Order order = orderService.placeOrder(user, shippingAddress);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<Order>> getMyOrders() {
        User user = getAuthenticatedUser();
        if (user == null)
            return ResponseEntity.status(401).build();

        return ResponseEntity.ok(orderService.getUserOrders(user));
    }
}
