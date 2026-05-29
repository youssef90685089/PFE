package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateInterviewResultRequest {
    private Integer score;
    private String notes;
    private String feedback;
    private String status;
}