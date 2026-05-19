package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizResultDto {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private int score;
    private int totalMarks;
    private double percentage;
    private boolean passed;
    private int passingScore;
    private LocalDateTime completedAt;
}
