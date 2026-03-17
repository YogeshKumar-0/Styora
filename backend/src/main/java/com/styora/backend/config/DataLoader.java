package com.styora.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.styora.backend.entity.Product;
import com.styora.backend.entity.User;
import com.styora.backend.repository.ProductRepository;
import com.styora.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
public class DataLoader implements CommandLineRunner {

        @Autowired
        private ProductRepository productRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) throws Exception {
                if (productRepository.count() == 0) {
                        createProduct("Styora Signature Leather Jacket",
                                        "Handcrafted premium calfskin with a modern silhouette.", 12500.00, "Clothing",
                                        "assets/images/Leather_Jacket.jpg", 10);
                        createProduct("Minimalist Masterpiece Watch",
                                        "Brushed steel casing with an Italian leather strap.", 8900.00, "Accessories",
                                        "assets/images/Wristwatch.jpg", 15);
                        createProduct("Urban Sport Sneakers",
                                        "Sculpted sole and breathable mesh for the urban explorer.", 5800.00, "Shoes",
                                        "assets/images/Sneakers.jpg", 10);
                        createProduct("City Nomad Backpack", "Water-resistant canvas with architectural lines.",
                                        7200.00, "Accessories", "assets/images/Backpack.jpg", 25);
                        createProduct("ActivePulse Fitness Band",
                                        "Sleek health tracking with a minimalist lifestyle aesthetic.", 4500.00,
                                        "Electronics", "assets/images/Fitness_Band.jpg", 8);
                        System.out.println("[SUCCESS] Sample products seeded!");
                }

                if (userRepository.findByEmail("test@example.com").isEmpty()) {
                        User testUser = new User();
                        testUser.setFullName("Test User");
                        testUser.setEmail("test@example.com");
                        testUser.setPhoneNumber("9876543210");
                        testUser.setPassword(passwordEncoder.encode("Test@1234"));
                        userRepository.save(testUser);
                        System.out.println(
                                        "[SUCCESS] Default user 'test@example.com' created (pass: Test@1234, phone: 9876543210)");
                }
        }

        private void createProduct(String name, String desc, double price, String cat, String img, int stock) {
                Product p = new Product();
                p.setName(name);
                p.setDescription(desc);
                p.setPrice(price);
                p.setCategory(cat);
                p.setImageUrl(img);
                p.setStock(stock);
                productRepository.save(p);
        }
}
