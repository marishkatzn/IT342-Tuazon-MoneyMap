package com.it342.moneymap.controller;

import com.it342.moneymap.dto.CreateCheckoutRequest;
import com.it342.moneymap.dto.PaymentSuccessRequest;
import com.it342.moneymap.service.PaymentService;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-checkout")
    public ResponseEntity<?> createCheckout(@RequestBody CreateCheckoutRequest request) {
        try {
            return ResponseEntity.ok(paymentService.createCheckout(request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/success")
    public ResponseEntity<?> confirmSuccess(@RequestBody PaymentSuccessRequest request) {
        try {
            return ResponseEntity.ok(paymentService.confirmSuccess(request));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }
}
