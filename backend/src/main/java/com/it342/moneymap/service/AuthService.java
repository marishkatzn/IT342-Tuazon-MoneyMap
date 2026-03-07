package com.it342.moneymap.service;

import com.it342.moneymap.entity.User;
import com.it342.moneymap.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(User user){
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

public User login(User user){

    User existingUser = userRepository
            .findByEmail(user.getEmail())
            .orElse(null);

    if(existingUser != null &&
       passwordEncoder.matches(
           user.getPassword(),
           existingUser.getPassword()
       )){
        return existingUser;
    }

    return null;
}
}