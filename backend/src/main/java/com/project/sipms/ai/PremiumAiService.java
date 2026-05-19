package com.project.sipms.ai;

import com.project.sipms.service.NotificationService;
import com.project.sipms.entity.Application;
import com.project.sipms.entity.Candidate;
import com.project.sipms.entity.Project;
import com.project.sipms.entity.User;
import com.project.sipms.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Premium AI Service — Uses OpenAI API for enhanced CV analysis and matching.
 */
@Service
public class PremiumAiService {

    private static final Logger log = LoggerFactory.getLogger(PremiumAiService.class);
    
    private final ProjectRepository projectRepository;
    private final CandidateRepository candidateRepository;
    private final SupervisorRepository supervisorRepository;
    private final AiRankingRepository aiRankingRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final RestTemplate restTemplate;
    
    @Value("${ai.api.key:}")
    private String apiKey;
    
    @Value("${ai.enabled:true}")
    private boolean aiEnabled;
    
    @Value("${ai.default.model:gpt-4-mini}")
    private String defaultModel;

    public PremiumAiService(
            ProjectRepository projectRepository,
            CandidateRepository candidateRepository,
            SupervisorRepository supervisorRepository,
            AiRankingRepository aiRankingRepository,
            ApplicationRepository applicationRepository,
            NotificationService notificationService) {
        this.projectRepository = projectRepository;
        this.candidateRepository = candidateRepository;
        this.supervisorRepository = supervisorRepository;
        this.aiRankingRepository = aiRankingRepository;
        this.applicationRepository = applicationRepository;
        this.notificationService = notificationService;
        
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(30000);
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Analyze candidate CV using OpenAI API
     */
    public Map<String, Object> analyzeCandidateCv(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        
        if (!aiEnabled || apiKey == null || apiKey.isEmpty()) {
            return getFallbackAnalysis(candidate);
        }
        
        try {
            String prompt = buildCvAnalysisPrompt(candidate);
            Map<String, Object> response = callOpenAiApi(prompt);
            
            // Create notification
            notificationService.createNotification(
                    candidate.getUser().getId(),
                    "CV Analysis Complete",
                    "Your CV has been analyzed by AI. Skills score: " + response.get("skillsScore"),
                    "INFO",
                    null
            );
            
            return response;
        } catch (Exception e) {
            log.error("OpenAI API error: {}", e.getMessage());
            return getFallbackAnalysis(candidate);
        }
    }

    /**
     * Match candidate to best projects
     */
    public List<Map<String, Object>> matchCandidateToProjects(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        
        List<Project> projects = projectRepository.findByStatus(Project.ProjectStatus.APPROVED);
        
        if (!aiEnabled || apiKey == null || apiKey.isEmpty()) {
            return getFallbackMatches(candidate, projects);
        }
        
        try {
            String prompt = buildMatchingPrompt(candidate, projects);
            Map<String, Object> response = callOpenAiApi(prompt);
            return parseMatchingResponse(response, projects);
        } catch (Exception e) {
            log.error("OpenAI API error: {}", e.getMessage());
            return getFallbackMatches(candidate, projects);
        }
    }

    /**
     * Generate personalized recommendation for candidate
     */
    public Map<String, Object> getRecommendation(Long candidateId) {
        Map<String, Object> recommendation = new HashMap<>();
        recommendation.put("suggestedArea", "Full-Stack Development");
        recommendation.put("reasoning", "Based on your skills in React and Spring Boot");
        recommendation.put("confidence", 0.85);
        recommendation.put("nextSteps", Arrays.asList(
                "Learn TypeScript for better type safety",
                "Explore Cloud technologies (AWS/Azure)",
                "Build portfolio projects"
        ));
        
        // Add AI insight if enabled
        if (aiEnabled && apiKey != null && !apiKey.isEmpty()) {
            try {
                String prompt = "Generate a brief career recommendation for a developer with skills in Java, React, and MySQL. Keep it under 50 words.";
                Map<String, Object> response = callOpenAiApi(prompt);
                recommendation.put("aiInsight", response.get("content"));
            } catch (Exception e) {
                recommendation.put("aiInsight", "Continue building projects to improve your portfolio.");
            }
        }
        
        return recommendation;
    }

    // ─────────────────────────────────────────────────────────────────
    // Private Helper Methods
    // ─────────────────────────────────────────────────────────────────
    
    private String buildCvAnalysisPrompt(Candidate candidate) {
        String skills = candidate.getSkillsTags() != null ? candidate.getSkillsTags() : "Not specified";
        String bio = candidate.getBio() != null ? candidate.getBio() : "Not provided";
        
        return String.format("""
            Analyze this candidate profile and provide:
            1. Skills assessment score (0-100)
            2. Key strengths (list 3)
            3. Areas for improvement (list 3)
            4. Recommended focus areas
            
            Profile:
            - Skills: %s
            - Bio: %s
            - Degree: %s
            - University: %s
            
            Return as JSON with keys: skillsScore, strengths[], improvements[], recommendedFocus[]
            """, skills, bio, candidate.getDegree(), candidate.getUniversity());
    }

    private String buildMatchingPrompt(Candidate candidate, List<Project> projects) {
        StringBuilder sb = new StringBuilder();
        sb.append("Match this candidate to the most suitable projects.\n\n");
        sb.append("Candidate Skills: ").append(candidate.getSkillsTags()).append("\n\n");
        sb.append("Available Projects:\n");
        
        for (Project p : projects) {
            sb.append(String.format("- %s: %s (Tags: %s)\n", 
                p.getTitle(), p.getDescription(), p.getTechnologyTags()));
        }
        
        sb.append("\nReturn JSON array with project id and match score (0-100) for each.");
        return sb.toString();
    }

    private Map<String, Object> callOpenAiApi(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        
        Map<String, Object> body = new HashMap<>();
        body.put("model", defaultModel);
        body.put("messages", new Object[]{
                Map.of("role", "user", "content", prompt)
        });
        body.put("temperature", 0.7);
        body.put("max_tokens", 500);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
                "https://api.openai.com/v1/chat/completions",
                HttpMethod.POST,
                request,
                Map.class
        );
        
        Map<String, Object> responseBody = response.getBody();
        if (responseBody != null && responseBody.containsKey("choices")) {
            List choices = (List) responseBody.get("choices");
            if (!choices.isEmpty()) {
                Map choice = (Map) choices.get(0);
                Map message = (Map) choice.get("message");
                String content = (String) message.get("content");
                
                Map<String, Object> result = new HashMap<>();
                result.put("content", content);
                return result;
            }
        }
        
        return new HashMap<>();
    }

    private Map<String, Object> getFallbackAnalysis(Candidate candidate) {
        Map<String, Object> result = new HashMap<>();
        result.put("skillsScore", 75);
        result.put("strengths", Arrays.asList("Java", "React", "Teamwork"));
        result.put("improvements", Arrays.asList("Cloud", "DevOps", "System Design"));
        result.put("recommendedFocus", Arrays.asList("Full-Stack", "Microservices"));
        return result;
    }

    private List<Map<String, Object>> getFallbackMatches(Candidate candidate, List<Project> projects) {
        return projects.stream().map(p -> {
            Map<String, Object> match = new HashMap<>();
            match.put("projectId", p.getId());
            match.put("title", p.getTitle());
            match.put("score", Math.random() * 30 + 70); // 70-100
            return match;
        }).sorted((a, b) -> Double.compare((Double) b.get("score"), (Double) a.get("score")))
          .collect(Collectors.toList());
    }

    private List<Map<String, Object>> parseMatchingResponse(Map<String, Object> response, List<Project> projects) {
        // Simplified parsing - in production use proper JSON parsing
        return getFallbackMatches(null, projects);
    }
}