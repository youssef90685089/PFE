package com.project.sipms.controller;

import com.project.sipms.common.ApiResponse;
import com.project.sipms.entity.AuditLog;
import com.project.sipms.repository.AuditLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAuditLogs() {
        List<AuditLog> logs = auditLogRepository.findTop50ByOrderByCreatedAtDesc();
        List<Map<String, Object>> result = logs.stream().map(log -> Map.<String, Object>of(
                "id", log.getId(),
                "user", log.getUser() != null ? log.getUser().getFirstName() + " " + log.getUser().getLastName() : "System",
                "userEmail", log.getUser() != null ? log.getUser().getEmail() : "",
                "action", log.getAction(),
                "entityType", log.getEntityType(),
                "entityId", log.getEntityId(),
                "details", log.getDetails(),
                "createdAt", log.getCreatedAt() != null ? log.getCreatedAt().toString() : ""
        )).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Audit logs retrieved", result));
    }
}
