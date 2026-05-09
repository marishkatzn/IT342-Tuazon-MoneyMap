package com.it342.moneymap.goals;

import com.it342.moneymap.goals.dto.GoalDto;
import com.it342.moneymap.goals.Goal;
import com.it342.moneymap.users.User;
import com.it342.moneymap.contributions.ContributionRepository;
import com.it342.moneymap.goals.GoalRepository;
import com.it342.moneymap.payments.PaymentRepository;
import com.it342.moneymap.users.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContributionRepository contributionRepository;

    @Autowired
    private PaymentRepository paymentRepository;

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

    public GoalDto updateGoal(Long id, GoalDto dto) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUser().getId().equals(dto.getUserId())) {
            throw new RuntimeException("Goal does not belong to user");
        }

        goal.setName(dto.getName());
        goal.setIcon(dto.getIcon());
        goal.setTargetAmount(dto.getTargetAmount());
        goal.setTargetDate(dto.getTargetDate());

        Goal saved = goalRepository.save(goal);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteGoal(Long id) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        paymentRepository.deleteBySavingsGoalId(goal.getId());
        contributionRepository.deleteByGoalId(goal.getId());
        goalRepository.delete(goal);
    }

    public void updateAllocations(Long userId, List<GoalDto> allocations) {
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
