package com.project.sipms.service;

import com.project.sipms.common.BusinessException;
import com.project.sipms.common.FileStorageService;
import com.project.sipms.common.ResourceNotFoundException;
import com.project.sipms.dto.CandidateDto;
import com.project.sipms.dto.CreateCandidateRequest;
import com.project.sipms.dto.InternshipFileDto;
import com.project.sipms.entity.*;
import com.project.sipms.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final InternshipFileRepository internshipFileRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;

    public CandidateService(CandidateRepository candidateRepository,
                            InternshipFileRepository internshipFileRepository,
                            UserRepository userRepository,
                            RoleRepository roleRepository,
                            PasswordEncoder passwordEncoder,
                            EmailService emailService,
                            QuizRepository quizRepository,
                            QuizQuestionRepository quizQuestionRepository,
                            DocumentRepository documentRepository,
                            FileStorageService fileStorageService) {
        this.candidateRepository = candidateRepository;
        this.internshipFileRepository = internshipFileRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.documentRepository = documentRepository;
        this.fileStorageService = fileStorageService;
    }

    // ── Candidate CRUD ─────────────────────────────────────────────────

    @Transactional
    public CandidateDto createCandidate(CreateCandidateRequest req) {
        if (candidateRepository.existsByEmail(req.getEmail())) {
            throw new BusinessException("Email already registered: " + req.getEmail());
        }

        Candidate candidate = Candidate.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .cin(req.getCin())
                .build();

        candidate = candidateRepository.save(candidate);
        return toDto(candidate);
    }

    @Transactional(readOnly = true)
    public List<CandidateDto> getAllCandidates() {
        return candidateRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CandidateDto getCandidateById(Long id) {
        return toDto(candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", id)));
    }

    @Transactional
    public void deleteCandidate(Long id) {
        if (!candidateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Candidate", id);
        }
        candidateRepository.deleteById(id);
    }

    // ── Internship Files ───────────────────────────────────────────────

    @Transactional
    public InternshipFileDto addInternshipFile(Long candidateId, InternshipFileDto dto) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", candidateId));

        InternshipFile file = InternshipFile.builder()
                .candidate(candidate)
                .year(dto.getYear())
                .university(dto.getUniversity())
                .degree(dto.getDegree())
                .skillsTags(dto.getSkillsTags())
                .build();

        file = internshipFileRepository.save(file);
        return toFileDto(file);
    }

    @Transactional(readOnly = true)
    public List<InternshipFileDto> getInternshipFiles(Long candidateId) {
        return internshipFileRepository.findByCandidateId(candidateId).stream()
                .map(this::toFileDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteInternshipFile(Long fileId) {
        if (!internshipFileRepository.existsById(fileId)) {
            throw new ResourceNotFoundException("InternshipFile", fileId);
        }
        internshipFileRepository.deleteById(fileId);
    }

    @Transactional
    public InternshipFileDto addInternshipFileWithDocument(Long candidateId, InternshipFileDto dto, MultipartFile file) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", candidateId));

        InternshipFile internshipFile = InternshipFile.builder()
                .candidate(candidate)
                .year(dto.getYear())
                .university(dto.getUniversity())
                .degree(dto.getDegree())
                .skillsTags(dto.getSkillsTags())
                .build();
        internshipFile = internshipFileRepository.save(internshipFile);

        if (file != null && !file.isEmpty()) {
            String storedPath = fileStorageService.storeFile(file, "candidates/" + candidateId);
            Document doc = Document.builder()
                    .internshipFile(internshipFile)
                    .fileName(file.getOriginalFilename())
                    .filePath(storedPath)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .documentType(Document.DocumentType.OTHER)
                    .build();
            doc = documentRepository.save(doc);
            internshipFile.getDocuments().add(doc);
        }

        return toFileDto(internshipFile);
    }

    // ── Invite (create User + send email) ──────────────────────────────

    /**
     * Manager approves candidate, creates a default quiz, user account, and sends invitation email.
     */
    @Transactional
    public User approveAndSendQuiz(Long candidateId, com.project.sipms.dto.ApproveAndSendQuizRequest req) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", candidateId));

        if (candidate.isHasUserAccount()) {
            throw new BusinessException("Candidate already has a user account");
        }

        boolean useExistingQuiz = req != null && req.getQuizId() != null;
        String quizTitle;
        Quiz quiz;

        // 1. Generate temp password
        String rawPassword = generateTempPassword();

        // 2. Create User account
        Role candidateRole = roleRepository.findByName("ROLE_CANDIDATE")
                .orElseThrow(() -> new BusinessException("Role ROLE_CANDIDATE not found"));

        User user = User.builder()
                .firstName(candidate.getFirstName())
                .lastName(candidate.getLastName())
                .email(candidate.getEmail())
                .phone(candidate.getPhone())
                .cin(candidate.getCin())
                .passwordHash(passwordEncoder.encode(rawPassword))
                .active(true)
                .mustChangePassword(true)
                .roles(java.util.Set.of(candidateRole))
                .status("pending_quiz")
                .build();

        user = userRepository.save(user);

        // 3. Link candidate to user account
        candidate.setUser(user);
        candidateRepository.save(candidate);

        // 4. Quiz handling: use existing or create default
        if (useExistingQuiz) {
            quiz = quizRepository.findById(req.getQuizId())
                    .orElseThrow(() -> new ResourceNotFoundException("Quiz", req.getQuizId()));
            quizTitle = quiz.getTitle();
        } else {
            quizTitle = (req != null && req.getQuizTitle() != null) ? req.getQuizTitle() : "Internship Quiz";
            quiz = Quiz.builder()
                    .title(quizTitle)
                    .description("Technical assessment for " + candidate.getFirstName() + " " + candidate.getLastName())
                    .durationMins(30)
                    .passingScore(60)
                    .totalMarks(25)
                    .active(true)
                    .createdBy(user)
                    .build();
            quiz = quizRepository.save(quiz);

            String[][] defaultQuestions = {
                {"What is the time complexity of binary search?", "O(n)", "O(log n)", "O(n^2)", "O(1)", "B"},
                {"Which of the following is a relational database?", "MongoDB", "Redis", "PostgreSQL", "Elasticsearch", "C"},
                {"What does HTML stand for?", "Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language", "A"},
                {"Which principle is NOT part of SOLID?", "Single Responsibility", "Open/Closed", "Liskov Substitution", "Direct Injection", "D"},
                {"What is the capital of France?", "London", "Berlin", "Paris", "Madrid", "C"}
            };
            int idx = 0;
            for (String[] q : defaultQuestions) {
                QuizQuestion question = QuizQuestion.builder()
                        .quiz(quiz)
                        .questionText(q[0])
                        .optionA(q[1])
                        .optionB(q[2])
                        .optionC(q[3])
                        .optionD(q[4])
                        .correctOption(q[5])
                        .marks(5)
                        .orderIndex(idx++)
                        .build();
                quiz.getQuestions().add(question);
            }
            quizQuestionRepository.saveAll(quiz.getQuestions());
        }

        // 5. Send welcome email
        try {
            emailService.sendCandidateWelcomeEmail(
                    candidate.getEmail(),
                    candidate.getFirstName() + " " + candidate.getLastName(),
                    rawPassword,
                    "http://localhost:5173/login",
                    quizTitle
            );
        } catch (Exception e) {
            System.err.println("Welcome email failed for " + candidate.getEmail() + ": " + e.getMessage());
        }

        return user;
    }

    /**
     * LEGACY METHOD: Kept for backward compatibility
     * Use approveAndSendQuiz(candidateId, request) instead
     */
    @Transactional
    public User inviteAndSendQuiz(Long candidateId, com.project.sipms.dto.ApproveAndSendQuizRequest unused) {
        return approveAndSendQuiz(candidateId, new com.project.sipms.dto.ApproveAndSendQuizRequest());
    }

    // ── Helpers ────────────────────────────────────────────────────────

    private String generateTempPassword() {
        java.security.SecureRandom rnd = new java.security.SecureRandom();
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        StringBuilder sb = new StringBuilder(10);
        for (int i = 0; i < 10; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        return sb.toString();
    }

    private CandidateDto toDto(Candidate c) {
        return CandidateDto.builder()
                .id(c.getId())
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .cin(c.getCin())
                .hasUserAccount(c.isHasUserAccount())
                .internshipFiles(c.getInternshipFiles().stream().map(this::toFileDto).collect(Collectors.toList()))
                .createdAt(c.getCreatedAt())
                .build();
    }

    private InternshipFileDto toFileDto(InternshipFile f) {
        return InternshipFileDto.builder()
                .id(f.getId())
                .candidateId(f.getCandidate().getId())
                .year(f.getYear())
                .university(f.getUniversity())
                .degree(f.getDegree())
                .skillsTags(f.getSkillsTags())
                .documentFileNames(f.getDocuments().stream()
                        .map(d -> d.getFileName())
                        .collect(Collectors.toList()))
                .documentFilePaths(f.getDocuments().stream()
                        .map(d -> d.getFilePath())
                        .collect(Collectors.toList()))
                .createdAt(f.getCreatedAt())
                .build();
    }
}
