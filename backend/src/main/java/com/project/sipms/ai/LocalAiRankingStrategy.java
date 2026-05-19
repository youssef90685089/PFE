package com.project.sipms.ai;

import com.project.sipms.dto.AiRankingDto;
import com.project.sipms.entity.Candidate;
import com.project.sipms.entity.Project;
import com.project.sipms.entity.Supervisor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Local AI ranking strategy — uses TF-IDF-inspired keyword matching
 * and cosine similarity to score projects and match candidates.
 *
 * This is the default "mock" implementation that can be swapped for
 * a real API-based strategy (OpenAI, HuggingFace) by implementing
 * AiRankingStrategy and marking it @Primary.
 */
@Component
@Primary
public class LocalAiRankingStrategy implements AiRankingStrategy {

    /** High-value technology keywords weighted more heavily */
    private static final Map<String, Double> TECH_WEIGHTS = Map.ofEntries(
            Map.entry("java", 1.2), Map.entry("python", 1.2),
            Map.entry("spring boot", 1.5), Map.entry("react", 1.3),
            Map.entry("machine learning", 1.8), Map.entry("deep learning", 1.8),
            Map.entry("docker", 1.3), Map.entry("kubernetes", 1.5),
            Map.entry("microservices", 1.4), Map.entry("cloud computing", 1.4),
            Map.entry("nlp", 1.6), Map.entry("tensorflow", 1.5),
            Map.entry("pytorch", 1.5), Map.entry("devops", 1.3),
            Map.entry("typescript", 1.2), Map.entry("nodejs", 1.2),
            Map.entry("sql", 1.0), Map.entry("mongodb", 1.1),
            Map.entry("angular", 1.2), Map.entry("data analytics", 1.3),
            Map.entry("cybersecurity", 1.4), Map.entry("artificial intelligence", 1.7)
    );

