package com.project.sipms.service;

import com.project.sipms.common.AuditService;
import com.project.sipms.common.BusinessException;
import com.project.sipms.common.ResourceNotFoundException;
import com.project.sipms.dto.UserDto;
import com.project.sipms.entity.Role;
import com.project.sipms.entity.User;
import com.project.sipms.repository.RoleRepository;
import com.project.sipms.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * User management service — ADMIN CRUD operations.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuditService auditService;

    public UserService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, EmailService emailService,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.auditService = auditService;
    }

    // ── READ ──────────────────────────────────────────────────────────────

    /** All users — single JOIN FETCH query, no N+1 */
    public List<UserDto> getAllUsers() {
        return userRepository.findAllWithRoles().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /** Candidates only — used by ReceptionPanel to avoid loading all users */
    public List<UserDto> getCandidates() {
        return userRepository.findByRoleName("ROLE_CANDIDATE").stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        return toDto(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id)));
    }

    // ── CREATE ────────────────────────────────────────────────────────────

    /**
     * Create a user with proper roles and BCrypt password.
     * The frontend sends: { firstName, lastName, email, phone, password, roles: ["ROLE_ADMIN"] }
     * If no password is supplied, a random secure one is generated and mustChangePassword=true is set.
     */
    @Transactional
    public UserDto createUser(UserDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Email already registered: " + dto.getEmail());
        }

        // Resolve roles — default to ROLE_CANDIDATE if none specified
        Set<Role> roles = new HashSet<>();
        List<String> roleNames = (dto.getRoles() != null && !dto.getRoles().isEmpty())
                ? dto.getRoles()
                : List.of("ROLE_CANDIDATE");

        for (String roleName : roleNames) {
            // Accept both "ROLE_ADMIN" and "ADMIN"
            String normalized = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
            Role role = roleRepository.findByName(normalized)
                    .orElseThrow(() -> new BusinessException("Role not found: " + normalized));
            roles.add(role);
        }

        // If no password provided, generate a temporary one and force change on first login
        boolean mustChange = (dto.getPassword() == null || dto.getPassword().isBlank());
        String rawPassword = mustChange ? generateTempPassword() : dto.getPassword();

        User user = User.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .cin(dto.getCin())
                .specialty(dto.getSpecialty())
                .internshipYear(dto.getInternshipYear())
                .passwordHash(passwordEncoder.encode(rawPassword))
                .active(dto.getActive() != null ? dto.getActive() : true)
                .mustChangePassword(mustChange)
                .roles(roles)
                .build();

        user = userRepository.save(user);
        auditService.log("CREATE_USER", "USER", user.getId(),
                "Created user: " + user.getEmail() + " roles: " + roleNames);

        // Return the raw password in the response so admin can share it manually
        UserDto result = toDto(user);
        if (mustChange) {
            result.setPassword(rawPassword);  // Only set once — not stored in plain text
        }

        // Send welcome email with credentials — choose template based on role
        try {
            boolean isCandidate = roles.stream()
                    .anyMatch(role -> "ROLE_CANDIDATE".equals(role.getName()));
            
            if (isCandidate) {
                System.out.println("📧 [USER SERVICE] Triggering CANDIDATE welcome email for: " + dto.getEmail());
                // Send candidate-specific email with quiz deadline notice
                emailService.sendCandidateWelcomeEmail(
                        dto.getEmail(),
                        dto.getFirstName() + " " + dto.getLastName(),
                        rawPassword,
                        "http://localhost:5173/login",
                        null
                );
            } else {
                System.out.println("📧 [USER SERVICE] Triggering standard welcome email for: " + dto.getEmail());
                // Send standard welcome email for staff
                emailService.sendWelcomeEmail(
                        dto.getEmail(),
                        dto.getFirstName() + " " + dto.getLastName(),
                        rawPassword,
                        "http://localhost:5173/login"
                );
            }
        } catch (Exception e) {
            // Email failure is non-fatal — log and continue
            System.err.println("❌ [USER SERVICE] Error sending email: " + e.getMessage());
            e.printStackTrace();
        }

        return result;
    }

    // ── UPDATE ────────────────────────────────────────────────────────────

    @Transactional
    public UserDto updateUser(Long id, UserDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        if (dto.getFirstName() != null)  user.setFirstName(dto.getFirstName());
        if (dto.getLastName()  != null)  user.setLastName(dto.getLastName());
        if (dto.getPhone()     != null)  user.setPhone(dto.getPhone());
        if (dto.getCin()       != null)  user.setCin(dto.getCin());
        if (dto.getSpecialty() != null)  user.setSpecialty(dto.getSpecialty());
        if (dto.getActive()    != null)  user.setActive(dto.getActive());

        // Update roles if provided
        if (dto.getRoles() != null && !dto.getRoles().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : dto.getRoles()) {
                String normalized = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
                Role role = roleRepository.findByName(normalized)
                        .orElseThrow(() -> new BusinessException("Role not found: " + normalized));
                roles.add(role);
            }
            user.setRoles(roles);
        }

        // Update password if explicitly provided
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
            user.setMustChangePassword(false);
        }

        UserDto result = toDto(userRepository.save(user));
        auditService.log("UPDATE_USER", "USER", id,
                "Updated user: " + user.getEmail());
        return result;
    }

    // ── TOGGLE ACTIVE ─────────────────────────────────────────────────────

    @Transactional
    public UserDto toggleUserActive(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setActive(!user.isActive());
        UserDto result = toDto(userRepository.save(user));
        auditService.log("TOGGLE_USER_ACTIVE", "USER", id,
                "User " + user.getEmail() + " active=" + user.isActive());
        return result;
    }

    // ── DELETE ────────────────────────────────────────────────────────────

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        userRepository.deleteById(id);
        auditService.log("DELETE_USER", "USER", id,
                "Deleted user: " + user.getEmail());
    }

    // ── HELPERS ───────────────────────────────────────────────────────────

    /** Map User entity → UserDto (never includes password hash) */
    public UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .cin(user.getCin())
                .specialty(user.getSpecialty())
                .internshipYear(user.getInternshipYear())
                .avatarUrl(user.getAvatarUrl())
                .active(user.isActive())
                .roles(user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toList()))
                .createdAt(user.getCreatedAt())
                .build();
    }

    /** Generate a secure 10-char temp password that satisfies strength rules */
    private String generateTempPassword() {
        String upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        String lower = "abcdefghjkmnpqrstuvwxyz";
        String digits = "23456789";
        String all   = upper + lower + digits;

        java.util.Random rnd = new java.security.SecureRandom();
        StringBuilder sb = new StringBuilder();
        sb.append(upper.charAt(rnd.nextInt(upper.length())));   // guarantee 1 uppercase
        sb.append(digits.charAt(rnd.nextInt(digits.length()))); // guarantee 1 digit
        for (int i = 2; i < 10; i++) {
            sb.append(all.charAt(rnd.nextInt(all.length())));
        }
        // Shuffle
        char[] chars = sb.toString().toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = rnd.nextInt(i + 1);
            char tmp = chars[i]; chars[i] = chars[j]; chars[j] = tmp;
        }
        return new String(chars);
    }
}
