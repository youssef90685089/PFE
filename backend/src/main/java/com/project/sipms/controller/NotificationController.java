package com.project.sipms.controller;

import com.project.sipms.common.ApiResponse;
import com.project.sipms.dto.CreateNotificationRequest;
import com.project.sipms.dto.NotificationDto;
import com.project.sipms.security.UserDetailsImpl;
import com.project.sipms.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "In-app notification system")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get all notifications for current user")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getAll(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUserNotifications(user.getId())));
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getUnread(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUnreadNotifications(user.getId())));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal UserDetailsImpl user) {
        long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("count", count)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.ok("Marked as read", null));
    }

@PatchMapping("/read-all")
     @Operation(summary = "Mark all notifications as read")
     public ResponseEntity<ApiResponse<Void>> markAllAsRead(
             @AuthenticationPrincipal UserDetailsImpl user) {
         notificationService.markAllAsRead(user.getId());
         return ResponseEntity.ok(ApiResponse.ok("All marked as read", null));
     }

     @PostMapping
     @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
     @Operation(summary = "Create a notification for a user")
     public ResponseEntity<ApiResponse<Void>> create(
             @RequestBody CreateNotificationRequest request) {
         notificationService.createNotification(
                 request.getUserId(),
                 request.getTitle(),
                 request.getMessage(),
                 request.getType(),
                 request.getLink()
         );
         return ResponseEntity.ok(ApiResponse.ok("Notification created", null));
     }
}
