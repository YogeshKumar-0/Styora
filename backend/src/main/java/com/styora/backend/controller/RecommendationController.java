package com.styora.backend.controller;

import com.styora.backend.entity.Product;
import com.styora.backend.repository.ProductRepository;
import com.styora.backend.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
public class RecommendationController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(@RequestBody Map<String, String> request) {
        String context = request.getOrDefault("context", "The user is browsing fashion and accessories.");

        List<Product> allProducts = productRepository.findAll();
        if (allProducts.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<Long> recommendedIds = geminiService.getRecommendedProductIds(allProducts, context);

        List<Product> recommendations = allProducts.stream()
                .filter(p -> recommendedIds.contains(p.getId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(recommendations);
    }
}
