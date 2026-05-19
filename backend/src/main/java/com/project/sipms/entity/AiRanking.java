package com.project.sipms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * AiRanking entity — stores AI-generated scores for projects and candidates.
 */
@Entity
@Table(name = "ai_rankings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiRanking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "ranking_type", nullable = false, length = 20)
    private RankingType rankingType;

    @Column(name = "reference_id", nullable = false)
    private Long referenceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private Supervisor supervisor;

    @Column(nullable = false)
    private double score;

    @Column(columnDefinition = "TEXT")
    private String reasoning;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ranked_by")
    private User rankedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum RankingType {
        PROJECT_RANK, CANDIDATE_MATCH
    }
}
