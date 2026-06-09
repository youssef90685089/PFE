package com.project.sipms.controller;

import com.project.sipms.ai.AiService;
import com.project.sipms.common.ApiResponse;
import com.project.sipms.dto.AiRankingDto;
import com.project.sipms.dto.CvProjectMatchDto;
import com.project.sipms.service.CvTextExtractorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Module", description = "AI-powered project ranking and candidate matching")
public class AiController {

    private final AiService aiService;
    private final CvTextExtractorService cvTextExtractorService;

    public AiController(AiService aiService, CvTextExtractorService cvTextExtractorService) {
        this.aiService = aiService;
        this.cvTextExtractorService = cvTextExtractorService;
    }

    @PostMapping("/rank-projects")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Rank all submitted projects using AI scoring")
    public ResponseEntity<ApiResponse<List<AiRankingDto>>> rankProjects() {
        return ResponseEntity.ok(ApiResponse.ok("Projects ranked successfully",
                aiService.rankAllProjects()));
    }

    @PostMapping("/match-candidates/{supervisorId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Match candidates to a supervisor based on CV/expertise")
    public ResponseEntity<ApiResponse<List<AiRankingDto>>> matchCandidates(
            @PathVariable Long supervisorId) {
        return ResponseEntity.ok(ApiResponse.ok("Candidates matched successfully",
                aiService.matchCandidatesToSupervisor(supervisorId)));
    }

    @GetMapping("/rankings/projects")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Get historical project rankings")
    public ResponseEntity<ApiResponse<List<AiRankingDto>>> getProjectRankings() {
        return ResponseEntity.ok(ApiResponse.ok(aiService.getProjectRankings()));
    }

    @GetMapping("/rankings/candidates/{supervisorId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Get historical candidate matchings for a supervisor")
    public ResponseEntity<ApiResponse<List<AiRankingDto>>> getCandidateMatchings(
            @PathVariable Long supervisorId) {
        return ResponseEntity.ok(ApiResponse.ok(aiService.getCandidateMatchings(supervisorId)));
    }

    @PostMapping("/generate-roadmap")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Generate a project roadmap based on CV text")
    public ResponseEntity<ApiResponse<String>> generateRoadmap(@RequestBody String cvText) {
        return ResponseEntity.ok(ApiResponse.ok("Roadmap generated successfully",
                aiService.generateRoadmap(cvText)));
    }

    @PostMapping("/match-cv-to-projects")
    @Operation(summary = "Match CV text to suitable projects and generate roadmap")
    public ResponseEntity<ApiResponse<CvProjectMatchDto>> matchCvToProjects(@RequestBody String cvText) {
        return ResponseEntity.ok(ApiResponse.ok("CV matched to projects successfully",
                aiService.matchCvToProjects(cvText)));
    }

    /**
     * Upload a CV file (PDF or DOCX), extract its text, then run AI project matching.
     * Accessible by any authenticated user (candidates can call this directly).
     */
    @PostMapping(value = "/analyze-cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload CV file and get AI-matched projects")
    public ResponseEntity<ApiResponse<CvProjectMatchDto>> analyzeCv(
            @RequestParam("file") MultipartFile file) {
        try {
            String cvText = cvTextExtractorService.extractText(file);
            CvProjectMatchDto result = aiService.matchCvToProjects(cvText);
            return ResponseEntity.ok(ApiResponse.ok("CV analyzed successfully", result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to read CV file: " + e.getMessage()));
        }
    }
}
