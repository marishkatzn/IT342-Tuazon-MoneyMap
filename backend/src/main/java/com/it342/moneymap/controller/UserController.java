package com.it342.moneymap.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("*")
public class UserController {

    @GetMapping("/me")
    public String getProfile(){
        return "Protected Profile Data";
    }
}
