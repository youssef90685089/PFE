package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class InternshipFileDto {
    private Long id;
    private Long candidateId;
    private Integer year;
    private String university;
    private String degree;
    private String skillsTags;
    private List<String> documentFileNames;
    private List<String> documentFilePaths;
    private LocalDateTime createdAt;
}
