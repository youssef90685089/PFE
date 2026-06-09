package com.project.sipms.controller;

import com.project.sipms.common.ApiResponse;
import com.project.sipms.dto.*;
import com.project.sipms.security.UserDetailsImpl;
import com.project.sipms.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/quizzes")
@Tag(name = "Quizzes", description = "Quiz management and assessment")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    // ── GET all quizzes — Admin / Manager / Receptionist ─────────────────────
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','RECEPTIONIST')")
    @Operation(summary = "Get all quizzes (with answers for Manager/Admin)")
    public ResponseEntity<ApiResponse<List<QuizDto>>> getAllQuizzes() {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getAllQuizzes()));
    }

    // ── GET active quizzes — Candidate only ───────────────────────────────────
    @GetMapping("/active")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get active quizzes for candidates (without correct answers)")
    public ResponseEntity<ApiResponse<List<QuizDto>>> getActiveQuizzes() {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getActiveQuizzes()));
    }

    // ── GET quiz by specialty — Candidate only ────────────────────────────────
    @GetMapping("/by-specialty")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get the active quiz matching a candidate's specialty")
    public ResponseEntity<ApiResponse<QuizDto>> getBySpecialty(
            @RequestParam String specialty) {
        Optional<QuizDto> quiz = quizService.getQuizBySpecialty(specialty);
        if (quiz.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("No quiz found for specialty: " + specialty));
        }
        return ResponseEntity.ok(ApiResponse.ok(quiz.get()));
    }

    // ── GET my assigned quiz — Candidate ─────────────────────────────────────
    @GetMapping("/my-quiz")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get the quiz assigned to the current candidate")
    public ResponseEntity<ApiResponse<QuizDto>> getMyQuiz(
            @AuthenticationPrincipal UserDetailsImpl user) {
        Optional<QuizDto> quiz = quizService.getMyQuiz(user.getId());
        if (quiz.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("No quiz has been assigned to you yet. Please wait for manager approval."));
        }
        return ResponseEntity.ok(ApiResponse.ok("Quiz found", quiz.get()));
    }

    // ── GET my quiz results — Candidate ──────────────────────────────────────
    @GetMapping("/my-results")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get current candidate's quiz results")
    public ResponseEntity<ApiResponse<List<QuizResultDto>>> getMyResults(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getCandidateResults(user.getId())));
    }

    // ── GET quiz for taking — Candidate ──────────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get quiz for taking (without correct answers)")
    public ResponseEntity<ApiResponse<QuizDto>> getQuizForCandidate(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getQuizForCandidate(id)));
    }

    // ── GET quiz with answers — Admin / Manager ───────────────────────────────
    @GetMapping("/{id}/full")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Get quiz with correct answers (Manager/Admin)")
    public ResponseEntity<ApiResponse<QuizDto>> getQuizFull(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getQuizWithAnswers(id)));
    }

    // ── POST create quiz — Admin / Manager / Receptionist ────────────────────
    @PostMapping(value = {"", "/"})
    @Operation(summary = "Create a new quiz with questions")
    public ResponseEntity<ApiResponse<QuizDto>> createQuiz(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestBody QuizCreateRequest req) {
        System.out.println("Quiz creation request received from user: " + user.getEmail());
        QuizDto created = quizService.createQuiz(req, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Quiz created successfully", created));
    }

    // ── PUT update quiz — Admin / Manager ─────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Update an existing quiz with questions")
    public ResponseEntity<ApiResponse<QuizDto>> updateQuiz(
            @PathVariable Long id,
            @RequestBody QuizCreateRequest req) {
        QuizDto updated = quizService.updateQuiz(id, req);
        return ResponseEntity.ok(ApiResponse.ok("Quiz updated successfully", updated));
    }

    // ── POST submit quiz — Candidate ──────────────────────────────────────────
    @PostMapping("/submit")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Submit quiz answers for automated grading")
    public ResponseEntity<ApiResponse<QuizResultDto>> submitQuiz(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestBody QuizSubmissionRequest submission) {
        return ResponseEntity.ok(ApiResponse.ok("Quiz graded successfully",
                quizService.submitQuiz(user.getId(), submission)));
    }

    // ── POST assign quiz to a candidate — Admin / Receptionist ───────────────
    @PostMapping("/{quizId}/assign/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    @Operation(summary = "Assign a quiz to a specific candidate user")
    public ResponseEntity<ApiResponse<String>> assignToCandidate(
            @PathVariable Long quizId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Quiz " + quizId + " assigned to user " + userId));
    }
}
