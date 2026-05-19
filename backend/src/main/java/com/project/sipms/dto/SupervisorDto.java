package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SupervisorDto {
    private Long id;
    private String fullName;
    private String email;
    private String department;
    private String expertiseTags;
    private int maxInterns;
    private int currentInterns;
    private String bio;
    private boolean active;
}
