package com.it342.moneymap.service;

import com.it342.moneymap.dto.UpdateUserProfileRequest;
import com.it342.moneymap.dto.UserProfileDto;
import com.it342.moneymap.entity.User;
import com.it342.moneymap.repository.UserRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {

    private static final long MAX_PROFILE_PICTURE_BYTES = 2 * 1024 * 1024;
    private static final Path PROFILE_PICTURE_DIR = Paths.get("uploads", "profile-pictures").toAbsolutePath().normalize();
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");

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
        user.setPictureUrl(normalizePictureUrl(request.getPictureUrl()));

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    public UserProfileDto uploadProfilePicture(Long id, MultipartFile file, String uploadsBaseUrl) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Profile picture is required.");
        }

        if (file.getSize() > MAX_PROFILE_PICTURE_BYTES) {
            throw new IllegalArgumentException("Profile picture must be 2MB or smaller.");
        }

        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Profile picture must be a JPG, PNG, WEBP, or GIF image.");
        }

        try {
            Files.createDirectories(PROFILE_PICTURE_DIR);
            String extension = extensionForContentType(contentType);
            String fileName = "user-" + id + "-" + UUID.randomUUID() + extension;
            Path targetPath = PROFILE_PICTURE_DIR.resolve(fileName).normalize();

            if (!targetPath.startsWith(PROFILE_PICTURE_DIR)) {
                throw new IllegalArgumentException("Invalid profile picture path.");
            }

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            user.setPictureUrl(uploadsBaseUrl + fileName);

            User savedUser = userRepository.save(user);
            return mapToDto(savedUser);
        } catch (IOException ex) {
            throw new RuntimeException("Unable to save profile picture.");
        }
    }

    private String extensionForContentType(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }

    private String normalizePictureUrl(String pictureUrl) {
        if (pictureUrl == null || pictureUrl.isBlank()) {
            return null;
        }

        String trimmedPictureUrl = pictureUrl.trim();
        if (trimmedPictureUrl.startsWith("data:") || trimmedPictureUrl.startsWith("blob:")) {
            throw new IllegalArgumentException("Please upload the profile picture again before saving.");
        }

        return trimmedPictureUrl;
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
