package com.styora.backend.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import com.styora.backend.entity.Product;

@Service
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    public List<Long> getRecommendedProductIds(List<Product> allProducts, String userContext) {
        if (apiKey == null || apiKey.isEmpty()) {
            System.out.println("⚠️ Gemini API Key not found. Returning random mock recommendations.");
            return getMockRecommendations(allProducts);
        }

        try {
            RestTemplate restTemplate = new RestTemplate();

            // Prepare product catalog for prompt
            String catalog = allProducts.stream()
                    .map(p -> String.format("{id:%d, name:'%s', category:'%s'}", p.getId(), p.getName(),
                            p.getCategory()))
                    .collect(Collectors.joining(", "));

            String prompt = String.format(
                    "You are an AI shopping assistant for 'Styora'. " +
                            "Given the user's current context: '%s', and our product catalog: [%s], " +
                            "recommend exactly 4 product IDs that would most likely interest the user. " +
                            "Return ONLY a JSON array of numbers, e.g., [1, 2, 3, 4]. No explanation.",
                    userContext, catalog);

            // Construct Gemini Request Body
            JSONObject requestBody = new JSONObject();
            JSONArray contents = new JSONArray();
            JSONObject content = new JSONObject();
            JSONArray parts = new JSONArray();
            JSONObject part = new JSONObject();
            part.put("text", prompt);
            parts.put(part);
            content.put("parts", parts);
            contents.put(content);
            requestBody.put("contents", contents);

            String responseStr = restTemplate.postForObject(GEMINI_API_URL + apiKey, requestBody.toString(),
                    String.class);

            if (responseStr != null) {
                JSONObject responseJson = new JSONObject(responseStr);
                String resultText = responseJson.getJSONArray("candidates")
                        .getJSONObject(0)
                        .getJSONObject("content")
                        .getJSONArray("parts")
                        .getJSONObject(0)
                        .getString("text").trim();

                // Parse the [1, 2, 3, 4] from the response
                JSONArray idArray = new JSONArray(resultText);
                List<Long> recommendedIds = new java.util.ArrayList<>();
                for (int i = 0; i < idArray.length(); i++) {
                    recommendedIds.add(idArray.getLong(i));
                }
                return recommendedIds;
            }

        } catch (Exception e) {
            // Logged internally
        }

        return getMockRecommendations(allProducts);
    }

    public String generateText(String prompt) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "Hello! I'm Styora Bot. I'm currently in demo mode as the API key is missing, but I'm here to help you shop!";
        }

        try {
            RestTemplate restTemplate = new RestTemplate();

            // Construct Gemini Request Body
            JSONObject requestBody = new JSONObject();
            JSONArray contents = new JSONArray();
            JSONObject content = new JSONObject();
            JSONArray parts = new JSONArray();
            JSONObject part = new JSONObject();
            part.put("text", prompt);
            parts.put(part);
            content.put("parts", parts);
            contents.put(content);
            requestBody.put("contents", contents);

            String responseStr = restTemplate.postForObject(GEMINI_API_URL + apiKey, requestBody.toString(),
                    String.class);

            if (responseStr != null) {
                JSONObject responseJson = new JSONObject(responseStr);
                return responseJson.getJSONArray("candidates")
                        .getJSONObject(0)
                        .getJSONObject("content")
                        .getJSONArray("parts")
                        .getJSONObject(0)
                        .getString("text").trim();
            }

        } catch (Exception e) {
            // Logged internally
        }

        return "I'm having a bit of trouble connecting to my brain right now, but I can still help you browse our products!";
    }

    private List<Long> getMockRecommendations(List<Product> allProducts) {
        List<Long> ids = allProducts.stream().map(Product::getId).collect(Collectors.toList());
        Collections.shuffle(ids);
        return ids.stream().limit(4).collect(Collectors.toList());
    }
}
