package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CandidateDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String cin;
    private boolean hasUserAccount;
    private List<InternshipFileDto> internshipFiles;
    private LocalDateTime createdAt;
    /** null = no quiz taken, true = passed, false = failed */
    private Boolean quizPassed;
    /** percentage score (0-100) if quiz was taken */
    private Integer quizScore;
}
