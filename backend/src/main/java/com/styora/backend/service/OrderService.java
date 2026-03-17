package com.styora.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styora.backend.entity.CartItem;
import com.styora.backend.entity.Order;
import com.styora.backend.entity.OrderItem;
import com.styora.backend.entity.Product;
import com.styora.backend.entity.User;
import com.styora.backend.repository.CartRepository;
import com.styora.backend.repository.OrderRepository;
import com.styora.backend.repository.ProductRepository;

/**
 * 🎓 LESSON: The OrderService (Business Logic)
 *
 * This class handles the complex logic of placing an order.
 * - @Transactional: If ANY part of this fails (like a product being out of
 * stock),
 * the entire process is cancelled so you don't end up with partial data.
 */
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public Order placeOrder(User user, String shippingAddress) {
        List<CartItem> cartItems = cartRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDate.now());
        order.setStatus("PROCESSING");
        order.setShippingAddress(shippingAddress);
        order.setPaymentStatus("PENDING");

        double total = 0;
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();

            // Check stock
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Reduce stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            // Create OrderItem
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(product.getPrice());

            order.getItems().add(orderItem);
            total += product.getPrice() * cartItem.getQuantity();
        }

        order.setTotal(total);
        Order savedOrder = orderRepository.save(order);

        // Clear the cart after order is placed
        cartRepository.deleteByUser(user);

        return savedOrder;
    }

    public List<Order> getUserOrders(User user) {
        return orderRepository.findByUserOrderByOrderDateDesc(user);
    }
}
