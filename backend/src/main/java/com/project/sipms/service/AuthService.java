package com.project.sipms.service;

import com.project.sipms.common.AuditService;
import com.project.sipms.common.BusinessException;
import com.project.sipms.dto.AuthResponse;
import com.project.sipms.dto.LoginRequest;
import com.project.sipms.dto.RegisterRequest;
import com.project.sipms.entity.Candidate;
import com.project.sipms.entity.Role;
import com.project.sipms.entity.User;
import com.project.sipms.repository.CandidateRepository;
import com.project.sipms.repository.RoleRepository;
import com.project.sipms.repository.UserRepository;
import com.project.sipms.security.JwtTokenProvider;
import com.project.sipms.security.UserDetailsImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Authentication service — handles login and registration logic.
 */
@Service
public class AuthService {

    private final AuthenticationManager authManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CandidateRepository candidateRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;

    public AuthService(AuthenticationManager authManager, UserRepository userRepository,
                       RoleRepository roleRepository, CandidateRepository candidateRepository,
                       PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider,
                       AuditService auditService) {
        this.authManager = authManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.candidateRepository = candidateRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.auditService = auditService;
    }

    /** Authenticate user and return JWT tokens. */
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String accessToken = tokenProvider.generateAccessToken(userDetails);
        String refreshToken = tokenProvider.generateRefreshToken(userDetails);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(userDetails.getId())
                .email(userDetails.getEmail())
                .fullName(userDetails.getFullName())
                .roles(roles)
                .build();
    }

    /** Register a new candidate user. */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email is already registered: " + request.getEmail());
        }

        // Find the CANDIDATE role
        Role candidateRole = roleRepository.findByName("ROLE_CANDIDATE")
                .orElseThrow(() -> new BusinessException("Default role ROLE_CANDIDATE not found"));

        // Create user
        Set<Role> roles = new HashSet<>();
        roles.add(candidateRole);

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .active(true)
                .roles(roles)
                .build();
        user = userRepository.save(user);

        // Create candidate profile
        Candidate candidate = Candidate.builder()
                .user(user)
                .university(request.getUniversity())
                .degree(request.getDegree())
                .graduationYear(request.getGraduationYear())
                .skillsTags(request.getSkillsTags())
                .bio(request.getBio())
                .build();
        candidateRepository.save(candidate);

        // Generate tokens
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String accessToken = tokenProvider.generateAccessToken(userDetails);
        String refreshToken = tokenProvider.generateRefreshToken(userDetails);

        auditService.log("REGISTER", "USER", user.getId(),
                "{\"email\":\"" + user.getEmail() + "\",\"role\":\"CANDIDATE\"}");

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .roles(List.of("ROLE_CANDIDATE"))
                .build();
    }

    /** Refresh access token using refresh token. */
    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BusinessException("Invalid or expired refresh token");
        }

        String email = tokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found: " + email));

        if (!user.isActive()) {
            throw new BusinessException("User account is inactive");
        }

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String newAccessToken = tokenProvider.generateAccessToken(userDetails);
        String newRefreshToken = tokenProvider.generateRefreshToken(userDetails);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .roles(roles)
                .build();
    }

    /** Request password reset - sends reset email (simplified for demo). */
    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found with email: " + email));
        
        if (!user.isActive()) {
            throw new BusinessException("User account is inactive");
        }
        
        auditService.log("PASSWORD_RESET_REQUEST", "USER", user.getId(), 
                "{\"email\":\"" + email + "\",\"action\":\"requested\"}");
    }

    /** Reset password using reset token (simplified - in production use reset token). */
    @Transactional
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found with email: " + email));
        
        if (!user.isActive()) {
            throw new BusinessException("User account is inactive");
        }
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        auditService.log("PASSWORD_RESET", "USER", user.getId(), 
                "{\"email\":\"" + email + "\",\"action\":\"completed\"}");
    }

    /** Change password for logged-in user. */
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));
        
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BusinessException("Current password is incorrect");
        }
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        auditService.log("PASSWORD_CHANGE", "USER", userId, "{\"action\":\"completed\"}");
    }
}
