package com.project.sipms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Supervisor entity — faculty/staff who oversee internship projects.
 */
@Entity
@Table(name = "supervisors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Supervisor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 200)
    private String department;

    @Column(name = "expertise_tags", nullable = false, length = 1000)
    private String expertiseTags;

    @Column(name = "max_interns", nullable = false)
    @Builder.Default
    private int maxInterns = 3;

    @Column(name = "current_interns", nullable = false)
    @Builder.Default
    private int currentInterns = 0;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
