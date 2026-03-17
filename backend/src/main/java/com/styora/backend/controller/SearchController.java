package com.styora.backend.controller;

import com.styora.backend.entity.Product;
import com.styora.backend.repository.ProductRepository;
import com.styora.backend.service.GeminiService;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
public class SearchController {

        @Autowired
        private ProductRepository productRepository;

        @Autowired
        private GeminiService geminiService;

        @GetMapping("/search")
        public ResponseEntity<?> search(@RequestParam String q) {
                List<Product> allProducts = productRepository.findAll();

                if (allProducts.isEmpty()) {
                        return ResponseEntity.ok(List.of());
                }

                // Build a simplified catalog for the AI to understand the search space
                String catalog = allProducts.stream()
                                .map(p -> String.format("{id:%d, name:'%s', category:'%s', description:'%s', price:%f}",
                                                p.getId(), p.getName(), p.getCategory(), p.getDescription(),
                                                p.getPrice()))
                                .collect(Collectors.joining(", "));

                String prompt = String.format(
                                "You are an AI search engine for 'Styora' premium fashion store. " +
                                                "User Query: '%s'. " +
                                                "Catalog: [%s]. " +
                                                "Identify the product IDs that best match the user's search query based on meaning, style, and intent. "
                                                +
                                                "Return ONLY a JSON array of numbers representing the matching IDs, e.g., [1, 5, 12]. "
                                                +
                                                "If no matches found, return []. No explanation.",
                                q, catalog);

                String response = geminiService.generateText(prompt);

                try {
                        // Attempt to parse the AI response as a JSON array of IDs
                        // Strip any potential markdown code blocks if the AI accidentally included them
                        String cleanedResponse = response.replaceAll("```json|```", "").trim();
                        JSONArray jsonArray = new JSONArray(cleanedResponse);
                        List<Long> resultIds = new java.util.ArrayList<>();
                        for (int i = 0; i < jsonArray.length(); i++) {
                                resultIds.add(jsonArray.getLong(i));
                        }

                        List<Product> results = allProducts.stream()
                                        .filter(p -> resultIds.contains(p.getId()))
                                        .collect(Collectors.toList());

                        return ResponseEntity.ok(results);

                } catch (Exception e) {
                        // Fallback to basic keyword search if AI fails
                        List<Product> fallback = allProducts.stream()
                                        .filter(p -> p.getName().toLowerCase().contains(q.toLowerCase()) ||
                                                        p.getCategory().toLowerCase().contains(q.toLowerCase()))
                                        .collect(Collectors.toList());
                        return ResponseEntity.ok(fallback);
                }
        }
}
