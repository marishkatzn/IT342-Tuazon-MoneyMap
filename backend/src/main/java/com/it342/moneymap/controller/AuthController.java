package com.it342.moneymap.controller;

import com.it342.moneymap.entity.User;
import com.it342.moneymap.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public User register(@RequestBody User user){
        return authService.register(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody User user){
        return authService.login(user);
    }
}
