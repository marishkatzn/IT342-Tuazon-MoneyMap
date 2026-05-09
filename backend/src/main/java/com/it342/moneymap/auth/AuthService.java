package com.it342.moneymap.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.it342.moneymap.auth.dto.AuthResponse;
import com.it342.moneymap.auth.dto.LoginRequest;
import com.it342.moneymap.auth.dto.OAuthLoginRequest;
import com.it342.moneymap.users.dto.UserProfileDto;
import com.it342.moneymap.users.User;
import com.it342.moneymap.users.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private GoogleTokenVerifierService googleTokenVerifierService;

    public User register(User user){
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setAuthProvider("LOCAL");
        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request){

    User existingUser = userRepository
            .findByEmail(request.getEmail())
            .orElse(null);

    if(existingUser != null &&
       existingUser.getPassword() != null &&
       passwordEncoder.matches(
           request.getPassword(),
           existingUser.getPassword()
       )){
        return new AuthResponse(jwtService.generateToken(existingUser), mapToAuthUser(existingUser));
    }

    return null;
}

    public AuthResponse loginWithGoogle(OAuthLoginRequest request) {
        GoogleIdToken.Payload payload = googleTokenVerifierService.verify(request.getIdToken());
        String email = payload.getEmail();
        String providerSubject = payload.getSubject();

        User user = userRepository.findByProviderSubject(providerSubject)
            .orElseGet(() -> userRepository.findByEmail(email).orElse(null));

        if (user == null) {
            user = new User();
            user.setEmail(email);
        }

        user.setName((String) payload.get("name"));
        user.setAuthProvider("GOOGLE");
        user.setProviderSubject(providerSubject);

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(providerSubject));
        }

        User savedUser = userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(savedUser), mapToAuthUser(savedUser));
    }

    private UserProfileDto mapToAuthUser(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAuthProvider(user.getAuthProvider());
        return dto;
    }
}
