package com.project.sipms.controller;

import com.project.sipms.entity.User;
import com.project.sipms.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    private final UserRepository userRepository;

    public DebugController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<String> getUserByEmail(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .map(u -> ResponseEntity.ok("Found: " + u.getEmail() + " | Hash: " + u.getPasswordHash().substring(0, 20) + "..."))
                .orElse(ResponseEntity.notFound().build());
    }
}