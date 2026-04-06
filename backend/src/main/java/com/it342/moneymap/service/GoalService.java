package com.it342.moneymap.service;

import com.it342.moneymap.dto.GoalDto;
import com.it342.moneymap.entity.Goal;
import com.it342.moneymap.entity.User;
import com.it342.moneymap.repository.GoalRepository;
import com.it342.moneymap.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    public List<GoalDto> getGoalsByUserId(Long userId) {
        return goalRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public GoalDto createGoal(GoalDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Goal goal = new Goal();
        goal.setUser(user);
        goal.setName(dto.getName());
        goal.setIcon(dto.getIcon());
        goal.setTargetAmount(dto.getTargetAmount());
        goal.setTargetDate(dto.getTargetDate());
        goal.setCurrentAmount(dto.getCurrentAmount() != null ? dto.getCurrentAmount() : BigDecimal.ZERO);
        goal.setAllocationPercentage(dto.getAllocationPercentage());

        Goal saved = goalRepository.save(goal);
        return mapToDto(saved);
    }

    public void updateAllocations(Long userId, List<GoalDto> allocations) {
        // In reality, you'd check if sum == 100 or less, but we store it as is for now
        for (GoalDto dto : allocations) {
            Goal goal = goalRepository.findById(dto.getId()).orElse(null);
            if (goal != null && goal.getUser().getId().equals(userId)) {
                goal.setAllocationPercentage(dto.getAllocationPercentage());
                goalRepository.save(goal);
            }
        }
    }

    private GoalDto mapToDto(Goal goal) {
        GoalDto dto = new GoalDto();
        dto.setId(goal.getId());
        dto.setUserId(goal.getUser().getId());
        dto.setName(goal.getName());
        dto.setIcon(goal.getIcon());
        dto.setTargetAmount(goal.getTargetAmount());
        dto.setTargetDate(goal.getTargetDate());
        dto.setCurrentAmount(goal.getCurrentAmount());
        dto.setAllocationPercentage(goal.getAllocationPercentage());
        return dto;
    }
}
