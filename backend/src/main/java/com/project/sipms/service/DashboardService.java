package com.project.sipms.service;

import com.project.sipms.dto.DashboardStatsDto;
import com.project.sipms.entity.Application;
import com.project.sipms.repository.*;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Dashboard service — aggregates statistics for manager insights.
 */
@Service
public class DashboardService {

    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final ProjectRepository projectRepository;
    private final SupervisorRepository supervisorRepository;

    public DashboardService(CandidateRepository candidateRepository,
                            ApplicationRepository applicationRepository,
                            ProjectRepository projectRepository,
                            SupervisorRepository supervisorRepository) {
        this.candidateRepository = candidateRepository;
        this.applicationRepository = applicationRepository;
        this.projectRepository = projectRepository;
        this.supervisorRepository = supervisorRepository;
    }

    public DashboardStatsDto getManagerStats() {
        long totalCandidates = candidateRepository.count();
        long totalApplications = applicationRepository.count();
        long totalProjects = projectRepository.count();
        long totalSupervisors = supervisorRepository.count();

        long pending = applicationRepository.countByStatus(Application.ApplicationStatus.PENDING);
        long accepted = applicationRepository.countByStatus(Application.ApplicationStatus.ACCEPTED);
        long rejected = applicationRepository.countByStatus(Application.ApplicationStatus.REJECTED);

        double acceptanceRate = totalApplications > 0
                ? (double) accepted / totalApplications * 100 : 0;

        // Applications by status
        Map<String, Long> byStatus = new LinkedHashMap<>();
        List<Object[]> statusCounts = applicationRepository.countByStatusGrouped();
        for (Object[] row : statusCounts) {
            byStatus.put(row[0].toString(), (Long) row[1]);
        }

        // Applications by month (current year)
        Map<String, Long> byMonth = new LinkedHashMap<>();
        String[] months = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        List<Object[]> monthCounts = applicationRepository.countByMonthForYear(Year.now().getValue());
        // Initialize all months to 0
        for (String m : months) byMonth.put(m, 0L);
        for (Object[] row : monthCounts) {
            int monthIdx = ((Number) row[0]).intValue() - 1;
            if (monthIdx >= 0 && monthIdx < 12) {
                byMonth.put(months[monthIdx], (Long) row[1]);
            }
        }

        return DashboardStatsDto.builder()
                .totalCandidates(totalCandidates)
                .totalApplications(totalApplications)
                .totalProjects(totalProjects)
                .totalSupervisors(totalSupervisors)
                .pendingApplications(pending)
                .acceptedApplications(accepted)
                .rejectedApplications(rejected)
                .acceptanceRate(Math.round(acceptanceRate * 10.0) / 10.0)
                .applicationsByStatus(byStatus)
                .applicationsByMonth(byMonth)
                .build();
    }
}
