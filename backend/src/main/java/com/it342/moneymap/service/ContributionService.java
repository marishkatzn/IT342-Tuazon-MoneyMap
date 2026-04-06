package com.it342.moneymap.service;

import com.it342.moneymap.dto.ContributionDto;
import com.it342.moneymap.entity.Contribution;
import com.it342.moneymap.entity.Goal;
import com.it342.moneymap.entity.Notification;
import com.it342.moneymap.entity.User;
import com.it342.moneymap.repository.ContributionRepository;
import com.it342.moneymap.repository.GoalRepository;
import com.it342.moneymap.repository.NotificationRepository;
import com.it342.moneymap.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContributionService {

    @Autowired
    private ContributionRepository contributionRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public List<ContributionDto> getContributionsByUserId(Long userId) {
        return contributionRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ContributionDto createContribution(ContributionDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Goal goal = goalRepository.findById(dto.getGoalId())
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        Contribution c = new Contribution();
        c.setUser(user);
        c.setGoal(goal);
        c.setAmount(dto.getAmount());
        c.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
        c.setMethod(dto.getMethod());
        c.setStatus("Success");

        // Update the Goal's currentAmount
        BigDecimal oldAmount = goal.getCurrentAmount();
        BigDecimal newAmount = oldAmount.add(c.getAmount());
        goal.setCurrentAmount(newAmount);

        // Check for Milestone (e.g. hitting 100%)
        if (oldAmount.compareTo(goal.getTargetAmount()) < 0 
            && newAmount.compareTo(goal.getTargetAmount()) >= 0) {
            // Reached goal!
            Notification n = new Notification();
            n.setUser(user);
            n.setTitle("Goal Reached! " + goal.getIcon());
            n.setBody("Congratulations! You have reached your target for " + goal.getName() + ".");
            n.setType("Milestone");
            n.setIcon("🎉");
            notificationRepository.save(n);
        }

        goalRepository.save(goal);
        Contribution saved = contributionRepository.save(c);

        return mapToDto(saved);
    }

    private ContributionDto mapToDto(Contribution c) {
        ContributionDto dto = new ContributionDto();
        dto.setId(c.getId());
        dto.setUserId(c.getUser().getId());
        dto.setGoalId(c.getGoal().getId());
        dto.setGoalName(c.getGoal().getName());
        dto.setGoalIcon(c.getGoal().getIcon());
        dto.setAmount(c.getAmount());
        dto.setDate(c.getDate());
        dto.setMethod(c.getMethod());
        dto.setStatus(c.getStatus());
        return dto;
    }
}
