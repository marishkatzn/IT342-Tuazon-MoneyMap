package com.it342.moneymap.controller;

import com.it342.moneymap.dto.IncomeDto;
import com.it342.moneymap.service.IncomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/income")
@CrossOrigin(origins = "*") // Allows React frontend to hit the endpoint
public class IncomeController {

    @Autowired
    private IncomeService incomeService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<IncomeDto>> getIncomes(@PathVariable Long userId) {
        return ResponseEntity.ok(incomeService.getIncomesByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<IncomeDto> addIncome(@RequestBody IncomeDto incomeDto) {
        return ResponseEntity.ok(incomeService.createIncome(incomeDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable Long id) {
        incomeService.deleteIncome(id);
        return ResponseEntity.noContent().build();
    }
}
