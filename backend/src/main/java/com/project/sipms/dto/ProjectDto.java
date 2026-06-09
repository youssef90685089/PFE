package com.project.sipms.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectDto {
    private Long id;
    
    @NotBlank(message = "Title is required")
    @Size(max = 300, message = "Title too long (max 300 characters)")
    private String title;
    
    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description too long (max 2000 characters)")
    private String description;
    
    @Size(max = 200, message = "Domain too long (max 200 characters)")
    private String domain;
    
    @Size(max = 1000, message = "Technology tags too long (max 1000 characters)")
    private String technologyTags;
    
    private Long submittedById;
    private String submittedByName;
    private Long supervisorId;
    private String supervisorName;
    private String status;
    private Double aiScore;
    private LocalDateTime createdAt;
}
