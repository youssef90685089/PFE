package com.project.sipms.service;

import com.project.sipms.common.BusinessException;
import com.project.sipms.common.ResourceNotFoundException;
import com.project.sipms.dto.*;
import com.project.sipms.entity.*;
import com.project.sipms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Quiz service — handles quiz retrieval, creation, submission, and automated grading.
 */
@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public QuizService(QuizRepository quizRepository, QuizQuestionRepository questionRepository,
                       QuizAttemptRepository attemptRepository, CandidateRepository candidateRepository,
                       ApplicationRepository applicationRepository,
                       NotificationService notificationService,
                       UserRepository userRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.attemptRepository = attemptRepository;
        this.candidateRepository = candidateRepository;
        this.applicationRepository = applicationRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    // ── READ ─────────────────────────────────────────────────────────────────

    /** Get all active quizzes (without correct answers for candidates) */
    @Transactional(readOnly = true)
    public List<QuizDto> getActiveQuizzes() {
        return quizRepository.findByActiveTrue().stream()
                .map(this::toDtoWithoutAnswers)
                .collect(Collectors.toList());
    }

    /** Get quiz with questions (for taking the quiz — no correct answers) */
    @Transactional(readOnly = true)
    public QuizDto getQuizForCandidate(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", quizId));
        return toDtoWithoutAnswers(quiz);
    }

    /** Get quiz with correct answers (for managers/admins) */
    @Transactional(readOnly = true)
    public QuizDto getQuizWithAnswers(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", quizId));
        return toDtoWithAnswers(quiz);
    }

    /** Get all quizzes for management */
    @Transactional(readOnly = true)
    public List<QuizDto> getAllQuizzes() {
        return quizRepository.findAll().stream()
                .map(this::toDtoWithAnswers)
                .collect(Collectors.toList());
    }

    /**
     * Get the first active quiz matching a candidate's specialty (case-insensitive).
     * Returns empty Optional if none exists.
     */
    public Optional<QuizDto> getQuizBySpecialty(String specialty) {
        if (specialty == null || specialty.isBlank()) return Optional.empty();
        return quizRepository.findFirstBySpecialtyIgnoreCaseAndActiveTrue(specialty)
                .map(this::toDtoWithoutAnswers);
    }

    /**
     * Returns the one quiz assigned to this candidate, resolved in priority order:
     *   1. Directly assigned quiz stored on the candidate record (set during approval)
     *   2. Active quiz whose specialty matches the candidate's degree/skills
     *   3. First available active quiz (fallback)
     */
    @Transactional
    public Optional<QuizDto> getMyQuiz(Long userId) {
        Candidate candidate = findCandidateForUser(userId);

        // Priority 1: directly assigned quiz
        if (candidate.getAssignedQuizId() != null) {
            return quizRepository.findById(candidate.getAssignedQuizId())
                    .map(this::toDtoWithoutAnswers);
        }

        // Priority 2: match by candidate's degree / skills tags as specialty
        String specialty = candidate.getDegree();
        if (specialty == null || specialty.isBlank()) {
            specialty = candidate.getSkillsTags();
        }
        if (specialty != null && !specialty.isBlank()) {
            Optional<QuizDto> bySpecialty = quizRepository
                    .findFirstBySpecialtyIgnoreCaseAndActiveTrue(specialty)
                    .map(this::toDtoWithoutAnswers);
            if (bySpecialty.isPresent()) return bySpecialty;
        }

        // Priority 3: fallback — first active quiz
        return quizRepository.findByActiveTrue().stream()
                .findFirst()
                .map(this::toDtoWithoutAnswers);
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    /**
     * Create a quiz with all its questions in one transaction (Admin/Manager only).
     */
    @Transactional
    public QuizDto createQuiz(QuizCreateRequest req, Long createdByUserId) {
        User creator = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", createdByUserId));

        int totalMarks = 0;
        if (req.getQuestions() != null) {
            totalMarks = req.getQuestions().stream()
                    .mapToInt(q -> q.getMarks() != null ? q.getMarks() : 5)
                    .sum();
        }

        Quiz quiz = Quiz.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .specialty(req.getSpecialty())
                .durationMins(req.getDurationMins() != null ? req.getDurationMins() : 30)
                .passingScore(req.getPassingScore() != null ? req.getPassingScore() : 60)
                .totalMarks(totalMarks > 0 ? totalMarks : 100)
                .active(true)
                .createdBy(creator)
                .build();

        if (req.getQuestions() != null) {
            int idx = 0;
            for (QuizCreateRequest.QuestionCreateDto qDto : req.getQuestions()) {
                QuizQuestion question = QuizQuestion.builder()
                        .quiz(quiz)
                        .questionText(qDto.getQuestionText())
                        .optionA(qDto.getOptionA())
                        .optionB(qDto.getOptionB())
                        .optionC(qDto.getOptionC())
                        .optionD(qDto.getOptionD())
                        .correctOption(qDto.getCorrectOption() != null
                                ? qDto.getCorrectOption().toUpperCase() : "A")
                        .marks(qDto.getMarks() != null ? qDto.getMarks() : 5)
                        .orderIndex(qDto.getOrderIndex() != null ? qDto.getOrderIndex() : idx)
                        .build();
                quiz.getQuestions().add(question);
                idx++;
            }
        }

        Quiz saved = quizRepository.save(quiz);
        return toDtoWithAnswers(saved);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    @Transactional
    public QuizDto updateQuiz(Long id, QuizCreateRequest req) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", id));

        // Update basic fields
        if (req.getTitle() != null) quiz.setTitle(req.getTitle());
        if (req.getDescription() != null) quiz.setDescription(req.getDescription());
        if (req.getSpecialty() != null) quiz.setSpecialty(req.getSpecialty());
        if (req.getDurationMins() != null) quiz.setDurationMins(req.getDurationMins());
        if (req.getPassingScore() != null) quiz.setPassingScore(req.getPassingScore());

        // Replace questions if provided
        if (req.getQuestions() != null && !req.getQuestions().isEmpty()) {
            questionRepository.deleteByQuizId(quiz.getId());
            quiz.getQuestions().clear();

            int totalMarks = 0;
            int idx = 0;
            for (QuizCreateRequest.QuestionCreateDto qDto : req.getQuestions()) {
                int marks = qDto.getMarks() != null ? qDto.getMarks() : 5;
                totalMarks += marks;
                QuizQuestion question = QuizQuestion.builder()
                        .quiz(quiz)
                        .questionText(qDto.getQuestionText())
                        .optionA(qDto.getOptionA())
                        .optionB(qDto.getOptionB())
                        .optionC(qDto.getOptionC())
                        .optionD(qDto.getOptionD())
                        .correctOption(qDto.getCorrectOption() != null
                                ? qDto.getCorrectOption().toUpperCase() : "A")
                        .marks(marks)
                        .orderIndex(qDto.getOrderIndex() != null ? qDto.getOrderIndex() : idx)
                        .build();
                quiz.getQuestions().add(question);
                idx++;
            }
            quiz.setTotalMarks(totalMarks);
        }

        Quiz saved = quizRepository.save(quiz);
        return toDtoWithAnswers(saved);
    }

    // ── SUBMIT & GRADE ────────────────────────────────────────────────────────

    /**
     * Submit quiz answers and automatically grade.
     * Updates User.quizScore / User.status / User.quizCompletedAt.
     * Transitions linked application status to QUIZ_COMPLETED.
     */
    @Transactional
    public QuizResultDto submitQuiz(Long userId, QuizSubmissionRequest submission) {
        Candidate candidate = findCandidateForUser(userId);

        Quiz quiz = quizRepository.findById(submission.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", submission.getQuizId()));

        // Check for duplicate attempts
        if (attemptRepository.existsByCandidateIdAndQuizId(candidate.getId(), quiz.getId())) {
            throw new BusinessException("You have already attempted this quiz");
        }

        // Create attempt record
        QuizAttempt attempt = QuizAttempt.builder()
                .quiz(quiz)
                .candidate(candidate)
                .build();

        // Link to application if provided
        if (submission.getApplicationId() != null) {
            Application app = applicationRepository.findById(submission.getApplicationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Application", submission.getApplicationId()));
            attempt.setApplication(app);
        }

        // Grade each answer
        List<QuizQuestion> questions = questionRepository.findByQuizIdOrderByOrderIndexAsc(quiz.getId());
        int totalScore = 0;
        int totalMarks = 0;

        for (QuizQuestion question : questions) {
            String selectedOption = submission.getAnswers().getOrDefault(question.getId(), null);
            boolean isCorrect = question.getCorrectOption().equalsIgnoreCase(
                    selectedOption != null ? selectedOption : "");

            if (isCorrect) totalScore += question.getMarks();
            totalMarks += question.getMarks();

            QuizAnswer answer = QuizAnswer.builder()
                    .attempt(attempt)
                    .question(question)
                    .selectedOption(selectedOption)
                    .isCorrect(isCorrect)
                    .build();
            attempt.getAnswers().add(answer);
        }

        // Calculate results
        double percentage = totalMarks > 0 ? (double) totalScore / totalMarks * 100 : 0;
        boolean passed = percentage >= quiz.getPassingScore();

        attempt.setScore(totalScore);
        attempt.setTotalMarks(totalMarks);
        attempt.setPercentage(percentage);
        attempt.setPassed(passed);
        attempt.setCompletedAt(LocalDateTime.now());
        attemptRepository.save(attempt);

        // ── Persist results on the User profile ───────────────────────────────
        User user = candidate.getUser();
        user.setQuizScore((int) Math.round(percentage));
        user.setQuizCompletedAt(LocalDateTime.now());
        user.setStatus(passed ? "quiz_completed" : "quiz_failed");
        userRepository.save(user);

        // Transition application status if linked
        if (attempt.getApplication() != null) {
            Application app = attempt.getApplication();
            app.setStatus(Application.ApplicationStatus.QUIZ_COMPLETED);
            applicationRepository.save(app);
        }

        // Notify candidate of results
        String resultMessage = passed
                ? String.format("Congratulations! You scored %.1f%% on '%s'. You passed!", percentage, quiz.getTitle())
                : String.format("You scored %.1f%% on '%s'. The passing score is %d%%.", percentage, quiz.getTitle(), quiz.getPassingScore());
        notificationService.createNotification(userId, "Quiz Results",
                resultMessage, passed ? "SUCCESS" : "WARNING", "/dashboard/quiz-interface");

        // Notify managers about the quiz results
        List<User> managers = userRepository.findByRoleName("ROLE_MANAGER");
        if (passed) {
            String managerMessage = String.format("The candidate %s %s passed the quiz '%s' with a score of %.1f%%.", 
                    candidate.getFirstName(), candidate.getLastName(), quiz.getTitle(), percentage);
            for (User manager : managers) {
                notificationService.createNotification(manager.getId(), "Candidate Passed Quiz",
                        managerMessage, "SUCCESS", "/dashboard/candidates");
            }
        } else {
            String managerMessage = String.format("The candidate %s %s failed the quiz '%s' with a score of %.1f%%.", 
                    candidate.getFirstName(), candidate.getLastName(), quiz.getTitle(), percentage);
            for (User manager : managers) {
                notificationService.createNotification(manager.getId(), "Candidate Failed Quiz",
                        managerMessage, "WARNING", "/dashboard/candidates");
            }
        }

        return QuizResultDto.builder()
                .attemptId(attempt.getId())
                .quizId(quiz.getId())
                .quizTitle(quiz.getTitle())
                .score(totalScore)
                .totalMarks(totalMarks)
                .percentage(percentage)
                .passed(passed)
                .passingScore(quiz.getPassingScore())
                .completedAt(attempt.getCompletedAt())
                .build();
    }

    /** Get quiz results for a candidate */
    @Transactional
    public List<QuizResultDto> getCandidateResults(Long userId) {
        Candidate candidate = findCandidateForUser(userId);

        return attemptRepository.findByCandidateId(candidate.getId()).stream()
                .map(a -> QuizResultDto.builder()
                        .attemptId(a.getId())
                        .quizId(a.getQuiz().getId())
                        .quizTitle(a.getQuiz().getTitle())
                        .score(a.getScore())
                        .totalMarks(a.getTotalMarks())
                        .percentage(a.getPercentage())
                        .passed(a.getPassed())
                        .passingScore(a.getQuiz().getPassingScore())
                        .completedAt(a.getCompletedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Finds the Candidate linked to a given userId.
     * Primary lookup: by candidate.user_id FK.
     * Fallback: look up the User's email and match against candidate.email,
     *           then auto-repair the missing FK so future lookups succeed.
     */
    @Transactional
    private Candidate findCandidateForUser(Long userId) {
        // 1. Fast path — the FK is properly set
        java.util.Optional<Candidate> byUserId = candidateRepository.findByUserId(userId);
        if (byUserId.isPresent()) {
            return byUserId.get();
        }

        // 2. Fallback — FK was never written (partial/failed approval); try email match
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.project.sipms.common.ResourceNotFoundException("User", userId));

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
                    System.out.println("[QuizService] Auto-created missing Candidate record for user " + userId);
                    return candidateRepository.save(newCandidate);
                });

        // Auto-repair: write the missing FK so the fast path works next time
        if (candidate.getUser() == null) {
            candidate.setUser(user);
            candidateRepository.save(candidate);
            System.out.println("[QuizService] Auto-repaired candidate " + candidate.getId()
                    + " -> user " + userId + " link.");
        }

        return candidate;
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private QuizDto toDtoWithoutAnswers(Quiz quiz) {
        List<QuestionDto> questions = quiz.getQuestions().stream()
                .map(q -> QuestionDto.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .optionA(q.getOptionA())
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        // correctOption intentionally omitted for candidates
                        .marks(q.getMarks())
                        .orderIndex(q.getOrderIndex())
                        .build())
                .collect(Collectors.toList());

        return QuizDto.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .specialty(quiz.getSpecialty())
                .durationMins(quiz.getDurationMins())
                .passingScore(quiz.getPassingScore())
                .totalMarks(quiz.getTotalMarks())
                .active(quiz.isActive())
                .questionCount(questions.size())
                .questions(questions)
                .createdAt(quiz.getCreatedAt())
                .build();
    }

    private QuizDto toDtoWithAnswers(Quiz quiz) {
        List<QuestionDto> questions = quiz.getQuestions().stream()
                .map(q -> QuestionDto.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .optionA(q.getOptionA())
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        .correctOption(q.getCorrectOption())
                        .marks(q.getMarks())
                        .orderIndex(q.getOrderIndex())
                        .build())
                .collect(Collectors.toList());

        return QuizDto.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .specialty(quiz.getSpecialty())
                .durationMins(quiz.getDurationMins())
                .passingScore(quiz.getPassingScore())
                .totalMarks(quiz.getTotalMarks())
                .active(quiz.isActive())
                .questionCount(questions.size())
                .questions(questions)
                .createdAt(quiz.getCreatedAt())
                .build();
    }
}
