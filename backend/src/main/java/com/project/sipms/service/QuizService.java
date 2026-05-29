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

    // ── SUBMIT & GRADE ────────────────────────────────────────────────────────

    /**
     * Submit quiz answers and automatically grade.
     * Updates User.quizScore / User.status / User.quizCompletedAt.
     * Transitions linked application status to QUIZ_COMPLETED.
     */
    @Transactional
    public QuizResultDto submitQuiz(Long userId, QuizSubmissionRequest submission) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found for user: " + userId));

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
    @Transactional(readOnly = true)
    public List<QuizResultDto> getCandidateResults(Long userId) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found for user: " + userId));

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
