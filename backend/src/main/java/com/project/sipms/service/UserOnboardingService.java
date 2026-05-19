package com.project.sipms.service;

import com.project.sipms.entity.Role;
import com.project.sipms.entity.User;
import com.project.sipms.repository.RoleRepository;
import com.project.sipms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Set;

@Service
public class UserOnboardingService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;

    @Value("${app.login.url:http://localhost:5173}")
    private String loginUrl;

    private final SecureRandom secureRandom = new SecureRandom();
    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";

    public UserOnboardingService(UserRepository userRepository, RoleRepository roleRepository,
                                 PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public User createUserWithTempPassword(String email, String firstName, String lastName, String roleName) {
        // 1. Generate secure random password
        String tempPassword = generateSecurePassword(12);

        // 2. Check if user exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + email);
        }

        // 3. Get role
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));

        // 4. Create user with temp password
        User user = User.builder()
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .passwordHash(passwordEncoder.encode(tempPassword))
                .mustChangePassword(true)
                .active(true)
                .roles(Set.of(role))
                .build();

        // 5. Save user to database
        User savedUser = userRepository.save(user);

        // 6. Send welcome email (with rollback if fails)
        if (emailEnabled) {
            try {
                emailService.sendWelcomeEmail(email, firstName, tempPassword, loginUrl);
            } catch (Exception e) {
                // Email failed - rollback by deleting user
                userRepository.delete(savedUser);
                throw new RuntimeException("Failed to send welcome email. User not created.", e);
            }
        }

        return savedUser;
    }

    /**
     * Create user with a caller-supplied plaintext password (so the caller
     * can also pass it into the welcome email).
     */
    @Transactional
    public User createUserWithPassword(String email, String firstName, String lastName,
                                       String roleName, String plainPassword) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + email);
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));

        User user = User.builder()
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .passwordHash(passwordEncoder.encode(plainPassword))
                .mustChangePassword(true)
                .active(true)
                .roles(Set.of(role))
                .build();

        return userRepository.save(user);
    }

    @Transactional
    public void resetUserPassword(Long userId, String tempPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        user.setMustChangePassword(true);
        userRepository.save(user);
    }

    private String generateSecurePassword(int length) {
        StringBuilder password = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            password.append(PASSWORD_CHARS.charAt(secureRandom.nextInt(PASSWORD_CHARS.length())));
        }
        return password.toString();
    }
}