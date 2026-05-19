package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/** User response DTO — never exposes password hash */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String cin;
    private String specialty;
    private Integer internshipYear;
    private String avatarUrl;
    private Boolean active;
    private List<String> roles;
    private LocalDateTime createdAt;
    /** Temporary plain-text password — returned ONLY once on user creation when auto-generated */
    private String password;
}
