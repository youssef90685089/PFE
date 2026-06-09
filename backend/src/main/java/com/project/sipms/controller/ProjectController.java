package com.project.sipms.controller;

import com.project.sipms.common.ApiResponse;
import com.project.sipms.dto.ProjectDto;
import com.project.sipms.security.UserDetailsImpl;
import com.project.sipms.service.ProjectService;
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
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "Internship project ideas management")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    @Operation(summary = "Get all projects")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getAllProjects()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get current user's projects")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getMyProjects(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getProjectsByUserId(user.getId())));
    }

    @GetMapping("/managed")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Get projects managed by current user")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getManagedProjects(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getManagedProjects(user.getId())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<ApiResponse<ProjectDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getProjectById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Submit a new project idea")
    public ResponseEntity<ApiResponse<ProjectDto>> createProject(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody ProjectDto dto) {
        return ResponseEntity.ok(ApiResponse.ok("Project submitted",
                projectService.createProject(dto, user.getId())));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Update project status (approve/reject)")
    public ResponseEntity<ApiResponse<ProjectDto>> updateStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Project status updated",
                projectService.updateProjectStatus(id, body.get("status"))));
    }

    @PatchMapping("/{id}/assign-supervisor")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Assign supervisor to a project")
    public ResponseEntity<ApiResponse<ProjectDto>> assignSupervisor(
            @PathVariable Long id, @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(ApiResponse.ok("Supervisor assigned",
                projectService.assignSupervisor(id, body.get("supervisorId"))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Update project details")
    public ResponseEntity<ApiResponse<ProjectDto>> updateProject(
            @PathVariable Long id, @Valid @RequestBody ProjectDto dto) {
        return ResponseEntity.ok(ApiResponse.ok("Project updated successfully",
                projectService.updateProject(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Delete a project")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.ok("Project deleted successfully", null));
    }
}
