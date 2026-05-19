package com.project.sipms.controller;

import com.project.sipms.common.ApiResponse;
import com.project.sipms.entity.User;
import com.project.sipms.service.UserOnboardingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management")
public class UserOnboardingController {

    private final UserOnboardingService onboardingService;

    public UserOnboardingController(UserOnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @PostMapping("/onboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new user with temporary password")
    public ResponseEntity<ApiResponse<User>> onboardUser(
            @RequestParam String email,
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam String role) {
        
        try {
            User user = onboardingService.createUserWithTempPassword(email, firstName, lastName, role);
            return ResponseEntity.ok(ApiResponse.ok("User created. Welcome email sent.", user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Failed to create user: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reset user password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@PathVariable Long id) {
        try {
            // Generate new temp password
            String tempPassword = java.security.MessageDigest.getInstance("SHA-256")
                    .digest(Long.toString(System.nanoTime()).getBytes())
                    .toString().substring(0, 12);
            
            onboardingService.resetUserPassword(id, tempPassword);
            return ResponseEntity.ok(ApiResponse.ok("Password reset. Email sent.", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Failed to reset password: " + e.getMessage()));
        }
    }
}