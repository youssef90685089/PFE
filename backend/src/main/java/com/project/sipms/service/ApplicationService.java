package com.project.sipms.service;

import com.project.sipms.common.AuditService;
import com.project.sipms.common.BusinessException;
import com.project.sipms.common.ResourceNotFoundException;
import com.project.sipms.dto.ApplicationDto;
import com.project.sipms.entity.*;
import com.project.sipms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Application service — manages the full internship application lifecycle
 * with transactional status transitions and notification triggers.
 */
@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final ProjectRepository projectRepository;
    private final SupervisorRepository supervisorRepository;
    private final NotificationService notificationService;
    private final com.project.sipms.security.SecurityAuditService securityAuditService;
    private final EmailService emailService;
    private final QuizAttemptRepository quizAttemptRepository;
    private final com.project.sipms.repository.UserRepository userRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                              CandidateRepository candidateRepository,
                              ProjectRepository projectRepository,
                              SupervisorRepository supervisorRepository,
                              NotificationService notificationService,
                              com.project.sipms.security.SecurityAuditService securityAuditService,
                              EmailService emailService,
                              QuizAttemptRepository quizAttemptRepository,
                              com.project.sipms.repository.UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.candidateRepository = candidateRepository;
        this.projectRepository = projectRepository;
        this.supervisorRepository = supervisorRepository;
        this.notificationService = notificationService;
        this.securityAuditService = securityAuditService;
        this.emailService = emailService;
        this.quizAttemptRepository = quizAttemptRepository;
        this.userRepository = userRepository;
    }

    public List<ApplicationDto> getAllApplications() {
        return applicationRepository.findAll().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public ApplicationDto getApplicationById(Long id) {
        return toDto(applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", id)));
    }

    public List<ApplicationDto> getApplicationsByUserId(Long userId) {
        return applicationRepository.findByCandidateUserId(userId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public List<ApplicationDto> getApplicationsByStatus(String status) {
        Application.ApplicationStatus appStatus = Application.ApplicationStatus.valueOf(status);
        return applicationRepository.findByStatus(appStatus).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    /** Create a new application (online or physical intake) */
    @Transactional
    public ApplicationDto createApplication(Long userId, Long projectId,
                                            String intakeMethod, Long registeredById) {
        Candidate candidate = findCandidateForUser(userId);

        Application app = Application.builder()
                .candidate(candidate)
                .status(Application.ApplicationStatus.PENDING)
                .intakeMethod(Application.IntakeMethod.valueOf(intakeMethod))
                .build();

        if (projectId != null) {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
            app.setProject(project);
        }

        if (registeredById != null) {
            // Physical intake by receptionist
            app.setIntakeMethod(Application.IntakeMethod.PHYSICAL);
        }

        Application saved = applicationRepository.save(app);

        // Notify candidate
        notificationService.createNotification(userId, "Application Submitted",
                "Your internship application has been submitted successfully.",
                "SUCCESS", "/dashboard/applications");

        securityAuditService.logSecurityEvent("APPLICATION_CREATE",
                "{\"candidateId\":" + candidate.getId() + ",\"intake\":\"" + intakeMethod + "\"}");

        return toDto(saved);
    }

    /** Transition application status with validation and notifications */
    @Transactional
    public ApplicationDto updateStatus(Long applicationId, String newStatus, String managerNotes) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", applicationId));

        Application.ApplicationStatus oldStatus = app.getStatus();
        Application.ApplicationStatus targetStatus = Application.ApplicationStatus.valueOf(newStatus);

        // Business Rule: Must pass quiz before proceeding to AI_EVALUATING or MANAGER_REVIEW
        if (oldStatus == Application.ApplicationStatus.QUIZ_COMPLETED &&
            (targetStatus == Application.ApplicationStatus.AI_EVALUATING ||
             targetStatus == Application.ApplicationStatus.MANAGER_REVIEW)) {
            checkQuizPassed(app, newStatus);
        }

        // Validate status transition
        validateStatusTransition(oldStatus, targetStatus);

        app.setStatus(targetStatus);
        if (managerNotes != null) {
            app.setManagerNotes(managerNotes);
        }

        // Set decision date for final statuses
        if (targetStatus == Application.ApplicationStatus.ACCEPTED ||
            targetStatus == Application.ApplicationStatus.REJECTED) {
            app.setDecisionDate(LocalDateTime.now());
        }

        Application saved = applicationRepository.save(app);

        // Send email notification on status change
        emailService.sendApplicationStatusUpdate(saved.getId());

        // Notify the candidate about status change
        Long candidateUserId = app.getCandidate().getUser().getId();
        String statusMessage = "Your application status has been updated to: " + targetStatus.name();
        String notificationType = targetStatus == Application.ApplicationStatus.ACCEPTED ? "SUCCESS" :
                                  targetStatus == Application.ApplicationStatus.REJECTED ? "ERROR" : "INFO";
        notificationService.createNotification(candidateUserId, "Status Update",
                statusMessage, notificationType, "/dashboard/applications");

        securityAuditService.logDecision("APPLICATION", applicationId, oldStatus.name(), targetStatus.name(), managerNotes);

        return toDto(saved);
    }

    /** Assign a supervisor to an application */
    @Transactional
    public ApplicationDto assignSupervisor(Long applicationId, Long supervisorId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", applicationId));
        Supervisor supervisor = supervisorRepository.findById(supervisorId)
                .orElseThrow(() -> new ResourceNotFoundException("Supervisor", supervisorId));

        if (supervisor.getCurrentInterns() >= supervisor.getMaxInterns()) {
            throw new BusinessException("Supervisor has reached maximum intern capacity");
        }

        app.setSupervisor(supervisor);
        supervisor.setCurrentInterns(supervisor.getCurrentInterns() + 1);
        supervisorRepository.save(supervisor);

        return toDto(applicationRepository.save(app));
    }

/** Validate that a status transition is allowed */
    private void validateStatusTransition(Application.ApplicationStatus from,
                                          Application.ApplicationStatus to) {
        // Business Rule: Cannot proceed to Interview without passing quiz
        if ((from == Application.ApplicationStatus.QUIZ_COMPLETED) &&
            (to == Application.ApplicationStatus.AI_EVALUATING || to == Application.ApplicationStatus.MANAGER_REVIEW)) {
            // This is enforced - quiz is already completed so we're good
        }

        boolean valid = switch (from) {
            case PENDING -> to == Application.ApplicationStatus.UNDER_REVIEW ||
                            to == Application.ApplicationStatus.REJECTED;
            case UNDER_REVIEW -> to == Application.ApplicationStatus.QUIZ_PENDING ||
                                 to == Application.ApplicationStatus.REJECTED;
            case QUIZ_PENDING -> to == Application.ApplicationStatus.QUIZ_COMPLETED ||
                                 to == Application.ApplicationStatus.REJECTED;
            case QUIZ_COMPLETED -> to == Application.ApplicationStatus.AI_EVALUATING ||
                                   to == Application.ApplicationStatus.MANAGER_REVIEW ||
                                   to == Application.ApplicationStatus.REJECTED;
            case AI_EVALUATING -> to == Application.ApplicationStatus.MANAGER_REVIEW ||
                                   to == Application.ApplicationStatus.REJECTED;
            case MANAGER_REVIEW -> to == Application.ApplicationStatus.ACCEPTED ||
                                   to == Application.ApplicationStatus.REJECTED;
            default -> false;
        };
        if (!valid) {
            throw new BusinessException("Invalid status transition: " + from + " → " + to);
        }
    }

    private void checkQuizPassed(Application application, String targetStatus) {
        // Query the latest quiz attempt for this candidate
        var attempts = quizAttemptRepository.findByCandidateId(application.getCandidate().getId());
        var latestAttempt = attempts.stream()
                .filter(a -> a.getPassed() != null)
                .max((a1, a2) -> a1.getCompletedAt().compareTo(a2.getCompletedAt()))
                .orElse(null);

        if (latestAttempt == null || !latestAttempt.getPassed()) {
            throw new BusinessException("You must pass the quiz before proceeding to " + targetStatus);
        }
    }

    /**
     * Finds the Candidate linked to a given userId.
     * Falls back to email-matching and auto-repairs the FK if missing.
     */
    @Transactional
    private Candidate findCandidateForUser(Long userId) {
        java.util.Optional<Candidate> byUserId = candidateRepository.findByUserId(userId);
        if (byUserId.isPresent()) return byUserId.get();

        com.project.sipms.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Candidate candidate = candidateRepository.findByEmail(user.getEmail())
                .orElseGet(() -> {
                    Candidate newCandidate = Candidate.builder()
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .email(user.getEmail())
                            .phone(user.getPhone())
                            .cin(user.getCin())
                            .user(user)
                            .build();
                    System.out.println("[ApplicationService] Auto-created missing Candidate record for user " + userId);
                    return candidateRepository.save(newCandidate);
                });

        if (candidate.getUser() == null) {
            candidate.setUser(user);
            candidateRepository.save(candidate);
            System.out.println("[ApplicationService] Auto-repaired candidate " + candidate.getId()
                    + " -> user " + userId + " link.");
        }
        return candidate;
    }

    public ApplicationDto toDto(Application a) {
        ApplicationDto.ApplicationDtoBuilder builder = ApplicationDto.builder()
                .id(a.getId())
                .candidateId(a.getCandidate().getId())
                .candidateName(a.getCandidate().getUser().getFirstName() + " " +
                               a.getCandidate().getUser().getLastName())
                .candidateEmail(a.getCandidate().getUser().getEmail())
                .status(a.getStatus().name())
                .intakeMethod(a.getIntakeMethod().name())
                .managerNotes(a.getManagerNotes())
                .aiMatchScore(a.getAiMatchScore())
                .decisionDate(a.getDecisionDate())
                .createdAt(a.getCreatedAt());

        if (a.getProject() != null) {
            builder.projectId(a.getProject().getId())
                   .projectTitle(a.getProject().getTitle());
        }
        if (a.getSupervisor() != null) {
            builder.supervisorId(a.getSupervisor().getId())
                   .supervisorName(a.getSupervisor().getFullName());
        }
        return builder.build();
    }
}
