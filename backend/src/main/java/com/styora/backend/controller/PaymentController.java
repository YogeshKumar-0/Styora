package com.styora.backend.controller;

import java.util.Map;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

/**
 * 🎓 LESSON: The Payment Controller (Razorpay Integration)
 *
 * This handles the "Money" part of your app!
 * 1. Create Order: Your backend asks Razorpay to prepare a payment.
 * 2. Verify: After the user pays, Razorpay sends a "Signature". We check it
 * to make sure the payment wasn't faked by a hacker.
 */
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            // 💡 TIP: Calculate amount FIRST so we can use it in Demo Mode too
            int amount = (int) (Double.parseDouble(data.get("amount").toString()) * 100);

            // 🛡️ DEV TIP: Special "Demo Mode" for testing without real Razorpay keys
            if (keyId.equals("rzp_test_StyoraDevKey") || keyId.startsWith("YOUR_KEY")) {
                System.out.println("⚠️ WARNING: Using Demo Mode because real Razorpay keys are not set.");
                return ResponseEntity.ok(Map.of(
                        "id", "order_mock_" + System.currentTimeMillis(),
                        "amount", amount,
                        "currency", "INR",
                        "status", "created",
                        "notes", Map.of("mode", "demo")));
            }

            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = razorpay.Orders.create(orderRequest);

            // Return the order as a JSON object (as a Map/Object, Spring handles the rest)
            return ResponseEntity.ok(order.toJson().toString());
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Payment system error. Please try again later."));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        String orderId = data.get("razorpay_order_id");
        String paymentId = data.get("razorpay_payment_id");
        String signature = data.get("razorpay_signature");

        try {
            // 🛡️ DEV TIP: Mock verification for Demo Mode
            if (orderId.startsWith("order_mock_")) {
                return ResponseEntity.ok(Map.of("status", "success", "message", "DEMO Payment verified!"));
            }

            // Re-calculate the signature using our secret and compare
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            boolean isValid = Utils.verifyPaymentSignature(options, keySecret);

            if (isValid) {
                return ResponseEntity.ok(Map.of("status", "success", "message", "Payment verified!"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("status", "failed", "message", "Invalid signature"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Verification error"));
        }
    }
}
