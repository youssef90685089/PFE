package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CandidateDto {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String university;
    private String degree;
    private Integer graduationYear;
    private String skillsTags;
    private String cvFilePath;
    private String photoPath;
    private String bio;
    private LocalDateTime createdAt;
}
