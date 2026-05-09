package com.it342.moneymap.payments.dto;

import java.math.BigDecimal;

public class PaymentSuccessResponse {

    private Long paymentId;
    private String status;
    private BigDecimal updatedGoalAmount;
    private String message;

    public PaymentSuccessResponse() {
    }

    public PaymentSuccessResponse(Long paymentId, String status, BigDecimal updatedGoalAmount, String message) {
        this.paymentId = paymentId;
        this.status = status;
        this.updatedGoalAmount = updatedGoalAmount;
        this.message = message;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getUpdatedGoalAmount() {
        return updatedGoalAmount;
    }

    public void setUpdatedGoalAmount(BigDecimal updatedGoalAmount) {
        this.updatedGoalAmount = updatedGoalAmount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
