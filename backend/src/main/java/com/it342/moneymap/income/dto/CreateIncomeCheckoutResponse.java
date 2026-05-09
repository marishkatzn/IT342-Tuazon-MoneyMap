package com.it342.moneymap.income.dto;

public class CreateIncomeCheckoutResponse {

    private Long incomeId;
    private String checkoutUrl;

    public CreateIncomeCheckoutResponse() {
    }

    public CreateIncomeCheckoutResponse(Long incomeId, String checkoutUrl) {
        this.incomeId = incomeId;
        this.checkoutUrl = checkoutUrl;
    }

    public Long getIncomeId() {
        return incomeId;
    }

    public void setIncomeId(Long incomeId) {
        this.incomeId = incomeId;
    }

    public String getCheckoutUrl() {
        return checkoutUrl;
    }

    public void setCheckoutUrl(String checkoutUrl) {
        this.checkoutUrl = checkoutUrl;
    }
}
