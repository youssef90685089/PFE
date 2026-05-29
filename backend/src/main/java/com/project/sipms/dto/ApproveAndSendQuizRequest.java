package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload when a manager approves a candidate and sends quiz.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveAndSendQuizRequest {

    /**
     * Optional quiz ID. If provided, assigns an existing quiz instead of creating a new one.
     */
    private Long quizId;

    /**
     * Optional quiz title (used only when creating a new quiz).
     * Defaults to "Internship Quiz" if not provided.
     */
    private String quizTitle;

    /**
     * Optional custom email message to include in the invitation.
     */
    private String customEmailMessage;

    /**
     * Whether to send notification to other managers (optional feature).
     */
    private Boolean notificationEnabled;
}
