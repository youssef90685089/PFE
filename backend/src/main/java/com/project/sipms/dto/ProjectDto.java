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
    @Size(min = 5, max = 300, message = "Title must be 5-300 characters")
    private String title;
    
    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 2000, message = "Description must be 20-2000 characters")
    private String description;
    
    @Size(max = 200, message = "Domain too long")
    private String domain;
    
    @Size(max = 1000, message = "Technology tags too long")
    private String technologyTags;
    
    private Long submittedById;
    private String submittedByName;
    private Long supervisorId;
    private String supervisorName;
    private String status;
    private Double aiScore;
    private LocalDateTime createdAt;
}
