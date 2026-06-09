package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
