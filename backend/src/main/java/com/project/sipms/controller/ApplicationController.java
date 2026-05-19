package com.project.sipms.controller;

import com.project.sipms.common.ApiResponse;
import com.project.sipms.dto.ApplicationDto;
import com.project.sipms.security.UserDetailsImpl;
import com.project.sipms.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Applications", description = "Internship application lifecycle management")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','RECEPTIONIST')")
    @Operation(summary = "Get all applications")
    public ResponseEntity<ApiResponse<List<ApplicationDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getAllApplications()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get current candidate's applications")
    public ResponseEntity<ApiResponse<List<ApplicationDto>>> getMyApplications(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getApplicationsByUserId(user.getId())));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Filter applications by status")
    public ResponseEntity<ApiResponse<List<ApplicationDto>>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getApplicationsByStatus(status)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get application by ID")
    public ResponseEntity<ApiResponse<ApplicationDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getApplicationById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Submit a new application (online)")
    public ResponseEntity<ApiResponse<ApplicationDto>> createApplication(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestBody Map<String, Object> body) {
        Long projectId = body.get("projectId") != null ? Long.valueOf(body.get("projectId").toString()) : null;
        return ResponseEntity.ok(ApiResponse.ok("Application submitted",
                applicationService.createApplication(user.getId(), projectId, "ONLINE", null)));
    }

    @PostMapping("/physical")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    @Operation(summary = "Register a physical dossier application (Receptionist)")
    public ResponseEntity<ApiResponse<ApplicationDto>> createPhysicalApplication(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("candidateUserId").toString());
        Long projectId = body.get("projectId") != null ? Long.valueOf(body.get("projectId").toString()) : null;
        return ResponseEntity.ok(ApiResponse.ok("Physical application registered",
                applicationService.createApplication(userId, projectId, "PHYSICAL", user.getId())));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Update application status")
    public ResponseEntity<ApiResponse<ApplicationDto>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String notes = body.get("managerNotes");
        return ResponseEntity.ok(ApiResponse.ok("Status updated",
                applicationService.updateStatus(id, status, notes)));
    }

    @PatchMapping("/{id}/assign-supervisor")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Assign a supervisor to an application")
    public ResponseEntity<ApiResponse<ApplicationDto>> assignSupervisor(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(ApiResponse.ok("Supervisor assigned",
                applicationService.assignSupervisor(id, body.get("supervisorId"))));
    }
}
