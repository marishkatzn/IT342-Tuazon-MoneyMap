package com.it342.moneymap.repository;

import com.it342.moneymap.entity.Payment;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByCheckoutSessionId(String checkoutSessionId);

    @Transactional
    @Modifying
    void deleteBySavingsGoalId(Long goalId);
}
