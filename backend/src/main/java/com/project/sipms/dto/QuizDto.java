package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizDto {
    private Long id;
    private String title;
    private String description;
    private String specialty;
    private int durationMins;
    private int passingScore;
    private int totalMarks;
    private boolean active;
    private int questionCount;
    private List<QuestionDto> questions;
    private LocalDateTime createdAt;
}
