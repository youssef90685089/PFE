package com.project.sipms.dto;

import com.project.sipms.common.validation.StrongPassword;
import jakarta.validation.constraints.*;
import lombok.Data;

/** Registration request DTO */
@Data
public class RegisterRequest {
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100, message = "First name must be 2-100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100, message = "Last name must be 2-100 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email")
    private String email;

    @NotBlank(message = "Password is required")
    @StrongPassword(message = "Password must be at least 8 chars with uppercase, lowercase, digit, and special char (@$!%*?&)")
    private String password;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    // Optional candidate fields
    @Size(max = 300, message = "University name too long")
    private String university;
    
    @Size(max = 200, message = "Degree too long")
    private String degree;
    
    @Min(value = 1900, message = "Invalid graduation year")
    @Max(value = 2050, message = "Invalid graduation year")
    private Integer graduationYear;
    
    @Size(max = 1000, message = "Skills tags too long")
    private String skillsTags;
    
    @Size(max = 2000, message = "Bio too long")
    private String bio;
}
