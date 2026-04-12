package com.it342.moneymap.controller;

import com.it342.moneymap.dto.GoalDto;
import com.it342.moneymap.service.GoalService;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "*")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<GoalDto>> getGoals(@PathVariable Long userId) {
        return ResponseEntity.ok(goalService.getGoalsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<?> addGoal(@RequestBody GoalDto goalDto) {
        try {
            return ResponseEntity.ok(goalService.createGoal(goalDto));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGoal(@PathVariable Long id, @RequestBody GoalDto goalDto) {
        try {
            return ResponseEntity.ok(goalService.updateGoal(id, goalDto));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{userId}/allocations")
    public ResponseEntity<Void> updateAllocations(@PathVariable Long userId, @RequestBody List<GoalDto> allocations) {
        goalService.updateAllocations(userId, allocations);
        return ResponseEntity.ok().build();
    }
}
