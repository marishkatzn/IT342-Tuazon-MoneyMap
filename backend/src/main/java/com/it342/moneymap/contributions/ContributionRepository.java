package com.it342.moneymap.contributions;

import com.it342.moneymap.contributions.Contribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ContributionRepository extends JpaRepository<Contribution, Long> {
    List<Contribution> findByUserId(Long userId);

    @Transactional
    @Modifying
    void deleteByGoalId(Long goalId);
}
