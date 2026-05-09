package com.it342.moneymap.auth.dto;

import com.it342.moneymap.users.dto.UserProfileDto;

public class AuthResponse {

    private String token;
    private UserProfileDto user;

    public AuthResponse() {
    }

    public AuthResponse(String token, UserProfileDto user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserProfileDto getUser() {
        return user;
    }

    public void setUser(UserProfileDto user) {
        this.user = user;
    }
}
