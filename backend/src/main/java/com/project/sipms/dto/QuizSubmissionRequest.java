package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

/** Quiz submission request — map of questionId → selectedOption */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizSubmissionRequest {
    private Long quizId;
    private Long applicationId;
    private Map<Long, String> answers; // questionId → "A"/"B"/"C"/"D"
}
