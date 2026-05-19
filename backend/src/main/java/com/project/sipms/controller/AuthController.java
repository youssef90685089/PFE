package com.project.sipms.controller;

import com.project.sipms.common.ApiResponse;
import com.project.sipms.common.BusinessException;
import com.project.sipms.dto.AuthResponse;
import com.project.sipms.dto.ChangePasswordRequest;
import com.project.sipms.dto.LoginRequest;
import com.project.sipms.entity.User;
import com.project.sipms.repository.UserRepository;
import com.project.sipms.security.JwtTokenProvider;
import com.project.sipms.security.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    // ── POST /api/auth/login ───────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        log.info("Login attempt for: {}", request.getEmail());

        try {
            var userOpt = userRepository.findByEmail(request.getEmail());
            if (userOpt.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.error("Invalid email or password"));
            }

            User user = userOpt.get();
            log.info("User found: {}, active: {}", user.getEmail(), user.isActive());

            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                log.warn("Password mismatch for: {}", user.getEmail());
                return ResponseEntity.ok(ApiResponse.error("Invalid email or password"));
            }

            if (!user.isActive()) {
                return ResponseEntity.ok(ApiResponse.error("Account is inactive. Contact your administrator."));
            }

            boolean mustChangePassword = user.isMustChangePassword();
            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
            String accessToken  = tokenProvider.generateAccessToken(userDetails);
            String refreshToken = tokenProvider.generateRefreshToken(userDetails);

            List<String> roles = new ArrayList<>();
            userDetails.getAuthorities().forEach(a -> roles.add(a.getAuthority()));

            AuthResponse response = AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .userId(userDetails.getId())
                    .email(userDetails.getEmail())
                    .fullName(userDetails.getFullName())
                    .roles(roles)
                    .mustChangePassword(mustChangePassword)
                    .specialty(user.getSpecialty())
                    .status(user.getStatus())
                    .quizCompleted("quiz_completed".equals(user.getStatus()) || "quiz_failed".equals(user.getStatus()))
                    .build();

            log.info("Login successful for: {} | roles: {} | mustChange: {}", user.getEmail(), roles, mustChangePassword);
            return ResponseEntity.ok(ApiResponse.ok("Login successful", response));

        } catch (Exception e) {
            log.error("Login error for {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("Login error: " + e.getMessage()));
        }
    }

    // ── POST /api/auth/change-password ────────────────────────────────────
    // Called from ChangePasswordPage when mustChangePassword=true,
    // or anytime the logged-in user wants to change their password.
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestBody ChangePasswordRequest request) {

        if (currentUser == null) {
            return ResponseEntity.ok(ApiResponse.error("Not authenticated. Please log in again."));
        }

        log.info("Change-password request for userId={}", currentUser.getId());

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new BusinessException("User not found"));

        // 1. Verify current (temporary) password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            return ResponseEntity.ok(ApiResponse.error("Current password is incorrect"));
        }

        // 2. Basic strength check (min 8 chars, ≥1 uppercase, ≥1 digit)
        String np = request.getNewPassword();
        if (np == null || np.length() < 8
                || !np.matches(".*[A-Z].*")
                || !np.matches(".*[0-9].*")) {
            return ResponseEntity.ok(ApiResponse.error(
                    "New password must be at least 8 characters with one uppercase letter and one number"));
        }

        // 3. Save BCrypt hash and clear the forced-change flag
        user.setPasswordHash(passwordEncoder.encode(np));
        user.setMustChangePassword(false);
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", user.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully"));
    }
}