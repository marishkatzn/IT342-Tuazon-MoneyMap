package com.it342.moneymap.auth.dto;

public class OAuthLoginRequest {

    private String idToken;

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
