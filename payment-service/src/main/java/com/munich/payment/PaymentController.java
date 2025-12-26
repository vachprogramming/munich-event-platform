package com.munich.payment;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @PostMapping(value = "/process", consumes = "application/json", produces = "application/json")
    public Map<String, String> processPayment(@RequestBody Map<String, Object> payload) {
        // Simulate business logic (e.g., talk to Stripe)
        System.out.println("Processing payment for amount: " + payload.get("amount"));
        
        // Return JSON response
        Map<String, String> response = new HashMap<>();
        response.put("status", "confirmed");
        response.put("transaction_id", "txn_" + System.currentTimeMillis());
        
        return response;
    }
}