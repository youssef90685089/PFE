package com.project.sipms.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ApplicationDto {
    private Long id;
    
    @NotNull(message = "Candidate ID is required")
    private Long candidateId;
    
    private String candidateName;
    
    @Email(message = "Candidate email must be valid")
    private String candidateEmail;
    
    private Long projectId;
    
    @Size(max = 300, message = "Project title too long")
    private String projectTitle;
    
    private Long supervisorId;
    
    @Size(max = 200, message = "Supervisor name too long")
    private String supervisorName;
    
    private String status;
    private String intakeMethod;
    
    @Size(max = 1000, message = "Manager notes too long")
    private String managerNotes;
    
    @DecimalMin(value = "0.0", message = "AI match score must be >= 0")
    @DecimalMax(value = "100.0", message = "AI match score must be <= 100")
    private Double aiMatchScore;
    
    private LocalDateTime decisionDate;
    private LocalDateTime createdAt;
}
