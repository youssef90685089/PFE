package com.project.sipms.ai.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.Map;

/**
 * DTO for AI analysis responses
 * Contains analysis results, scores, recommendations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIAnalysisResponse {
    
    private String analysisId;
    private String analysisType;
    private Double confidenceScore; // 0.0 - 1.0
    private String summary;
    private String detailedAnalysis;
    
    private List<String> keyPoints;
    private List<String> recommendations;
    private Map<String, Double> scoringMetrics;
    
    private Long processingTimeMs;
    private String status; // SUCCESS, PARTIAL, FAILED
}