    @Override
    public List<AiRankingDto> rankProjects(List<Project> projects) {
        return projects.stream()
                .map(project -> {
                    double score = calculateProjectScore(project);
                    String reasoning = generateProjectReasoning(project, score);
                    return AiRankingDto.builder()
                            .rankingType("PROJECT_RANK")
                            .referenceId(project.getId())
                            .referenceName(project.getTitle())
                            .score(Math.round(score * 10.0) / 10.0)
                            .reasoning(reasoning)
                            .build();
                })
                .sorted(Comparator.comparingDouble(AiRankingDto::getScore).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<AiRankingDto> matchCandidates(Supervisor supervisor, List<Candidate> candidates) {
        Set<String> expertiseTags = parseTags(supervisor.getExpertiseTags());

        return candidates.stream()
                .map(candidate -> {
                    Set<String> candidateTags = parseTags(candidate.getSkillsTags());
                    double score = calculateCosineSimilarity(expertiseTags, candidateTags);
                    String reasoning = generateMatchReasoning(candidate, supervisor, candidateTags, expertiseTags, score);

                    return AiRankingDto.builder()
                            .rankingType("CANDIDATE_MATCH")
                            .referenceId(candidate.getId())
                            .referenceName(candidate.getUser().getFirstName() + " " + candidate.getUser().getLastName())
                            .supervisorId(supervisor.getId())
                            .supervisorName(supervisor.getFullName())
                            .score(Math.round(score * 10.0) / 10.0)
                            .reasoning(reasoning)
                            .build();
                })
                .sorted(Comparator.comparingDouble(AiRankingDto::getScore).reversed())
                .collect(Collectors.toList());
    }

    // ── Scoring Algorithms ──────────────────────────────────────

    /**
     * Score a project based on: technology diversity, description quality,
     * and technology relevance weights.
     */
    private double calculateProjectScore(Project project) {
        Set<String> techTags = parseTags(project.getTechnologyTags());
        String description = project.getDescription() != null ? project.getDescription().toLowerCase() : "";

        // Base score from tech diversity (0-30 points)
        double diversityScore = Math.min(techTags.size() * 6.0, 30.0);

        // Tech relevance score using weights (0-40 points)
        double relevanceScore = 0;
        for (String tag : techTags) {
            relevanceScore += TECH_WEIGHTS.getOrDefault(tag, 1.0) * 8.0;
        }
        relevanceScore = Math.min(relevanceScore, 40.0);

        // Description quality (0-30 points)
        double descriptionScore = Math.min(description.length() / 10.0, 30.0);

        return Math.min(diversityScore + relevanceScore + descriptionScore, 100.0);
    }

    /**
     * Cosine similarity between supervisor expertise and candidate skills,
     * weighted by technology importance.
     */
    private double calculateCosineSimilarity(Set<String> expertiseTags, Set<String> candidateTags) {
        if (expertiseTags.isEmpty() || candidateTags.isEmpty()) return 0;

        // Build a union vocabulary
        Set<String> allTags = new HashSet<>();
        allTags.addAll(expertiseTags);
        allTags.addAll(candidateTags);

        // Create weighted vectors
        double dotProduct = 0;
        double normA = 0;
        double normB = 0;

        for (String tag : allTags) {
            double weightA = expertiseTags.contains(tag) ? TECH_WEIGHTS.getOrDefault(tag, 1.0) : 0;
            double weightB = candidateTags.contains(tag) ? TECH_WEIGHTS.getOrDefault(tag, 1.0) : 0;

            dotProduct += weightA * weightB;
            normA += weightA * weightA;
            normB += weightB * weightB;
        }

        if (normA == 0 || normB == 0) return 0;

        double cosine = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        return cosine * 100; // Scale to 0-100
    }

    // ── Helpers ──────────────────────────────────────────────────

    @Override
    public String generateRoadmap(String cvText) {
        if (cvText == null || cvText.isBlank()) return "Please provide a valid CV text to generate a roadmap.";

        String lowerCv = cvText.toLowerCase();
        Set<String> detectedTech = TECH_WEIGHTS.keySet().stream()
                .filter(lowerCv::contains)
                .collect(Collectors.toSet());

        String techStack = detectedTech.isEmpty() ? "General Full Stack (Java, React, SQL)" : String.join(", ", detectedTech);

        return String.format(
            "### AI-Generated 4-Week Project Roadmap\n\n" +
            "**Target Tech Stack:** %s\n\n" +
            "#### Week 1: Foundation & Environment Setup\n" +
            "- Initialize project repository and setup development environment.\n" +
            "- Design database schema and implement core entities.\n" +
            "- Milestone: Basic CRUD functionality for primary modules.\n\n" +
            "#### Week 2: Core Logic & Backend Integration\n" +
            "- Implement business logic and service layer.\n" +
            "- Develop RESTful APIs for frontend communication.\n" +
            "- Milestone: Functional backend with unit test coverage.\n\n" +
            "#### Week 3: Frontend Development & UI/UX\n" +
            "- Build responsive user interface using modern frameworks.\n" +
            "- Integrate backend APIs and manage application state.\n" +
            "- Milestone: Complete end-to-end flow for main user stories.\n\n" +
            "#### Week 4: Testing, Optimization & Deployment\n" +
            "- Perform integration testing and bug fixing.\n" +
            "- Optimize application performance and security.\n" +
            "- Milestone: Final project delivery and deployment readiness.\n\n" +
            "**AI Insight:** Based on your background in %s, this project focuses on leveraging your existing expertise while introducing advanced architectural patterns.",
            techStack,
            detectedTech.isEmpty() ? "software engineering" : detectedTech.iterator().next()
        );
    }

    private Set<String> parseTags(String tags) {
        if (tags == null || tags.isBlank()) return Set.of();
        return Arrays.stream(tags.toLowerCase().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }

    private String generateProjectReasoning(Project project, double score) {
        StringBuilder sb = new StringBuilder();
        sb.append("Project '").append(project.getTitle()).append("' scored ").append(Math.round(score)).append("/100. ");

        Set<String> tags = parseTags(project.getTechnologyTags());
        long highValueCount = tags.stream().filter(t -> TECH_WEIGHTS.getOrDefault(t, 1.0) > 1.2).count();

        if (highValueCount > 2) sb.append("Uses multiple high-demand technologies. ");
        if (tags.size() >= 4) sb.append("Strong technology diversity. ");
        if (project.getDescription() != null && project.getDescription().length() > 100)
            sb.append("Well-documented project description.");

        return sb.toString();
    }

    private String generateMatchReasoning(Candidate candidate, Supervisor supervisor,
                                           Set<String> candidateTags, Set<String> expertiseTags, double score) {
        Set<String> overlap = new HashSet<>(candidateTags);
        overlap.retainAll(expertiseTags);

        return String.format(
                "%s has %d matching skills with %s's expertise: [%s]. Match score: %.1f%%.",
                candidate.getUser().getFirstName(),
                overlap.size(),
                supervisor.getFullName(),
                String.join(", ", overlap),
                score
        );
    }
}
