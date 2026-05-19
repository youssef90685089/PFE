package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AiRankingDto {
    private Long id;
    private String rankingType;
    private Long referenceId;
    private String referenceName;
    private Long supervisorId;
    private String supervisorName;
    private double score;
    private String reasoning;
}
