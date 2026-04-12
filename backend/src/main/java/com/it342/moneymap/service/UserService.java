package com.it342.moneymap.service;

import com.it342.moneymap.dto.UpdateUserProfileRequest;
import com.it342.moneymap.dto.UserProfileDto;
import com.it342.moneymap.entity.User;
import com.it342.moneymap.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserProfileDto getProfile(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found."));
        return mapToDto(user);
    }

    public UserProfileDto updateProfile(Long id, UpdateUserProfileRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Display name is required.");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        userRepository.findByEmail(request.getEmail())
                .filter(existingUser -> !existingUser.getId().equals(id))
                .ifPresent(existingUser -> {
                    throw new IllegalArgumentException("Email is already registered.");
                });

        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim());
        user.setPictureUrl(request.getPictureUrl());

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    private UserProfileDto mapToDto(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAuthProvider(user.getAuthProvider());
        dto.setPictureUrl(user.getPictureUrl());
        return dto;
    }
}
