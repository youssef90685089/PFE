package com.project.sipms.controller;

import com.project.sipms.common.ApiResponse;
import com.project.sipms.dto.SupervisorDto;
import com.project.sipms.service.SupervisorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supervisors")
@Tag(name = "Supervisors", description = "Supervisor management")
public class SupervisorController {

    private final SupervisorService supervisorService;

    public SupervisorController(SupervisorService supervisorService) {
        this.supervisorService = supervisorService;
    }

    @GetMapping
    @Operation(summary = "Get all supervisors")
    public ResponseEntity<ApiResponse<List<SupervisorDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(supervisorService.getAllSupervisors()));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active supervisors")
    public ResponseEntity<ApiResponse<List<SupervisorDto>>> getActive() {
        return ResponseEntity.ok(ApiResponse.ok(supervisorService.getActiveSupervisors()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supervisor by ID")
    public ResponseEntity<ApiResponse<SupervisorDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(supervisorService.getSupervisorById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Create a new supervisor")
    public ResponseEntity<ApiResponse<SupervisorDto>> create(@RequestBody SupervisorDto dto) {
        return ResponseEntity.ok(ApiResponse.ok("Supervisor created",
                supervisorService.createSupervisor(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Update a supervisor")
    public ResponseEntity<ApiResponse<SupervisorDto>> update(
            @PathVariable Long id, @RequestBody SupervisorDto dto) {
        return ResponseEntity.ok(ApiResponse.ok("Supervisor updated",
                supervisorService.updateSupervisor(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Delete a supervisor")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        supervisorService.deleteSupervisor(id);
        return ResponseEntity.ok(ApiResponse.ok("Supervisor deleted", null));
    }
}
