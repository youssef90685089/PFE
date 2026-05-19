package com.project.sipms.ai.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for AI analysis requests
 * Handles CV analysis, content generation, recommendations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIAnalysisRequest {
    
    @NotBlank(message = "Content is required for analysis")
    private String content;
    
    @NotBlank(message = "Analysis type is required")
    private String analysisType; // CV_ANALYSIS, PROJECT_MATCHING, SKILL_ASSESSMENT, etc.
    
    private String context; // Optional additional context
}
