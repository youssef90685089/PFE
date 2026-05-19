package com.project.sipms.controller;

import com.project.sipms.common.ApiResponse;
import com.project.sipms.common.FileStorageService;
import com.project.sipms.entity.Application;
import com.project.sipms.entity.Document;
import com.project.sipms.entity.User;
import com.project.sipms.repository.ApplicationRepository;
import com.project.sipms.repository.DocumentRepository;
import com.project.sipms.repository.RoleRepository;
import com.project.sipms.repository.UserRepository;
import com.project.sipms.service.EmailService;
import com.project.sipms.service.UserOnboardingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/candidates")
@PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
public class CandidateController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserOnboardingService onboardingService;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;
    private final ApplicationRepository applicationRepository;
    private final DocumentRepository documentRepository;

    public CandidateController(UserRepository userRepository, RoleRepository roleRepository,
                                UserOnboardingService onboardingService, EmailService emailService,
                                FileStorageService fileStorageService,
                                ApplicationRepository applicationRepository,
                                DocumentRepository documentRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.onboardingService = onboardingService;
        this.emailService = emailService;
        this.fileStorageService = fileStorageService;
        this.applicationRepository = applicationRepository;
        this.documentRepository = documentRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllCandidates(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String status) {
        
        var candidates = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_CANDIDATE")))
                .filter(u -> specialty == null || specialty.isEmpty() || u.getSpecialty().equals(specialty))
                .filter(u -> status == null || status.isEmpty() || u.getStatus().equals(status))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.<Map<String,Object>>ok("candidates", Map.of("data", candidates)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        var candidates = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_CANDIDATE")))
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", candidates.size());
        stats.put("pending_quiz", candidates.stream().filter(u -> "pending_quiz".equals(u.getStatus())).count());
        stats.put("quiz_completed", candidates.stream().filter(u -> "quiz_completed".equals(u.getStatus())).count());
        stats.put("quiz_failed", candidates.stream().filter(u -> "quiz_failed".equals(u.getStatus())).count());
        stats.put("hired", candidates.stream().filter(u -> "hired".equals(u.getStatus())).count());

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createCandidate(
            @RequestParam String email,
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam String specialty) {

        try {
            // 1. Generate temp password manually so we can pass it to the email
            java.security.SecureRandom rnd = new java.security.SecureRandom();
            String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
            StringBuilder sb = new StringBuilder(10);
            for (int i = 0; i < 10; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
            String tempPassword = sb.toString();

            // 2. Create user with the generated password via onboarding service
            com.project.sipms.entity.User user =
                    onboardingService.createUserWithPassword(email, firstName, lastName,
                            "ROLE_CANDIDATE", tempPassword);

            // 3. Persist specialty + status
            user.setSpecialty(specialty);
            user.setStatus("pending_quiz");
            user.setQuizCreatedAt(java.time.LocalDateTime.now());
            userRepository.save(user);

            // 4. Send welcome email with the REAL temp password
            try {
                emailService.sendWelcomeEmail(
                        email,
                        firstName + " " + lastName,
                        tempPassword,
                        "http://localhost:5174/login"
                );
            } catch (Exception emailEx) {
                // Email failure is non-fatal — candidate is still created
                System.err.println("Welcome email failed: " + emailEx.getMessage());
            }

            return ResponseEntity.ok(ApiResponse.ok("Candidate created successfully", Map.of(
                    "userId",       user.getId(),
                    "email",        email,
                    "specialty",    specialty,
                    "tempPassword", tempPassword,
                    "emailSent",    true
            )));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Failed to create candidate: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        
        var userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("Candidate not found"));
        }

        User user = userOpt.get();
        user.setStatus(status);
        
        if ("quiz_completed".equals(status)) {
            user.setQuizCompletedAt(LocalDateTime.now());
        }
        
        userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.ok("Status updated to " + status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCandidate(@PathVariable Long id) {
        try {
            userRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.ok("Candidate deleted"));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Failed to delete candidate"));
        }
    }

    // ── Upload documents for a candidate (receptionist on behalf) ──────────────
    @PostMapping(value = "/{userId}/documents", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadDocuments(
            @PathVariable Long userId,
            @RequestParam(value = "cv",          required = false) MultipartFile cv,
            @RequestParam(value = "coverLetter", required = false) MultipartFile coverLetter,
            @RequestParam(value = "transcript",  required = false) MultipartFile transcript,
            @RequestParam(value = "idCard",      required = false) MultipartFile idCard,
            @RequestParam(value = "other",       required = false) MultipartFile other) {

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.ok(ApiResponse.error("Candidate not found"));

        // Find or create a physical application for this candidate
        Application application = applicationRepository
                .findFirstByIntakeMethodAndRegisteredById(Application.IntakeMethod.PHYSICAL, userId)
                .orElseGet(() -> applicationRepository.save(
                        Application.builder().intakeMethod(Application.IntakeMethod.PHYSICAL).registeredBy(user).build()
                ));

        List<String> uploaded = new ArrayList<>();
        saveDoc(application, user, cv,          Document.DocumentType.CV,           "cv",            uploaded);
        saveDoc(application, user, coverLetter, Document.DocumentType.COVER_LETTER, "cover-letters", uploaded);
        saveDoc(application, user, transcript,  Document.DocumentType.TRANSCRIPT,   "transcripts",   uploaded);
        saveDoc(application, user, idCard,      Document.DocumentType.ID_CARD,      "id-cards",      uploaded);
        saveDoc(application, user, other,       Document.DocumentType.OTHER,        "others",        uploaded);

        return ResponseEntity.ok(ApiResponse.ok("Documents uploaded",
                Map.of("uploaded", uploaded, "count", uploaded.size())));
    }

    private void saveDoc(Application app, User uploader, MultipartFile file,
                         Document.DocumentType type, String subdir, List<String> uploaded) {
        if (file == null || file.isEmpty()) return;
        try {
            String path = fileStorageService.storeFile(file, subdir);
            Document doc = Document.builder()
                    .application(app)
                    .fileName(file.getOriginalFilename())
                    .filePath(path)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .documentType(type)
                    .uploadedBy(uploader)
                    .build();
            documentRepository.save(doc);
            uploaded.add(file.getOriginalFilename());
        } catch (Exception ignored) { /* non-fatal */ }
    }
}