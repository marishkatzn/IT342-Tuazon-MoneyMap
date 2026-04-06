package com.it342.moneymap.controller;

import com.it342.moneymap.dto.ContributionDto;
import com.it342.moneymap.service.ContributionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contributions")
@CrossOrigin(origins = "*") // Allows React frontend to hit the endpoint
public class ContributionController {

    @Autowired
    private ContributionService contributionService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<ContributionDto>> getContributions(@PathVariable Long userId) {
        return ResponseEntity.ok(contributionService.getContributionsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<ContributionDto> addContribution(@RequestBody ContributionDto contributionDto) {
        return ResponseEntity.ok(contributionService.createContribution(contributionDto));
    }
}
