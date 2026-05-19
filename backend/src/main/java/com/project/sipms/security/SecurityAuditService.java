package com.project.sipms.security;

import com.project.sipms.entity.AuditLog;
import com.project.sipms.entity.User;
import com.project.sipms.repository.AuditLogRepository;
import com.project.sipms.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Production-Grade Security Audit Service.
 * Ensures strict tracking of all administrative decisions (Accept/Reject)
 * and system access with transaction isolation to guarantee log persistence
 * even if the main transaction rolls back.
 */
@Service
public class SecurityAuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public SecurityAuditService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    /**
     * Logs critical status changes (e.g., ACCEPTED / REJECTED).
     * Uses REQUIRES_NEW to ensure the audit log is saved regardless of outer transaction success.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logDecision(String entityType, Long entityId, String oldStatus, String newStatus, String notes) {
        String details = String.format("{\"oldStatus\":\"%s\", \"newStatus\":\"%s\", \"managerNotes\":\"%s\"}", 
                                        oldStatus, newStatus, escapeJson(notes));
        logEvent("STATUS_DECISION", entityType, entityId, details);
    }

    /**
     * Logs general security events (Logins, Failed attempts, Role changes).
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logSecurityEvent(String action, String details) {
        logEvent(action, "SYSTEM", null, details);
    }

    private void logEvent(String action, String entityType, Long entityId, String details) {
        User currentUser = getCurrentUser();
        String ipAddress = getClientIp();

        AuditLog entry = AuditLog.builder()
                .user(currentUser)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .build();
                
        auditLogRepository.save(entry);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl userDetails) {
            return userRepository.findById(userDetails.getId()).orElse(null);
        }
        return null;
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String xfHeader = request.getHeader("X-Forwarded-For");
                if (xfHeader != null && !xfHeader.isEmpty()) {
                    return xfHeader.split(",")[0];
                }
                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            // Ignore if not in web context
        }
        return "UNKNOWN";
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\"", "\\\"").replace("\n", "\\n");
    }
}
