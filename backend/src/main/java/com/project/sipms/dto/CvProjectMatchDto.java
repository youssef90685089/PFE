package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

/**
 * DTO for CV-to-Projects matching response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvProjectMatchDto {
    private String roadmap;
    private List<ProjectMatchDto> matchedProjects;
    private String detectedSkills;
    private String message;

    /** Create an empty result with a user-friendly message */
    public static CvProjectMatchDto empty(String msg) {
        return CvProjectMatchDto.builder()
                .matchedProjects(Collections.emptyList())
                .detectedSkills("")
                .roadmap("")
                .message(msg)
                .build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectMatchDto {
        private Long projectId;
        private String projectTitle;
        private String projectDescription;
        private double matchScore;
        private String matchReasoning;
        private String technologyTags;
    }
}
