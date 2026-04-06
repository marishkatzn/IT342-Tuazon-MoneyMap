package com.it342.moneymap.controller;

import com.it342.moneymap.dto.GoalDto;
import com.it342.moneymap.service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "*") // Allows React frontend to hit the endpoint
public class GoalController {

    @Autowired
    private GoalService goalService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<GoalDto>> getGoals(@PathVariable Long userId) {
        return ResponseEntity.ok(goalService.getGoalsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<GoalDto> addGoal(@RequestBody GoalDto goalDto) {
        return ResponseEntity.ok(goalService.createGoal(goalDto));
    }

    @PutMapping("/{userId}/allocations")
    public ResponseEntity<Void> updateAllocations(@PathVariable Long userId, @RequestBody List<GoalDto> allocations) {
        goalService.updateAllocations(userId, allocations);
        return ResponseEntity.ok().build();
    }
}
