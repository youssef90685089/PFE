package com.project.sipms.controller;

import com.project.sipms.common.ApiResponse;
import com.project.sipms.dto.CreateInterviewRequest;
import com.project.sipms.dto.InterviewDto;
import com.project.sipms.dto.UpdateInterviewResultRequest;
import com.project.sipms.service.InterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<List<InterviewDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(interviewService.getAllInterviews()));
    }

    @GetMapping("/by-status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<List<InterviewDto>>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(ApiResponse.ok(interviewService.getInterviewsByStatus(status)));
    }

    @GetMapping("/by-candidate/{candidateId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<List<InterviewDto>>> getByCandidate(@PathVariable Long candidateId) {
        return ResponseEntity.ok(ApiResponse.ok(interviewService.getInterviewsByCandidate(candidateId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<InterviewDto>> schedule(@RequestBody CreateInterviewRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Interview scheduled", interviewService.scheduleInterview(req)));
    }

    @PutMapping("/{id}/result")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<InterviewDto>> updateResult(
            @PathVariable Long id,
            @RequestBody UpdateInterviewResultRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Interview result updated", interviewService.updateResult(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        interviewService.deleteInterview(id);
        return ResponseEntity.ok(ApiResponse.ok("Interview deleted", null));
    }
}