package com.project.sipms.ai.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import java.util.*;
import java.util.regex.*;
import com.project.sipms.ai.dto.AIAnalysisRequest;
import com.project.sipms.ai.dto.AIAnalysisResponse;

/**
 * CV Analysis Service
 * Analyzes CVs for skills, experience, education, and qualification matching
 * Uses pattern matching and NLP-based text analysis
 */
@Service
public class CVAnalysisService {
    
    @Value("${ai.api.key:default}")
    private String apiKey;
    
    /**
     * Analyze CV content and extract key information
     */
    public AIAnalysisResponse analyzeCVContent(String cvContent) {
        long startTime = System.currentTimeMillis();
        AIAnalysisResponse response = new AIAnalysisResponse();
        
        try {
            Map<String, Double> metrics = new HashMap<>();
            List<String> keyPoints = new ArrayList<>();
            List<String> recommendations = new ArrayList<>();
            
            // Extract and score skills
            List<String> skills = extractSkills(cvContent);
            metrics.put("skillsFound", (double) skills.size());
            keyPoints.addAll(skills.stream().limit(5).toList());
            
            // Analyze experience level
            double experienceScore = analyzeExperienceLevel(cvContent);
            metrics.put("experienceScore", experienceScore);
            
            // Analyze education
            List<String> education = extractEducation(cvContent);
            metrics.put("educationLevels", (double) education.size());
            
            // Calculate overall CV quality score
            double qualityScore = calculateCVQuality(cvContent, skills, education);
            metrics.put("cvQualityScore", qualityScore);
            
            // Generate recommendations
            if (experienceScore < 0.4) {
                recommendations.add("Consider adding more specific project examples");
            }
            if (skills.size() < 5) {
                recommendations.add("List more technical skills to improve matching");
            }
            if (qualityScore < 0.7) {
                recommendations.add("Improve CV formatting and clarity");
            }
            recommendations.add("Highlight quantifiable achievements and metrics");
            
            response.setAnalysisId(UUID.randomUUID().toString());
            response.setAnalysisType("CV_ANALYSIS");
            response.setConfidenceScore(qualityScore);
            response.setSummary(String.format("CV analyzed successfully. Quality Score: %.1f%%", qualityScore * 100));
            response.setDetailedAnalysis(generateDetailedAnalysis(skills, education, experienceScore));
            response.setKeyPoints(keyPoints);
            response.setRecommendations(recommendations);
            response.setScoringMetrics(metrics);
            response.setStatus("SUCCESS");
            
        } catch (Exception e) {
            response.setStatus("FAILED");
            response.setSummary("Error analyzing CV: " + e.getMessage());
        }
        
        response.setProcessingTimeMs(System.currentTimeMillis() - startTime);
        return response;
    }
    
    /**
     * Extract skills from CV text using pattern matching
     */
    private List<String> extractSkills(String text) {
        List<String> skills = new ArrayList<>();
        String[] commonSkills = {
            "Java", "Python", "JavaScript", "TypeScript", "React", "Angular", "Vue",
            "Spring Boot", "Django", "Node.js", "Express", "SQL", "MongoDB",
            "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "Linux",
            "REST API", "GraphQL", "Microservices", "Agile", "JIRA",
            "HTML", "CSS", "Web Development", "Mobile Development", "DevOps",
            "Machine Learning", "Data Analysis", "Cloud", "Database Design"
        };
        
        String lowerText = text.toLowerCase();
        for (String skill : commonSkills) {
            if (lowerText.contains(skill.toLowerCase())) {
                skills.add(skill);
            }
        }
        
        return skills;
    }
    
    /**
     * Analyze work experience level from CV
     */
    private double analyzeExperienceLevel(String text) {
        double score = 0.0;
        String lowerText = text.toLowerCase();
        
        // Check for experience keywords
        if (lowerText.contains("senior") || lowerText.contains("lead") || lowerText.contains("architect")) {
            score = 0.8;
        } else if (lowerText.contains("mid-level") || lowerText.contains("3-5 years")) {
            score = 0.6;
        } else if (lowerText.contains("junior") || lowerText.contains("entry") || lowerText.contains("1-2 years")) {
            score = 0.4;
        } else if (lowerText.contains("internship") || lowerText.contains("fresh")) {
            score = 0.2;
        } else {
            // Count years mentioned
            Pattern yearPattern = Pattern.compile("(\\d{1,2})\\s*(?:years?|yrs)");
            Matcher matcher = yearPattern.matcher(lowerText);
            while (matcher.find()) {
                int years = Integer.parseInt(matcher.group(1));
                score = Math.min(1.0, years / 10.0);
            }
        }
        
        return score;
    }
    
    /**
     * Extract education information
     */
    private List<String> extractEducation(String text) {
        List<String> education = new ArrayList<>();
        String[] degrees = {"Bachelor", "B.S.", "B.A.", "Master", "M.S.", "M.A.", "PhD", "Ph.D."};
        String lowerText = text.toLowerCase();
        
        for (String degree : degrees) {
            if (lowerText.contains(degree.toLowerCase())) {
                education.add(degree);
            }
        }
        
        return education;
    }
    
    /**
     * Calculate overall CV quality score
     */
    private double calculateCVQuality(String text, List<String> skills, List<String> education) {
        double score = 0.0;
        
        // Length score (optimal: 500-1500 words)
        int wordCount = text.split("\\s+").length;
        score += Math.min(0.2, wordCount / 2500.0);
        
        // Skills score (5-10 skills is good)
        score += Math.min(0.3, skills.size() / 10.0);
        
        // Education score (having degree is important)
        score += education.isEmpty() ? 0.0 : 0.25;
        
        // Structure score (presence of key sections)
        String lowerText = text.toLowerCase();
        int structurePoints = 0;
        if (lowerText.contains("experience") || lowerText.contains("work")) structurePoints++;
        if (lowerText.contains("education")) structurePoints++;
        if (lowerText.contains("project")) structurePoints++;
        if (lowerText.contains("skill")) structurePoints++;
        score += (structurePoints / 4.0) * 0.25;
        
        return Math.min(1.0, score);
    }
    
    /**
     * Generate detailed analysis text
     */
    private String generateDetailedAnalysis(List<String> skills, List<String> education, double experienceScore) {
        StringBuilder analysis = new StringBuilder();
        analysis.append("## CV Analysis Report\n\n");
        
        analysis.append("### Skills Identified\n");
        analysis.append(skills.isEmpty() ? "No specific technical skills identified\n" 
            : String.join(", ", skills)).append("\n\n");
        
        analysis.append("### Education\n");
        analysis.append(education.isEmpty() ? "Education information not clearly specified\n" 
            : String.join(", ", education)).append("\n\n");
        
        analysis.append("### Experience Level\n");
        if (experienceScore < 0.3) {
            analysis.append("Entry-level or Fresh graduate\n");
        } else if (experienceScore < 0.6) {
            analysis.append("Junior to Mid-level Professional\n");
        } else {
            analysis.append("Senior or Lead Professional\n");
        }
        
        return analysis.toString();
    }
}
