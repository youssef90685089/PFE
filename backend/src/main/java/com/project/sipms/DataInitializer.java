package com.project.sipms;

import com.project.sipms.entity.Role;
import com.project.sipms.entity.User;
import com.project.sipms.repository.RoleRepository;
import com.project.sipms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, RoleRepository roleRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            // ── Ensure roles exist ─────────────────────────────────────────
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));
            Role managerRole = roleRepository.findByName("ROLE_MANAGER")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_MANAGER").build()));
            Role receptionistRole = roleRepository.findByName("ROLE_RECEPTIONIST")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_RECEPTIONIST").build()));
            Role candidateRole = roleRepository.findByName("ROLE_CANDIDATE")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_CANDIDATE").build()));

            // ── Create or repair seed accounts on every startup ────────────
            ensureSeedUser(userRepository, passwordEncoder,
                    "admin@sipms.com", "System", "Administrator", Set.of(adminRole));
            ensureSeedUser(userRepository, passwordEncoder,
                    "manager@sipms.com", "Project", "Manager", Set.of(managerRole));
            ensureSeedUser(userRepository, passwordEncoder,
                    "reception@sipms.com", "Reception", "Desk", Set.of(receptionistRole));
            ensureSeedUser(userRepository, passwordEncoder,
                    "candidate@test.com", "Test", "Candidate", Set.of(candidateRole));

            System.out.println("=== SIPMS READY TO LOGIN ===");
            System.out.println("Accounts: admin@sipms.com | manager@sipms.com | reception@sipms.com | candidate@test.com");
            System.out.println("Password: Admin@123");
        };
    }

    /**
     * Upsert a seed user:
     *  - Does NOT exist → create with BCrypt hash, active=true, mustChangePassword=false.
     *  - Already exists  → force active=true + mustChangePassword=false to repair any stale DB state
     *                      that would otherwise block logins after a redeploy or bad data.sql run.
     */
    private void ensureSeedUser(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                 String email, String firstName, String lastName, Set<Role> roles) {
        userRepository.findByEmail(email).ifPresentOrElse(
            existing -> {
                boolean dirty = false;
                if (!existing.isActive()) {
                    existing.setActive(true);
                    dirty = true;
                }
                if (existing.isMustChangePassword()) {
                    existing.setMustChangePassword(false);
                    dirty = true;
                }
                if (dirty) {
                    userRepository.save(existing);
                    System.out.println("[DataInit] REPAIRED: " + email);
                } else {
                    System.out.println("[DataInit] OK: " + email);
                }
            },
            () -> {
                User newUser = User.builder()
                        .firstName(firstName)
                        .lastName(lastName)
                        .email(email)
                        .passwordHash(passwordEncoder.encode("Admin@123"))
                        .active(true)
                        .mustChangePassword(false)
                        .roles(roles)
                        .build();
                userRepository.save(newUser);
                System.out.println("[DataInit] CREATED: " + email);
            }
        );
    }
}