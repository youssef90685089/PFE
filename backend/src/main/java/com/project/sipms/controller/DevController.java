package com.project.sipms.controller;

import com.project.sipms.entity.Role;
import com.project.sipms.entity.User;
import com.project.sipms.repository.RoleRepository;
import com.project.sipms.repository.UserRepository;
import com.project.sipms.security.JwtTokenProvider;
import com.project.sipms.security.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dev")
public class DevController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public DevController(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/create-user")
    public ResponseEntity<Map<String, Object>> createUser(
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String role) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (userRepository.findByEmail(email).isPresent()) {
            response.put("message", "User already exists: " + email);
            return ResponseEntity.ok(response);
        }

        Role userRole = roleRepository.findByName(role)
                .orElseGet(() -> roleRepository.save(Role.builder().name(role).build()));

        User user = User.builder()
                .firstName(email.split("@")[0])
                .lastName("User")
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .active(true)
                .roles(java.util.Set.of(userRole))
                .build();

        userRepository.save(user);
        
        response.put("message", "User created successfully");
        response.put("email", email);
        response.put("role", role);
        response.put("passwordHash", user.getPasswordHash().substring(0, 30) + "...");
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/direct-login")
    public ResponseEntity<Map<String, Object>> directLogin(
            @RequestParam String email,
            @RequestParam String password) {
        Map<String, Object> response = new HashMap<>();
        
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.ok(response);
        }
        
        User user = userOpt.get();
        
        boolean matches = passwordEncoder.matches(password, user.getPasswordHash());
        
        if (!matches) {
            response.put("success", false);
            response.put("message", "Invalid password");
            return ResponseEntity.ok(response);
        }
        
        if (!user.isActive()) {
            response.put("success", false);
            response.put("message", "User is inactive");
            return ResponseEntity.ok(response);
        }
        
        // Generate JWT
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String token = tokenProvider.generateAccessToken(userDetails);
        String refreshToken = tokenProvider.generateRefreshToken(userDetails);
        
        response.put("success", true);
        response.put("message", "Login OK!");
        response.put("email", user.getEmail());
        response.put("accessToken", token);
        response.put("refreshToken", refreshToken);
        response.put("roles", user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()));
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> listUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("email", u.getEmail());
                    map.put("active", u.isActive());
                    map.put("roles", u.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()));
                    map.put("passwordHash", u.getPasswordHash() != null ? u.getPasswordHash().substring(0, 20) + "..." : "NULL");
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/test-login")
    public ResponseEntity<Map<String, String>> testLogin(@RequestParam String email, @RequestParam String password) {
        Map<String, String> response = new HashMap<>();
        
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            response.put("result", "USER NOT FOUND");
            return ResponseEntity.ok(response);
        }
        
        User user = userOpt.get();
        response.put("result", "USER FOUND");
        response.put("email", user.getEmail());
        response.put("active", String.valueOf(user.isActive()));
        response.put("passwordMatches", String.valueOf(passwordEncoder.matches(password, user.getPasswordHash())));
        response.put("storedHash", user.getPasswordHash().substring(0, 30) + "...");
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/fix-password")
    public ResponseEntity<Map<String, Object>> fixPassword(@RequestParam String email, @RequestParam String newPassword) {
        Map<String, Object> response = new HashMap<>();
        
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            response.put("result", "USER NOT FOUND");
            return ResponseEntity.ok(response);
        }
        
        User user = userOpt.get();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        response.put("result", "PASSWORD RESET SUCCESS");
        response.put("email", email);
        response.put("newHash", user.getPasswordHash().substring(0, 30) + "...");
        
        return ResponseEntity.ok(response);
    }
}