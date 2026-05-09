package com.it342.moneymap.income.dto;

import java.math.BigDecimal;

public class IncomeSuccessResponse {

    private Long incomeId;
    private String status;
    private BigDecimal amount;
    private String message;

    public IncomeSuccessResponse() {
    }

    public IncomeSuccessResponse(Long incomeId, String status, BigDecimal amount, String message) {
        this.incomeId = incomeId;
        this.status = status;
        this.amount = amount;
        this.message = message;
    }

    public Long getIncomeId() {
        return incomeId;
    }

    public void setIncomeId(Long incomeId) {
        this.incomeId = incomeId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
