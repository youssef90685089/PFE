package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for creating a quiz with questions in one request.
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizCreateRequest {

    private String title;
    private String description;
    private String specialty;   // e.g. "Web Development", "Security", "Data Science"
    private Integer durationMins;
    private Integer passingScore;
    private List<QuestionCreateDto> questions;

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class QuestionCreateDto {
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctOption;  // "A", "B", "C", or "D"
        private Integer marks;
        private Integer orderIndex;
    }
}
