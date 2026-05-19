package com.project.sipms.ai.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.*;
import java.util.stream.Collectors;
import com.project.sipms.entity.Candidate;
import com.project.sipms.entity.Project;
import com.project.sipms.repository.CandidateRepository;
import com.project.sipms.repository.ProjectRepository;
import com.project.sipms.ai.dto.AIAnalysisResponse;

/**
 * Intelligent Recommendation Engine
 * Matches candidates with projects based on skills, experience, and preferences
 * Uses AI algorithms for smart ranking and suggestions
 */
@Service
public class RecommendationEngineService {
    
    @Autowired
    private CandidateRepository candidateRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    /**
     * Get AI-powered project recommendations for a candidate
     */
    public List<ProjectRecommendation> getProjectRecommendations(Long candidateId, int limit) {
        Candidate candidate = candidateRepository.findById(candidateId).orElse(null);
        if (candidate == null) {
            return new ArrayList<>();
        }
        
        List<Project> allProjects = projectRepository.findAll();
        List<ProjectRecommendation> recommendations = new ArrayList<>();
        
        for (Project project : allProjects) {
            double matchScore = calculateMatchScore(candidate, project);
            if (matchScore > 0.3) { // Minimum threshold
                recommendations.add(new ProjectRecommendation(project, matchScore));
            }
        }
        
        // Sort by score (highest first) and limit results
        return recommendations.stream()
            .sorted(Comparator.comparingDouble(ProjectRecommendation::getMatchScore).reversed())
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    /**
     * Calculate skill-based match score between candidate and project
     */
    private double calculateMatchScore(Candidate candidate, Project project) {
        double score = 0.0;
        
        // Extract candidate and project tags
        Set<String> candidateSkills = extractTags(candidate.getSkillsTags());
        Set<String> projectSkills = extractTags(project.getRequiredSkills());
        
        // Calculate skill overlap
        Set<String> commonSkills = new HashSet<>(candidateSkills);
        commonSkills.retainAll(projectSkills);
        
        if (!projectSkills.isEmpty()) {
            double skillMatch = (double) commonSkills.size() / projectSkills.size();
            score += skillMatch * 0.4; // 40% weight on skill match
        }
        
        // Experience level matching
        int candidateExperienceLevel = estimateExperienceLevel(candidate);
        int projectRequiredLevel = estimateProjectDifficultyLevel(project);
        
        double experienceDiff = Math.abs(candidateExperienceLevel - projectRequiredLevel);
        double experienceScore = Math.max(0, 1.0 - (experienceDiff / 3.0));
        score += experienceScore * 0.3; // 30% weight on experience match
        
        // Interest area matching
        Set<String> candidateInterests = extractTags(candidate.getSkillsTags());
        Set<String> projectTopics = extractTags(project.getDescription());
        
        Set<String> commonInterests = new HashSet<>(candidateInterests);
        commonInterests.retainAll(projectTopics);
        
        double interestScore = commonInterests.isEmpty() ? 0.0 : 0.5;
        score += interestScore * 0.3; // 30% weight on interest match
        
        return Math.min(1.0, score);
    }
    
    /**
     * Estimate candidate experience level from profile
     */
    private int estimateExperienceLevel(Candidate candidate) {
        int graduationYear = candidate.getGraduationYear() != null ? candidate.getGraduationYear() : 2024;
        int yearsSinceDegree = java.time.Year.now().getValue() - graduationYear;
        
        if (yearsSinceDegree < 1) return 0; // Fresher
        if (yearsSinceDegree < 3) return 1; // Junior
        if (yearsSinceDegree < 5) return 2; // Mid-level
        return 3; // Senior
    }
    
    /**
     * Estimate project difficulty level
     */
    private int estimateProjectDifficultyLevel(Project project) {
        String description = project.getDescription().toLowerCase();
        int level = 0;
        
        if (description.contains("advanced") || description.contains("senior")) level = 3;
        else if (description.contains("intermediate") || description.contains("mid")) level = 2;
        else if (description.contains("junior") || description.contains("beginner")) level = 1;
        else level = 0;
        
        return level;
    }
    
    /**
     * Extract tags from comma-separated string
     */
    private Set<String> extractTags(String tagString) {
        if (tagString == null || tagString.isEmpty()) {
            return new HashSet<>();
        }
        return Arrays.stream(tagString.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .map(String::toLowerCase)
            .collect(Collectors.toSet());
    }
    
    /**
     * Get candidate recommendations for a project
     */
    public List<CandidateRecommendation> getCandidateRecommendations(Long projectId, int limit) {
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            return new ArrayList<>();
        }
        
        List<Candidate> allCandidates = candidateRepository.findAll();
        List<CandidateRecommendation> recommendations = new ArrayList<>();
        
        for (Candidate candidate : allCandidates) {
            double matchScore = calculateMatchScore(candidate, project);
            if (matchScore > 0.3) { // Minimum threshold
                recommendations.add(new CandidateRecommendation(candidate, matchScore));
            }
        }
        
        return recommendations.stream()
            .sorted(Comparator.comparingDouble(CandidateRecommendation::getMatchScore).reversed())
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    /**
     * Inner class for project recommendations
     */
    public static class ProjectRecommendation {
        private Project project;
        private double matchScore;
        
        public ProjectRecommendation(Project project, double matchScore) {
            this.project = project;
            this.matchScore = matchScore;
        }
        
        public Project getProject() { return project; }
        public double getMatchScore() { return matchScore; }
    }
    
    /**
     * Inner class for candidate recommendations
     */
    public static class CandidateRecommendation {
        private Candidate candidate;
        private double matchScore;
        
        public CandidateRecommendation(Candidate candidate, double matchScore) {
            this.candidate = candidate;
            this.matchScore = matchScore;
        }
        
        public Candidate getCandidate() { return candidate; }
        public double getMatchScore() { return matchScore; }
    }
}
