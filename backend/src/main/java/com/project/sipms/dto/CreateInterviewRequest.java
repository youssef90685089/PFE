package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateInterviewRequest {
    private Long candidateId;
    private Long applicationId;
    private LocalDateTime scheduledAt;
    private String interviewer;
    private String type;
}