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
public class ChatController {

        @Autowired
        private ProductRepository productRepository;

        @Autowired
        private GeminiService geminiService;

        @PostMapping("/chat")
        public ResponseEntity<?> chat(@RequestBody Map<String, Object> request) {
                String userMessage = (String) request.get("message");

                List<Product> allProducts = productRepository.findAll();

                // Build catalog context for the AI
                String catalog = allProducts.stream()
                                .map(p -> String.format("{name:'%s', category:'%s', price:%f}", p.getName(),
                                                p.getCategory(),
                                                p.getPrice()))
                                .collect(Collectors.joining(", "));

                String systemPrompt = "You are 'Styora Bot', a helpful and stylish AI shopping assistant for the Styora e-commerce store. "
                                +
                                "Styora sells premium fashion (Clothing, Shoes, Accessories). " +
                                "Our catalog includes: [" + catalog + "]. " +
                                "Our shipping rate is static at Rs. 50. " +
                                "Always be polite, concise, and encourage users to buy. " +
                                "If asked for recommendations, use the catalog items. " +
                                "Answer based ONLY on the provided catalog and site info. " +
                                "User Message: " + userMessage;

                // Reuse GeminiService to get the response text
                // Note: For a real chatbot, we might want to extend GeminiService to handle
                // text-only generation more generically.
                // For now, I'll add a generateText method to GeminiService.

                String response = geminiService.generateText(systemPrompt);

                return ResponseEntity.ok(Map.of("reply", response));
        }
}
