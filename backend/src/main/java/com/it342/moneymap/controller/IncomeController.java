package com.it342.moneymap.controller;

import com.it342.moneymap.dto.CreateIncomeCheckoutRequest;
import com.it342.moneymap.dto.IncomeSuccessRequest;
import com.it342.moneymap.dto.IncomeDto;
import com.it342.moneymap.service.IncomeService;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/income")
@CrossOrigin(origins = "*")
public class IncomeController {

    @Autowired
    private IncomeService incomeService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<IncomeDto>> getIncomes(@PathVariable Long userId) {
        return ResponseEntity.ok(incomeService.getIncomesByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<?> addIncome(@RequestBody IncomeDto incomeDto) {
        try {
            return ResponseEntity.ok(incomeService.createIncome(incomeDto));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/create-checkout")
    public ResponseEntity<?> createIncomeCheckout(@RequestBody CreateIncomeCheckoutRequest request) {
        try {
            return ResponseEntity.ok(incomeService.createIncomeCheckout(request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/success")
    public ResponseEntity<?> confirmIncomeSuccess(@RequestBody IncomeSuccessRequest request) {
        try {
            return ResponseEntity.ok(incomeService.confirmIncomeSuccess(request));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateIncome(@PathVariable Long id, @RequestBody IncomeDto incomeDto) {
        try {
            return ResponseEntity.ok(incomeService.updateIncome(id, incomeDto));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable Long id) {
        incomeService.deleteIncome(id);
        return ResponseEntity.noContent().build();
    }
}
