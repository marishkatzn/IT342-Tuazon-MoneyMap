package com.it342.moneymap.payments.dto;

public class CreateCheckoutResponse {

    private Long paymentId;
    private String checkoutUrl;

    public CreateCheckoutResponse() {
    }

    public CreateCheckoutResponse(Long paymentId, String checkoutUrl) {
        this.paymentId = paymentId;
        this.checkoutUrl = checkoutUrl;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public String getCheckoutUrl() {
        return checkoutUrl;
    }

    public void setCheckoutUrl(String checkoutUrl) {
        this.checkoutUrl = checkoutUrl;
    }
}
