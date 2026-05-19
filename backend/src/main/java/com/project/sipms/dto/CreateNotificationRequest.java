package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateNotificationRequest {
    private Long userId;
    private String title;
    private String message;
    private String type;
    private String link;
}