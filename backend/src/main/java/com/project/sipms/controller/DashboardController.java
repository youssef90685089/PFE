package com.project.sipms.controller;

import com.project.sipms.common.ApiResponse;
import com.project.sipms.dto.DashboardStatsDto;
import com.project.sipms.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Analytics and statistics endpoints")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/manager/stats")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Get manager dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getManagerStats() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getManagerStats()));
    }
}
