package com.project.sipms.ai;

import com.project.sipms.dto.AiRankingDto;
import com.project.sipms.dto.CvProjectMatchDto;
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
    private static final Map<String, Double> TECH_WEIGHTS = new HashMap<>();

    static {
        TECH_WEIGHTS.put("java", 1.2);
        TECH_WEIGHTS.put("python", 1.2);
        TECH_WEIGHTS.put("spring boot", 1.5);
        TECH_WEIGHTS.put("spring", 1.3);
        TECH_WEIGHTS.put("react", 1.3);
        TECH_WEIGHTS.put("machine learning", 1.8);
        TECH_WEIGHTS.put("deep learning", 1.8);
        TECH_WEIGHTS.put("docker", 1.3);
        TECH_WEIGHTS.put("kubernetes", 1.5);
        TECH_WEIGHTS.put("microservices", 1.4);
        TECH_WEIGHTS.put("cloud computing", 1.4);
        TECH_WEIGHTS.put("nlp", 1.6);
        TECH_WEIGHTS.put("tensorflow", 1.5);
        TECH_WEIGHTS.put("pytorch", 1.5);
        TECH_WEIGHTS.put("devops", 1.3);
        TECH_WEIGHTS.put("typescript", 1.2);
        TECH_WEIGHTS.put("nodejs", 1.2);
        TECH_WEIGHTS.put("node", 1.1);
        TECH_WEIGHTS.put("sql", 1.0);
        TECH_WEIGHTS.put("mysql", 1.0);
        TECH_WEIGHTS.put("postgresql", 1.1);
        TECH_WEIGHTS.put("mongodb", 1.1);
        TECH_WEIGHTS.put("angular", 1.2);
        TECH_WEIGHTS.put("vue", 1.2);
        TECH_WEIGHTS.put("data analytics", 1.3);
        TECH_WEIGHTS.put("cybersecurity", 1.4);
        TECH_WEIGHTS.put("artificial intelligence", 1.7);
        TECH_WEIGHTS.put("html", 0.9);
        TECH_WEIGHTS.put("css", 0.9);
        TECH_WEIGHTS.put("javascript", 1.1);
        TECH_WEIGHTS.put("js", 1.1);
        TECH_WEIGHTS.put("xgboost", 1.6);
        TECH_WEIGHTS.put("random forest", 1.5);
        TECH_WEIGHTS.put("streamlit", 1.2);
        TECH_WEIGHTS.put("flask", 1.2);
        TECH_WEIGHTS.put("django", 1.2);
        TECH_WEIGHTS.put("pandas", 1.2);
        TECH_WEIGHTS.put("numpy", 1.1);
        TECH_WEIGHTS.put("scikit", 1.4);
        TECH_WEIGHTS.put("sklearn", 1.4);
        TECH_WEIGHTS.put("firebase", 1.2);
        TECH_WEIGHTS.put("rest", 1.0);
        TECH_WEIGHTS.put("api", 1.0);
        TECH_WEIGHTS.put("erp", 1.1);
        TECH_WEIGHTS.put("iot", 1.3);
        TECH_WEIGHTS.put("aws", 1.4);
        TECH_WEIGHTS.put("azure", 1.4);
        TECH_WEIGHTS.put("git", 0.9);
        TECH_WEIGHTS.put("linux", 0.9);
        TECH_WEIGHTS.put("tailwind", 1.0);
        TECH_WEIGHTS.put("next", 1.2);
        TECH_WEIGHTS.put("nextjs", 1.2);
        TECH_WEIGHTS.put("data science", 1.6);
        TECH_WEIGHTS.put("nlp", 1.6);
        TECH_WEIGHTS.put("opencv", 1.4);
        TECH_WEIGHTS.put("keras", 1.5);
    }

    /**
     * Synonym/alias map: normalises variants to a canonical key that exists in TECH_WEIGHTS.
     * Keys are lowercase strings that may appear in CV text or project tags.
     */
    private static final Map<String, String> SYNONYMS = new HashMap<>();

    static {
        // JavaScript variants
        SYNONYMS.put("js", "javascript");
        SYNONYMS.put("javascript", "javascript");
        SYNONYMS.put("html/css/javascript", "javascript");
        SYNONYMS.put("html/css/java script", "javascript");
        SYNONYMS.put("html/css", "html");

        // Python / ML ecosystem
        SYNONYMS.put("ml", "machine learning");
        SYNONYMS.put("ai", "artificial intelligence");
        SYNONYMS.put("xgb", "xgboost");
        SYNONYMS.put("sklearn", "scikit");
        SYNONYMS.put("scikit-learn", "scikit");
        SYNONYMS.put("scikit learn", "scikit");
        SYNONYMS.put("random-forest", "random forest");
        SYNONYMS.put("rf", "random forest");

        // Java / Spring
        SYNONYMS.put("spring-boot", "spring boot");
        SYNONYMS.put("springboot", "spring boot");
        SYNONYMS.put("jee", "java");
        SYNONYMS.put("j2ee", "java");

        // Node
        SYNONYMS.put("node.js", "nodejs");
        SYNONYMS.put("node js", "nodejs");

        // Next.js
        SYNONYMS.put("next.js", "nextjs");
        SYNONYMS.put("next js", "nextjs");

        // Database
        SYNONYMS.put("postgres", "postgresql");
        SYNONYMS.put("mongo", "mongodb");
        SYNONYMS.put("my sql", "mysql");

        // Frontend
        SYNONYMS.put("reactjs", "react");
        SYNONYMS.put("react.js", "react");
        SYNONYMS.put("vuejs", "vue");
        SYNONYMS.put("vue.js", "vue");
        SYNONYMS.put("angularjs", "angular");
        SYNONYMS.put("tailwindcss", "tailwind");
        SYNONYMS.put("tailwind css", "tailwind");

        // General
        SYNONYMS.put("cyber security", "cybersecurity");
        SYNONYMS.put("cyber-security", "cybersecurity");
        SYNONYMS.put("data science", "data science");
        SYNONYMS.put("deep-learning", "deep learning");
        SYNONYMS.put("machine-learning", "machine learning");
    }

    // ── Public API ───────────────────────────────────────────────

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
        Set<String> expertiseTags = parseAndNormaliseTags(supervisor.getExpertiseTags());

        return candidates.stream()
                .map(candidate -> {
                    Set<String> candidateTags = parseAndNormaliseTags(candidate.getSkillsTags());
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

    @Override
    public String generateRoadmap(String cvText) {
        if (cvText == null || cvText.isBlank()) return "Please provide a valid CV text to generate a roadmap.";

        Set<String> detectedTech = extractSkillsFromCvText(cvText);
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

    @Override
    public CvProjectMatchDto matchCvToProjects(String cvText, List<Project> projects) {
        // 1. Generate roadmap
        String roadmap = generateRoadmap(cvText);

        // 2. Extract all skills from CV text (broad extraction)
        Set<String> candidateSkills = extractSkillsFromCvText(cvText);

        // 3. Score every project
        List<CvProjectMatchDto.ProjectMatchDto> scored = projects.stream()
                .map(project -> {
                    double matchScore = calculateCvProjectMatch(cvText, candidateSkills, project);
                    String reasoning = generateCvProjectReasoning(project, candidateSkills, matchScore);

                    return CvProjectMatchDto.ProjectMatchDto.builder()
                            .projectId(project.getId())
                            .projectTitle(project.getTitle())
                            .projectDescription(project.getDescription())
                            .matchScore(Math.round(matchScore * 10.0) / 10.0)
                            .matchReasoning(reasoning)
                            .technologyTags(project.getTechnologyTags())
                            .build();
                })
                .sorted(Comparator.comparingDouble(CvProjectMatchDto.ProjectMatchDto::getMatchScore).reversed())
                .collect(Collectors.toList());

        // 4. Return top 3 — prioritise projects with score > 0 but always return 3
        List<CvProjectMatchDto.ProjectMatchDto> top3 = scored.stream()
                .limit(3)
                .collect(Collectors.toList());

        String skillsSummary = candidateSkills.isEmpty()
                ? "General software engineering background"
                : "Skills detected: " + String.join(", ", candidateSkills);

        return CvProjectMatchDto.builder()
                .roadmap(roadmap)
                .matchedProjects(top3)
                .detectedSkills(skillsSummary)
                .build();
    }

    // ── Core Matching Logic ──────────────────────────────────────

    /**
     * Main scoring function for CV ↔ Project matching.
     *
     * Score components:
     *  A) Tag overlap score  (0–60 pts): weighted intersection of CV skills vs project tech tags
     *  B) Description score  (0–30 pts): how many CV skills appear in the project description
     *  C) Breadth bonus      (0–10 pts): bonus when many skills match
     */
    private double calculateCvProjectMatch(String cvText, Set<String> candidateSkills, Project project) {
        // Parse and normalise project technology tags
        Set<String> projectTechs = parseAndNormaliseTags(project.getTechnologyTags());

        // ── A: Tag overlap score ────────────────────────────────
        double tagScore = 0;
        Set<String> matchedByTag = new HashSet<>();
        if (!candidateSkills.isEmpty() && !projectTechs.isEmpty()) {
            double totalWeight = projectTechs.stream()
                    .mapToDouble(t -> TECH_WEIGHTS.getOrDefault(t, 1.0))
                    .sum();

            double matchWeight = 0;
            for (String skill : candidateSkills) {
                if (projectTechs.contains(skill)) {
                    matchWeight += TECH_WEIGHTS.getOrDefault(skill, 1.0);
                    matchedByTag.add(skill);
                }
            }
            tagScore = totalWeight > 0 ? (matchWeight / totalWeight) * 60.0 : 0;
        }

        // ── B: Description text score ───────────────────────────
        double descScore = 0;
        String descLower = project.getDescription() != null ? project.getDescription().toLowerCase() : "";
        if (!descLower.isBlank() && !candidateSkills.isEmpty()) {
            long matchCount = candidateSkills.stream()
                    .filter(skill -> descLower.contains(skill))
                    .count();
            // Each matching skill worth up to 5 pts, capped at 30
            descScore = Math.min(matchCount * 5.0, 30.0);
        }

        // ── C: Breadth bonus ────────────────────────────────────
        long highValueMatches = matchedByTag.stream()
                .filter(s -> TECH_WEIGHTS.getOrDefault(s, 1.0) > 1.2)
                .count();
        double breadthBonus = Math.min(highValueMatches * 3.0, 10.0);

        return Math.min(tagScore + descScore + breadthBonus, 100.0);
    }

    /**
     * Extracts a normalised set of technology skills from raw CV text.
     *
     * Strategy:
     *  1. Apply synonym map first to catch multi-word phrases ("machine learning", "random forest", etc.)
     *  2. Then scan each word/token against TECH_WEIGHTS keys.
     *  3. Normalise aliases (js → javascript, ml → machine learning, etc.)
     */
    private Set<String> extractSkillsFromCvText(String cvText) {
        if (cvText == null || cvText.isBlank()) return Set.of();

        String lower = cvText.toLowerCase();
        Set<String> detected = new LinkedHashSet<>();

        // Pass 1: multi-word synonyms (checked first so "machine learning" beats "machine" alone)
        for (Map.Entry<String, String> entry : SYNONYMS.entrySet()) {
            if (lower.contains(entry.getKey())) {
                String canonical = entry.getValue();
                if (TECH_WEIGHTS.containsKey(canonical)) {
                    detected.add(canonical);
                }
            }
        }

        // Pass 2: all TECH_WEIGHTS keys (direct match)
        for (String tech : TECH_WEIGHTS.keySet()) {
            if (lower.contains(tech)) {
                detected.add(tech);
            }
        }

        // Pass 3: tokenise CV and resolve single-token synonyms
        String[] tokens = lower.split("[\\s,;/\\-\\(\\)\\[\\]]+");
        for (String token : tokens) {
            String canonical = SYNONYMS.getOrDefault(token, token);
            if (TECH_WEIGHTS.containsKey(canonical)) {
                detected.add(canonical);
            }
        }

        return detected;
    }

    /**
     * Parse technology tags stored in the DB.
     *
     * Tags may be:
     *  - Comma-separated:           "java, react, sql"
     *  - Space-separated within:    "java js"        (treated as multiple tokens)
     *  - Slash-separated:           "html/css"
     *  - Mixed:                     "java js, react"
     *
     * Steps:
     *  1. Split on commas to get raw segments
     *  2. Split each segment on whitespace/slash to get individual tokens
     *  3. Normalise each token via synonym map
     */
    private Set<String> parseAndNormaliseTags(String tags) {
        if (tags == null || tags.isBlank()) return Set.of();

        Set<String> result = new LinkedHashSet<>();
        // Split by comma first
        String[] segments = tags.toLowerCase().split(",");
        for (String segment : segments) {
            segment = segment.trim();
            if (segment.isEmpty()) continue;

            // Check full segment against synonyms (e.g. "spring boot", "machine learning")
            String canonical = SYNONYMS.getOrDefault(segment, segment);
            if (TECH_WEIGHTS.containsKey(canonical)) {
                result.add(canonical);
                continue; // Don't further tokenise if full segment matched
            }

            // Split segment into sub-tokens by whitespace or slash
            String[] subTokens = segment.split("[\\s/\\-]+");
            for (String token : subTokens) {
                token = token.trim();
                if (token.isEmpty()) continue;
                canonical = SYNONYMS.getOrDefault(token, token);
                if (TECH_WEIGHTS.containsKey(canonical)) {
                    result.add(canonical);
                } else {
                    // Store raw token too (it may still be useful for description matching)
                    result.add(token);
                }
            }
        }
        return result;
    }

    // ── Scoring Algorithms ──────────────────────────────────────

    private double calculateProjectScore(Project project) {
        Set<String> techTags = parseAndNormaliseTags(project.getTechnologyTags());
        String description = project.getDescription() != null ? project.getDescription().toLowerCase() : "";

        double diversityScore = Math.min(techTags.size() * 6.0, 30.0);

        double relevanceScore = 0;
        for (String tag : techTags) {
            relevanceScore += TECH_WEIGHTS.getOrDefault(tag, 1.0) * 8.0;
        }
        relevanceScore = Math.min(relevanceScore, 40.0);

        double descriptionScore = Math.min(description.length() / 10.0, 30.0);

        return Math.min(diversityScore + relevanceScore + descriptionScore, 100.0);
    }

    private double calculateCosineSimilarity(Set<String> expertiseTags, Set<String> candidateTags) {
        if (expertiseTags.isEmpty() || candidateTags.isEmpty()) return 0;

        Set<String> allTags = new HashSet<>();
        allTags.addAll(expertiseTags);
        allTags.addAll(candidateTags);

        double dotProduct = 0, normA = 0, normB = 0;
        for (String tag : allTags) {
            double weightA = expertiseTags.contains(tag) ? TECH_WEIGHTS.getOrDefault(tag, 1.0) : 0;
            double weightB = candidateTags.contains(tag) ? TECH_WEIGHTS.getOrDefault(tag, 1.0) : 0;
            dotProduct += weightA * weightB;
            normA += weightA * weightA;
            normB += weightB * weightB;
        }

        if (normA == 0 || normB == 0) return 0;
        return (dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))) * 100;
    }

    // ── Reasoning Generators ────────────────────────────────────

    private String generateCvProjectReasoning(Project project, Set<String> candidateSkills, double score) {
        Set<String> projectTechs = parseAndNormaliseTags(project.getTechnologyTags());
        Set<String> matched = new LinkedHashSet<>(candidateSkills);
        matched.retainAll(projectTechs);

        // Also check description matches
        String descLower = project.getDescription() != null ? project.getDescription().toLowerCase() : "";
        Set<String> descMatched = candidateSkills.stream()
                .filter(s -> descLower.contains(s))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        Set<String> allMatched = new LinkedHashSet<>();
        allMatched.addAll(matched);
        allMatched.addAll(descMatched);

        if (score == 0 || allMatched.isEmpty()) {
            return String.format(
                "Project '%s' uses %s. While your current profile doesn't show direct overlap with these technologies, " +
                "it presents a valuable learning opportunity to expand your skill set.",
                project.getTitle(),
                projectTechs.isEmpty() ? "various technologies" : String.join(", ", projectTechs)
            );
        }

        if (score >= 70) {
            return String.format(
                "Excellent match! Project '%s' strongly aligns with your skills. " +
                "Matched technologies: [%s]. Match score: %.1f%%.",
                project.getTitle(), String.join(", ", allMatched), score
            );
        } else if (score >= 40) {
            return String.format(
                "Good match! Project '%s' overlaps with your background in: [%s]. " +
                "Some new technologies (%s) will also be introduced. Match score: %.1f%%.",
                project.getTitle(),
                String.join(", ", allMatched),
                projectTechs.stream().filter(t -> !allMatched.contains(t)).collect(Collectors.joining(", ")),
                score
            );
        } else {
            return String.format(
                "Partial match for project '%s'. Your skills in [%s] are relevant. " +
                "This project will help you grow into: %s. Match score: %.1f%%.",
                project.getTitle(),
                String.join(", ", allMatched),
                projectTechs.stream().filter(t -> !allMatched.contains(t)).collect(Collectors.joining(", ")),
                score
            );
        }
    }

    private String generateProjectReasoning(Project project, double score) {
        StringBuilder sb = new StringBuilder();
        sb.append("Project '").append(project.getTitle()).append("' scored ").append(Math.round(score)).append("/100. ");

        Set<String> tags = parseAndNormaliseTags(project.getTechnologyTags());
        long highValueCount = tags.stream().filter(t -> TECH_WEIGHTS.getOrDefault(t, 1.0) > 1.2).count();

        if (highValueCount > 2) sb.append("Uses multiple high-demand technologies. ");
        if (tags.size() >= 4) sb.append("Strong technology diversity. ");
        if (project.getDescription() != null && project.getDescription().length() > 100)
            sb.append("Well-documented project description.");

        return sb.toString();
    }

    private String generateMatchReasoning(Candidate candidate, Supervisor supervisor,
                                           Set<String> candidateTags, Set<String> expertiseTags, double score) {
        Set<String> overlap = new LinkedHashSet<>(candidateTags);
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
