package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class InterviewDto {
    private Long id;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private Long applicationId;
    private LocalDateTime scheduledAt;
    private String interviewer;
    private String type;
    private String status;
    private Integer score;
    private String notes;
    private String feedback;
    private LocalDateTime createdAt;
}