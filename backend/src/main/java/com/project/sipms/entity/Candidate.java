package com.project.sipms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 20)
    private String cin;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<InternshipFile> internshipFiles = new ArrayList<>();

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

    public boolean isHasUserAccount() {
        return user != null;
    }

    // ── Convenience: get latest InternshipFile data ──────────

    public String getSkillsTags() {
        return internshipFiles.isEmpty() ? "" : internshipFiles.get(internshipFiles.size() - 1).getSkillsTags();
    }

    public String getDegree() {
        return internshipFiles.isEmpty() ? "" : internshipFiles.get(internshipFiles.size() - 1).getDegree();
    }

    public String getUniversity() {
        return internshipFiles.isEmpty() ? "" : internshipFiles.get(internshipFiles.size() - 1).getUniversity();
    }

    public Integer getGraduationYear() {
        return internshipFiles.isEmpty() ? null : internshipFiles.get(internshipFiles.size() - 1).getYear();
    }

    public String getBio() {
        return internshipFiles.isEmpty() ? "" : internshipFiles.get(internshipFiles.size() - 1).getSkillsTags();
    }
}
