package com.project.sipms.controller;

import com.project.sipms.ai.AiService;
import com.project.sipms.common.ApiResponse;
import com.project.sipms.dto.AiRankingDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Module", description = "AI-powered project ranking and candidate matching")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
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
}
