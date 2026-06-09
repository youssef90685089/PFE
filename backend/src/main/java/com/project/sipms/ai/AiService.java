package com.project.sipms.ai;

import com.project.sipms.common.ResourceNotFoundException;
import com.project.sipms.dto.AiRankingDto;
import com.project.sipms.dto.CvProjectMatchDto;
import com.project.sipms.entity.AiRanking;
import com.project.sipms.entity.Candidate;
import com.project.sipms.entity.Project;
import com.project.sipms.entity.Supervisor;
import com.project.sipms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * AI Service — facade that delegates to the active AiRankingStrategy.
 */
@Service
public class AiService {

    private final AiRankingStrategy rankingStrategy;
    private final ProjectRepository projectRepository;
    private final SupervisorRepository supervisorRepository;
    private final CandidateRepository candidateRepository;
    private final AiRankingRepository aiRankingRepository;
    private final ApplicationRepository applicationRepository;

    public AiService(AiRankingStrategy rankingStrategy,
                     ProjectRepository projectRepository,
                     SupervisorRepository supervisorRepository,
                     CandidateRepository candidateRepository,
                     AiRankingRepository aiRankingRepository,
                     ApplicationRepository applicationRepository) {
        this.rankingStrategy = rankingStrategy;
        this.projectRepository = projectRepository;
        this.supervisorRepository = supervisorRepository;
        this.candidateRepository = candidateRepository;
        this.aiRankingRepository = aiRankingRepository;
        this.applicationRepository = applicationRepository;
    }

    /** Rank all submitted projects */
    @Transactional
    public List<AiRankingDto> rankAllProjects() {
        List<Project> projects = projectRepository.findByStatus(Project.ProjectStatus.SUBMITTED);
        List<AiRankingDto> results = rankingStrategy.rankProjects(projects);

        // Persist scores to DB and update project entities
        for (AiRankingDto dto : results) {
            Project project = projectRepository.findById(dto.getReferenceId()).orElse(null);
            if (project != null) {
                project.setAiScore(dto.getScore());
                projectRepository.save(project);
            }

            AiRanking ranking = AiRanking.builder()
                    .rankingType(AiRanking.RankingType.PROJECT_RANK)
                    .referenceId(dto.getReferenceId())
                    .score(dto.getScore())
                    .reasoning(dto.getReasoning())
                    .build();
            aiRankingRepository.save(ranking);
        }

        return results;
    }

    /** Match all candidates to a specific supervisor */
    @Transactional
    public List<AiRankingDto> matchCandidatesToSupervisor(Long supervisorId) {
        Supervisor supervisor = supervisorRepository.findById(supervisorId)
                .orElseThrow(() -> new ResourceNotFoundException("Supervisor", supervisorId));
        List<Candidate> candidates = candidateRepository.findAll();

        List<AiRankingDto> results = rankingStrategy.matchCandidates(supervisor, candidates);

        // Persist rankings to DB
        for (AiRankingDto dto : results) {
            AiRanking ranking = AiRanking.builder()
                    .rankingType(AiRanking.RankingType.CANDIDATE_MATCH)
                    .referenceId(dto.getReferenceId())
                    .supervisor(supervisor)
                    .score(dto.getScore())
                    .reasoning(dto.getReasoning())
                    .build();
            aiRankingRepository.save(ranking);
        }

        return results;
    }

    /** Generate a roadmap based on CV text */
    public String generateRoadmap(String cvText) {
        return rankingStrategy.generateRoadmap(cvText);
    }

    /** Match CV to available projects and generate roadmap */
    public com.project.sipms.dto.CvProjectMatchDto matchCvToProjects(String cvText) {
        List<Project> allProjects = projectRepository.findAll();
        return rankingStrategy.matchCvToProjects(cvText, allProjects);
    }

    /** Get historical rankings */
    public List<AiRankingDto> getProjectRankings() {
        return aiRankingRepository.findByRankingTypeOrderByScoreDesc(AiRanking.RankingType.PROJECT_RANK)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<AiRankingDto> getCandidateMatchings(Long supervisorId) {
        return aiRankingRepository.findBySupervisorIdOrderByScoreDesc(supervisorId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    private AiRankingDto toDto(AiRanking r) {
        return AiRankingDto.builder()
                .id(r.getId())
                .rankingType(r.getRankingType().name())
                .referenceId(r.getReferenceId())
                .supervisorId(r.getSupervisor() != null ? r.getSupervisor().getId() : null)
                .supervisorName(r.getSupervisor() != null ? r.getSupervisor().getFullName() : null)
                .score(r.getScore())
                .reasoning(r.getReasoning())
                .build();
    }
}
