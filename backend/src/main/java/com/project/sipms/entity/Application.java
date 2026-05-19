package com.project.sipms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Application entity — tracks the full internship application lifecycle.
 * Status flow: PENDING → UNDER_REVIEW → QUIZ_PENDING → QUIZ_COMPLETED → AI_EVALUATING → MANAGER_REVIEW → ACCEPTED/REJECTED
 */
@Entity
@Table(name = "applications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private Supervisor supervisor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "intake_method", nullable = false, length = 10)
    @Builder.Default
    private IntakeMethod intakeMethod = IntakeMethod.ONLINE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registered_by")
    private User registeredBy;

    @Column(name = "manager_notes", columnDefinition = "TEXT")
    private String managerNotes;

    @Column(name = "decision_date")
    private LocalDateTime decisionDate;

    @Column(name = "ai_match_score")
    private Double aiMatchScore;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ApplicationStatus {
        PENDING, UNDER_REVIEW, QUIZ_PENDING, QUIZ_COMPLETED,
        AI_EVALUATING, MANAGER_REVIEW, ACCEPTED, REJECTED
    }

    public enum IntakeMethod {
        ONLINE, PHYSICAL
    }
}
