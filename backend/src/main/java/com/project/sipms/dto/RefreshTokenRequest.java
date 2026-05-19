package com.project.sipms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request to refresh JWT access token using refresh token
 */
@Data
public class RefreshTokenRequest {
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
