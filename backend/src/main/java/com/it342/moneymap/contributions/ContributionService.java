package com.it342.moneymap.contributions;

import com.it342.moneymap.contributions.dto.ContributionDto;
import com.it342.moneymap.contributions.Contribution;
import com.it342.moneymap.goals.Goal;
import com.it342.moneymap.notifications.Notification;
import com.it342.moneymap.users.User;
import com.it342.moneymap.contributions.ContributionRepository;
import com.it342.moneymap.goals.GoalRepository;
import com.it342.moneymap.notifications.NotificationRepository;
import com.it342.moneymap.users.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Goal does not belong to the user.");
        }

        if (dto.getAmount() == null || dto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Contribution amount must be greater than zero.");
        }

        Contribution contribution = new Contribution();
        contribution.setUser(user);
        contribution.setGoal(goal);
        contribution.setAmount(dto.getAmount());
        contribution.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
        contribution.setMethod(dto.getMethod());
        contribution.setStatus("Success");

        BigDecimal oldAmount = goal.getCurrentAmount();
        BigDecimal remainingAmount = goal.getTargetAmount().subtract(oldAmount);
        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("This goal is already complete.");
        }
        if (contribution.getAmount().compareTo(remainingAmount) > 0) {
            throw new IllegalArgumentException("Contribution exceeds the remaining goal amount.");
        }

        BigDecimal newAmount = oldAmount.add(contribution.getAmount());
        goal.setCurrentAmount(newAmount);

        if (oldAmount.compareTo(goal.getTargetAmount()) < 0
                && newAmount.compareTo(goal.getTargetAmount()) >= 0) {
            notificationRepository.save(buildGoalCompletedNotification(user, goal));
        }

        goalRepository.save(goal);
        Contribution saved = contributionRepository.save(contribution);

        return mapToDto(saved);
    }

    private Notification buildGoalCompletedNotification(User user, Goal goal) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(goal.getIcon() + " Goal Completed");
        notification.setBody("You fully funded " + goal.getName() + " and reached your $" + goal.getTargetAmount().toPlainString() + " target.");
        notification.setType("Milestone");
        notification.setIcon(goal.getIcon());
        return notification;
    }

    private ContributionDto mapToDto(Contribution contribution) {
        ContributionDto dto = new ContributionDto();
        dto.setId(contribution.getId());
        dto.setUserId(contribution.getUser().getId());
        dto.setGoalId(contribution.getGoal().getId());
        dto.setGoalName(contribution.getGoal().getName());
        dto.setGoalIcon(contribution.getGoal().getIcon());
        dto.setAmount(contribution.getAmount());
        dto.setDate(contribution.getDate());
        dto.setMethod(contribution.getMethod());
        dto.setStatus(contribution.getStatus());
        return dto;
    }
}
