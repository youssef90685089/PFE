package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

/** Dashboard statistics DTO for manager insights */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardStatsDto {
    private long totalCandidates;
    private long totalApplications;
    private long totalProjects;
    private long totalSupervisors;
    private long pendingApplications;
    private long acceptedApplications;
    private long rejectedApplications;
    private double acceptanceRate;
    private Map<String, Long> applicationsByStatus;
    private Map<String, Long> applicationsByMonth;
    private List<AiRankingDto> recentAiRankings;
}
