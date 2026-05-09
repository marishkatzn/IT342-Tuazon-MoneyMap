package com.it342.moneymap.auth;

import com.it342.moneymap.auth.dto.AuthResponse;
import com.it342.moneymap.auth.dto.LoginRequest;
import com.it342.moneymap.auth.dto.OAuthLoginRequest;
import com.it342.moneymap.users.User;
import com.it342.moneymap.auth.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user){
        try {
            return ResponseEntity.ok(authService.register(user));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){
        AuthResponse authResponse = authService.login(request);
        if (authResponse == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
        }
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/oauth/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody OAuthLoginRequest request){
        try {
            return ResponseEntity.ok(authService.loginWithGoogle(request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
        }
    }
}
