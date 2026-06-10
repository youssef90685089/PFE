# Smart Internship & Project Management System (SIPMS)
## Technical Specification Document

---

## 1. Product Backlog (User Stories)

| ID | Module | User Story | Priority |
|----|--------|-----------|----------|
| US-01 | Auth | As a **User**, I want to login with role-based access (RBAC) to access only features for my profile (Admin, Manager, Receptionist, Candidate). | **High** |
| US-02 | Auth | As an **Admin/Receptionist**, I want to create user accounts with auto-generated or temporary passwords so users can login. | **High** |
| US-03 | Auth | As a **User**, I must change my temporary password on first login for security. | **High** |
| US-04 | Management | As a **Receptionist**, I want to register physical dossiers in the system with candidate profile (firstName, lastName, email, phone, CIN) for digitizing and integrating into the selection workflow. | **High** |
| US-05 | Management | As an **Admin/Manager**, I want to manage users (create, modify, delete, toggle active) to maintain the system. | **High** |
| US-06 | Management | As an **Admin/Manager**, I want to manage supervisors (create, modify, delete) to assign them to projects. | **High** |
| US-07 | Candidate | As a **Candidate**, I want to submit an online application for a project to be evaluated by the system. | **High** |
| US-08 | AI System | As a **Manager**, I want the AI to analyze and rank submitted projects to validate the most relevant ones. | **High** |
| US-09 | AI System | As a **Manager**, I want the AI to suggest the most suitable supervisor by analyzing the match between candidate CV and supervisor expertise. | **Medium** |
| US-10 | Evaluation | As a **Candidate**, I want to take a timed technical quiz to prove my skills. | **High** |
| US-11 | Evaluation | As a **System**, I want to auto-correct quizzes and generate scores to accelerate decision-making. | **High** |
| US-12 | Evaluation | As a **Candidate**, I want to take a quiz specific to my specialty (Web, Security, Power BI) within 48 hours of assignment. | **High** |
| US-13 | Management | As a **Manager**, I want to set candidate application status (Accepted, Rejected, Pending, etc.) to formalize my final decision with valid state transitions. | **High** |
| US-14 | Notification | As a **User**, I want to receive automatic notifications (Email/In-app) at each key step (decision, quiz reminder, interview scheduling). | **Medium** |
| US-15 | Dashboard | As a **User**, I want to be redirected to my specific panel based on my role after login. | **High** |
| US-16 | Internship File | As a **Receptionist**, I want to add per-year internship files (year, university, degree, skills tags) with optional document upload for each candidate. | **High** |
| US-17 | Internship File | As a **Receptionist/Manager**, I want to view all internship files across candidates in a dedicated tab. | **High** |
| US-18 | Quiz | As a **Manager**, I want to approve a candidate and send a quiz — either creating a default 5-question quiz or assigning an existing one. | **High** |
| US-19 | Interview | As a **Manager**, I want to schedule interviews (technical/HR) for candidates who passed the quiz. | **High** |
| US-20 | Interview | As a **Manager**, I want to record interview results (score, notes, feedback) and update the interview status. | **High** |
| US-21 | Interview | As a **Manager**, I want to view all interviews in a dedicated interview management page. | **High** |
| US-22 | AI System | As a **Candidate**, I want the AI to analyze my CV and generate a 4-week project roadmap tailored to my skills. | **Medium** |
| US-23 | AI System | As a **Candidate/Manager**, I want the AI to match my CV against available projects and rank the top 3 best fits based on TF-IDF similarity. | **High** |
| US-24 | Management | As an **Admin/Manager**, I want to manage projects (create, modify, delete, change status, assign supervisor) to maintain the project catalog. | **High** |
| US-25 | Management | As a **Candidate**, I want to propose a project idea to be evaluated by the AI and reviewed by the manager. | **Medium** |
| US-26 | Application | As a **Receptionist**, I want to register a physical application with candidate linked to a specific project for candidates who apply on-site. | **High** |
| US-27 | Application | As a **Manager**, I want to assign a supervisor to an application considering supervisor capacity constraints. | **High** |
| US-28 | Dashboard | As a **Manager**, I want to view dashboard statistics (candidate counts, acceptance rate, applications by status/month) for monitoring. | **Medium** |
| US-29 | Notifications | As a **User**, I want to view, mark as read, and dismiss in-app notifications. | **Low** |
| US-30 | Quiz | As an **Admin/Manager**, I want to create quizzes with multiple-choice questions, configurable duration, passing score, and specialty association. | **High** |
| US-31 | Reception | As a **Receptionist**, I want a dedicated reception panel to manage candidate creation, internship files, and document uploads in one place. | **High** |
| US-32 | Candidate | As a **Candidate**, I want to view and edit my profile (university, degree, skills, bio) and track my application status. | **Medium** |
| US-33 | Audit | As an **Admin**, I want to view audit logs tracking all system actions (user creation, status changes) for compliance. | **Low** |
| US-34 | AI System | As a **Candidate**, I want to upload my CV document (PDF/DOCX) and have the AI extract skills and match me to suitable projects automatically. | **High** |

---

## 2. Use Case Diagram

### Actors:
- **Admin** - Full system control: user management, audit logs, settings, all management capabilities
- **Manager** - Application lifecycle management, quiz creation, interview scheduling, AI insights, project/supervisor management
- **Receptionist** - Dedicated reception panel: candidate registration, internship files with documents, physical applications
- **Candidate** - Submit applications, take quizzes, upload CV for AI analysis, view results, manage profile
- **System (AI)** - Project ranking, candidate matching, CV analysis, roadmap generation, auto-correction

### System Features:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                         SMART INTERNSHIP & PROJECT MANAGEMENT SYSTEM (SIPMS)                             │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│  ┌──────────────────────┐   ┌────────────────────────┐   ┌──────────────────────┐   ┌─────────────────┐  │
│  │    AUTHENTICATION     │   │    USER MANAGEMENT     │   │  SUPERVISOR MGMT     │   │    DASHBOARD    │  │
│  │  • Login/Logout       │   │  • Create/Edit/Delete  │   │  • Create/Edit/Delete│   │  • Role-Based   │  │
│  │  • JWT Role-Based     │   │  • Toggle Active       │   │  • View Capacity    │   │  • Stats/KPIs   │  │
│  │  • Change Password    │   │  • Role Assignment     │   │  • Expertise Tags   │   │  • Charts        │  │
│  │  • Self-Register      │   │  • Welcome Email       │   │  • Max Interns (3)  │   │  • Quick Actions │  │
│  └──────────────────────┘   └────────────────────────┘   └──────────────────────┘   └─────────────────┘  │
│                                                                                                          │
│  ┌──────────────────────┐   ┌────────────────────────┐   ┌──────────────────────┐   ┌─────────────────┐  │
│  │    APPLICATION        │   │      QUIZ SYSTEM       │   │    INTERVIEW SYSTEM  │   │   PROJECT MGMT  │  │
│  │  • Submit Online     │   │  • Create Quiz + MCQ   │   │  • Schedule Interview│   │  • Create/Edit  │  │
│  │  • Register Physical │   │  • Take Quiz (timed)   │   │  • Record Result     │   │  • Delete        │  │
│  │  • Update Status     │   │  • Auto-Correct        │   │  • Update Status     │   │  • Change Status │  │
│  │  • Assign Supervisor │   │  • View Results        │   │  • TECHNICAL/HR type │   │  • Assign Super. │  │
│  │  • Manager Notes     │   │  • Specialty-Based     │   │  • Score + Feedback  │   └─────────────────┘  │
│  │  • Lifecycle Machine │   │  • Assign to Candidate │   └──────────────────────┘                       │
│  └──────────────────────┘   └────────────────────────┘                                                  │
│                                                                                                          │
│  ┌──────────────────────┐   ┌────────────────────────┐   ┌──────────────────────┐   ┌─────────────────┐  │
│  │  RECEPTION PANEL     │   │   INTERNSHIP FILE      │   │    NOTIFICATIONS      │   │    AI SYSTEM    │  │
│  │  • Register Candidate│   │  • Per-Year Dossier    │   │  • In-App Alerts      │   │  • Rank Projects│  │
│  │  • View All Candidates│  │  • University/Degree   │   │  • Mark Read/All      │   │  • Match Cand.  │  │
│  │  • Search/Filter     │   │  • Skills Tags         │   │  • Unread Count       │   │  • CV-to-Project│  │
│  │  • Delete Candidate  │   │  • Document Upload     │   │  • Email Triggers     │   │  • Generate Road│  │
│  │  • Edit Candidate    │   │  • View All Files      │   └──────────────────────┘   │  • Analyze CV    │  │
│  └──────────────────────┘   └────────────────────────┘                              └─────────────────┘  │
│                                                                                                          │
│  ┌──────────────────────┐   ┌────────────────────────┐                                                    │
│  │   AUDIT & SETTINGS   │   │   CANDIDATE PROFILE    │                                                    │
│  │  • View Audit Logs   │   │  • View/Edit Profile   │                                                    │
│  │  • System Settings   │   │  • Upload CV           │                                                    │
│  │  • Config (Admin)    │   │  • View AI Results     │                                                    │
│  └──────────────────────┘   │  • My Applications     │                                                    │
│                             │  • My Projects         │                                                    │
│                             └────────────────────────┘                                                    │
│                                                                                                          │
│  ACTORS:                                                                                                 │
│  ┌──────────┬──────────────┬────────────────┬───────────────────┬─────────────────────────┐              │
│  │  ADMIN   │   MANAGER    │  RECEPTIONIST  │    CANDIDATE      │     SYSTEM (AI)         │              │
│  │• Full    │• App Life.   │• Reception    │• Apply Online     │• Project Ranking       │              │
│  │  Access  │• Quiz Create │  Panel         │• Take Quiz        │• Candidate Matching    │              │
│  │• Audit   │• Interview   │• Candidate    │• Upload CV        │• CV Analysis           │              │
│  │• Users   │• AI Insights │  Registration │• AI Roadmap       │• Auto-Correct Quiz     │              │
│  │• Config  │• Projects    │• Doc Upload   │• My Applications  │• Roadmap Generation    │              │
│  │         │• Supervisors  │• Physical App │• My Projects      │• NLP Scoring           │              │
│  └──────────┴──────────────┴────────────────┴───────────────────┴─────────────────────────┘              │
│                                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Class Diagram (Detailed)

### Core Entities:

```java
// ============================================================
// AUTHENTICATION & AUTHORIZATION
// ============================================================

// User (Authentication & Authorization Base)
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;
    @Column(nullable = false, unique = true, length = 255)
    private String email;
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    @Column(length = 20)
    private String phone;
    @Column(length = 20)
    private String cin;
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;
    @Column(nullable = false)
    private boolean active = true;
    @Column(name = "must_change_password")
    private boolean mustChangePassword = true;
    @Column(length = 100)
    private String specialty;
    @Column(name = "internship_year")
    private Integer internshipYear;
    @Column(length = 50)
    private String status;
    @Column(name = "quiz_created_at")
    private LocalDateTime quizCreatedAt;
    @Column(name = "quiz_completed_at")
    private LocalDateTime quizCompletedAt;
    @Column
    private Integer quizScore;
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @PrePersist
    public void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate
    public void onUpdate() { updatedAt = LocalDateTime.now(); }
}

// Role
@Entity
@Table(name = "roles")
public class Role {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name; // ADMIN, MANAGER, RECEPTIONIST, CANDIDATE
}

// ============================================================
// CANDIDATE MANAGEMENT
// ============================================================

// Candidate (Standalone — no longer extends User)
@Entity
@Table(name = "candidates")
public class Candidate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100) private String firstName;
    @Column(nullable = false, length = 100) private String lastName;
    @Column(nullable = false, length = 255) private String email;
    @Column(length = 20) private String phone;
    @Column(length = 20) private String cin;
    @Column(name = "assigned_quiz_id")
    private Long assignedQuizId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;  // Optional: only set when manager invites

    @OneToMany(mappedBy = "candidate", cascade = ALL, orphanRemoval = true, fetch = EAGER)
    private List<InternshipFile> internshipFiles = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Convenience getters (delegate to latest InternshipFile)
    public String getSkillsTags() { return latestFile().getSkillsTags(); }
    public String getDegree() { return latestFile().getDegree(); }
    public String getUniversity() { return latestFile().getUniversity(); }
    public Integer getGraduationYear() { return latestFile().getYear(); }
    public boolean isHasUserAccount() { return user != null; }
}

// InternshipFile (Per-Year Dossier)
@Entity
@Table(name = "internship_files")
public class InternshipFile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(nullable = false) private Integer year;
    @Column(length = 300) private String university;
    @Column(length = 200) private String degree;
    @Column(name = "skills_tags", length = 1000) private String skillsTags;

    @OneToMany(mappedBy = "internshipFile", cascade = ALL, orphanRemoval = true)
    private List<Document> documents = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// Document (File Uploads)
@Entity
@Table(name = "documents")
public class Document {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "internship_file_id")
    private InternshipFile internshipFile;

    @Column(nullable = false, length = 300) private String fileName;
    @Column(nullable = false, length = 500) private String filePath;
    @Column(nullable = false, length = 100) private String fileType;
    private Long fileSize;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 20)
    private DocumentType documentType = DocumentType.OTHER; // CV, COVER_LETTER, TRANSCRIPT, ID_CARD, PHOTO, OTHER

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    private LocalDateTime createdAt;

    public enum DocumentType { CV, COVER_LETTER, TRANSCRIPT, ID_CARD, PHOTO, OTHER }
}

// ============================================================
// SUPERVISOR & PROJECT
// ============================================================

// Supervisor (Project Mentor)
@Entity
@Table(name = "supervisors")
public class Supervisor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 200) private String fullName;
    @Column(nullable = false, length = 255) private String email;
    @Column(nullable = false, length = 200) private String department;
    @Column(name = "expertise_tags", nullable = false, length = 1000) private String expertiseTags;
    private int maxInterns = 3;
    @Column(name = "current_interns") private int currentInterns;
    @Column(columnDefinition = "TEXT") private String bio;
    @Column(nullable = false) private boolean active = true;
    private LocalDateTime createdAt;
}

// Project (Internship Project Idea)
@Entity
@Table(name = "projects")
public class Project {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300) private String title;
    @Column(nullable = false, columnDefinition = "TEXT") private String description;
    @Column(length = 200) private String domain;
    @Column(name = "technology_tags", length = 1000) private String technologyTags;
    @Column(name = "required_skills", length = 1000) private String requiredSkills;

    @ManyToOne @JoinColumn(name = "submitted_by")
    private User submittedBy;

    @ManyToOne @JoinColumn(name = "supervisor_id")
    private Supervisor supervisor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProjectStatus status = ProjectStatus.DRAFT; // DRAFT, SUBMITTED, APPROVED, REJECTED

    @Column(name = "ai_score")
    private Double aiScore;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum ProjectStatus { DRAFT, SUBMITTED, APPROVED, REJECTED }
}

// ============================================================
// APPLICATION LIFECYCLE
// ============================================================

// Application (Lifecycle Entity)
@Entity
@Table(name = "applications")
public class Application {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private Supervisor supervisor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registered_by")
    private User registeredBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "intake_method", nullable = false, length = 10)
    private IntakeMethod intakeMethod = IntakeMethod.ONLINE;

    @Column(columnDefinition = "TEXT") private String managerNotes;
    private LocalDateTime decisionDate;
    @Column(name = "ai_match_score") private Double aiMatchScore;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum ApplicationStatus { PENDING, UNDER_REVIEW, QUIZ_PENDING, QUIZ_COMPLETED, AI_EVALUATING, MANAGER_REVIEW, ACCEPTED, REJECTED }
    public enum IntakeMethod { ONLINE, PHYSICAL }
}

// ============================================================
// QUIZ SYSTEM
// ============================================================

// Quiz (Assessment Definition)
@Entity
@Table(name = "quizzes")
public class Quiz {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300) private String title;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(name = "duration_mins", nullable = false) private int durationMins = 30;
    @Column(name = "passing_score", nullable = false) private int passingScore = 60;
    @Column(name = "total_marks", nullable = false) private int totalMarks = 100;
    @Column(nullable = false) private boolean active = true;
    @Column(length = 100) private String specialty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "quiz", cascade = ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<QuizQuestion> questions = new ArrayList<>();

    private LocalDateTime createdAt;
}

// QuizQuestion
@Entity
@Table(name = "quiz_questions")
public class QuizQuestion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;
    @Column(nullable = false, length = 500) private String optionA;
    @Column(nullable = false, length = 500) private String optionB;
    @Column(nullable = false, length = 500) private String optionC;
    @Column(nullable = false, length = 500) private String optionD;
    @Column(name = "correct_option", nullable = false, length = 1)
    private String correctOption; // "A", "B", "C", or "D"
    @Column(nullable = false) private int marks = 5;
    @Column(name = "order_index", nullable = false) private int orderIndex;
}

// QuizAttempt (Candidate's Attempt)
@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private Application application;

    private Integer score;
    @Column(name = "total_marks") private Integer totalMarks;
    private Double percentage;
    private Boolean passed;
    @Column(name = "started_at", updatable = false)
    private LocalDateTime startedAt;
    @Column(name = "completed_at") private LocalDateTime completedAt;

    @OneToMany(mappedBy = "attempt", cascade = ALL, orphanRemoval = true)
    private List<QuizAnswer> answers = new ArrayList<>();
}

// ============================================================
// INTERVIEW SYSTEM
// ============================================================

// Interview (Candidate Evaluation)
@Entity
@Table(name = "interviews")
public class Interview {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private Application application;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Column(length = 200) private String interviewer;
    @Column(length = 30, nullable = false) private String type = "TECHNICAL"; // TECHNICAL or HR
    @Column(length = 30, nullable = false) private String status = "SCHEDULED"; // SCHEDULED, COMPLETED, CANCELLED
    private Integer score;
    @Column(columnDefinition = "TEXT") private String notes;
    @Column(columnDefinition = "TEXT") private String feedback;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// ============================================================
// NOTIFICATIONS & AUDIT & AI
// ============================================================

// Notification
@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 300) private String title;
    @Column(nullable = false, columnDefinition = "TEXT") private String message;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private NotificationType type = NotificationType.INFO; // INFO, SUCCESS, WARNING, ERROR
    @Column(name = "is_read", nullable = false) private boolean read = false;
    @Column(length = 500) private String link;
    private LocalDateTime createdAt;

    public enum NotificationType { INFO, SUCCESS, WARNING, ERROR }
}

// AuditLog
@Entity
@Table(name = "audit_log")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100) private String action;
    @Column(name = "entity_type", nullable = false, length = 100) private String entityType;
    @Column(name = "entity_id") private Long entityId;
    @Column(columnDefinition = "TEXT") private String details;
    @Column(name = "ip_address", length = 50) private String ipAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;
}

// AiRanking
@Entity
@Table(name = "ai_rankings")
public class AiRanking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "ranking_type", nullable = false, length = 20)
    private RankingType rankingType; // PROJECT_RANK, CANDIDATE_MATCH

    @Column(name = "reference_id", nullable = false)
    private Long referenceId;
    @Column(nullable = false) private double score;
    @Column(columnDefinition = "TEXT") private String reasoning;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private Supervisor supervisor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ranked_by")
    private User rankedBy;

    private LocalDateTime createdAt;

    public enum RankingType { PROJECT_RANK, CANDIDATE_MATCH }
}
```

### Relationships:
```
User *-- Role (ManyToMany)
Candidate "1" --> "0..1" User (optional OneToOne)
Candidate "1" *--> "0..*" InternshipFile (OneToMany, EAGER)
InternshipFile "1" *--> "0..*" Document (OneToMany)
Application "1" --> "0..*" Document (OneToMany)
Candidate "1" *--> "0..*" Application (OneToMany)
Application "1" --> "0..1" Project (ManyToOne)
Application "1" --> "0..1" Supervisor (ManyToOne)
Application "1" --> "0..1" User (registeredBy)
Supervisor "1" *--> "0..*" Project (OneToMany)
Supervisor "1" --> "0..1" User (OneToOne)
Quiz "1" *--> "0..*" QuizQuestion (OneToMany)
Quiz "1" *--> "0..*" QuizAttempt (OneToMany)
Candidate "1" *--> "0..*" QuizAttempt (OneToMany)
Application "1" *--> "0..*" QuizAttempt (OneToMany)
Candidate "1" *--> "0..*" Interview (OneToMany)
Application "1" *--> "0..*" Interview (OneToMany)
User "1" *--> "0..*" Quiz (createdBy)
User "1" *--> "0..*" Notification (OneToMany)
User "1" *--> "0..*" AuditLog (OneToMany)
Supervisor "1" --> "0..*" AiRanking (OneToMany)
User "1" --> "0..*" AiRanking (rankedBy)
```

---

## 4. Sequence Diagrams

### 4.1 Authentication & Role-Based Redirect

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  User    │     │  Frontend   │     │  AuthController │     │  Database   │
└────┬─────┘     └──────┬──────┘     └───────┬─────────┘     └──────┬───────┘
     │                  │                    │                     │
     │1: Enter credentials                   │                     │
     │─────────────────>│                  │                     │
     │                  │                    │                     │
     │                  │2: POST /api/auth/login                    │
     │                  │───────────────────>│                    │
     │                  │                    │                     │
     │                  │                    │3: Validate email+BCrypt password
     │                  │                    │─────────────────────>│
     │                  │                    │                     │
     │                  │4: Return JWT (access+refresh) + user+role│
     │                  │<───────────────────│                    │
     │                  │                    │                     │
     │                  │5: Store in localStorage + AuthContext   │
     │                  │                    │                     │
     │                  │6: RoleBasedRedirect                     │
     │                  │                    │                     │
     │7: Redirect to role-appropriate UI  │                     │
     │<─────────────────│                  │                     │
     │                  │                    │                     │
     │                  │                    │                     │
     │ Option A: mustChangePassword=true     │                     │
     │8: Redirect to /change-password      │                     │
     │<─────────────────│                  │                     │
     │                  │                    │                     │
     │9: Submit current+new password         │                     │
     │─────────────────>│                  │                     │
     │                  │10: POST /api/auth/change-password       │
     │                  │───────────────────>│                    │
     │                  │                    │11: Verify+update BCrypt hash
     │                  │                    │─────────────────────>│
     │                  │                    │                     │
     │12: Success + clear mustChangePassword │                    │
     │<─────────────────│                  │                     │
```

### 4.2 Receptionist: Create Candidate + Add Internship File with Document

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Receptionist │     │  Frontend   │     │ CandidateService │     │  Database   │
└──────┬───────┘     └──────┬──────┘     └────────┬─────────┘     └──────┬───────┘
       │                    │                      │                     │
       │1: Fill form (firstName, lastName, email,  │                     │
       │   phone, cin)                             │                     │
       │────────────────────>│                     │                     │
       │                    │                      │                     │
       │                    │2: POST /api/candidates (JSON)             │
       │                    │─────────────────────>│                    │
       │                    │                      │                     │
       │                    │3: Save Candidate     │                     │
       │                    │                      │─────────────────────>│
       │                    │                      │                     │
       │4: Candidate created (id=6)               │                     │
       │<────────────────────│                     │                     │
       │                    │                      │                     │
       │5: Add Internship File (year, university, │                     │
       │   degree, skills, optional file)          │                     │
       │────────────────────>│                     │                     │
       │                    │                      │                     │
       │                    │6: POST /candidates/{id}/internship-files  │
       │                    │   /with-document (multipart)              │
       │                    │─────────────────────>│                    │
       │                    │                      │                     │
       │                    │7: FileStorageService saves to ./uploads  │
       │                    │                      │─────────────────────>│
       │                    │                      │                     │
       │                    │8: Create InternshipFile + Document record │
       │                    │                      │─────────────────────>│
       │                    │                      │                     │
       │10: File added (returns InternshipFileDto) │                    │
       │<────────────────────│                     │                     │
```

### 4.3 Manager: Approve Candidate & Send Quiz (with Quiz Selection)

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Manager │     │  Frontend   │     │ CandidateService│     │  Database   │
└────┬─────┘     └──────┬──────┘     └───────┬─────────┘     └──────┬───────┘
     │                  │                    │                     │
     │1: Click "Approve & Send Quiz"        │                     │
     │─────────────────>│                  │                     │
     │                  │                    │                     │
     │2: QuizSelectionModal opens           │                     │
     │   (loads existing quizzes from GET)  │                     │
     │<─────────────────│                  │                     │
     │                  │                    │                     │
     │3: Select existing quiz OR "Create     │                     │
     │   Default 5-Question Quiz"           │                     │
     │─────────────────>│                  │                     │
     │                  │                    │                     │
     │                  │4: POST /api/candidates/{id}/             │
     │                  │   approve-and-send-quiz { quizId? }      │
     │                  │───────────────────>│                    │
     │                  │                    │                     │
     │                  │5: Create User account (BCrypt temp pwd)  │
     │                  │                    │─────────────────────>│
     │                  │                    │                     │
     │                  │6a: If quizId → create QuizAttempt       │
     │                  │6b: If no quizId → create Quiz + 5 MCQs  │
     │                  │                    │─────────────────────>│
     │                  │                    │                     │
     │                  │7: Send welcome email (Gmail SMTP)       │
     │                  │                    │                     │
     │8: Success (user+quiz created)       │                     │
     │<─────────────────│                  │                     │
```

### 4.4 Application Lifecycle State Machine

```
(PENDING) ──→ (UNDER_REVIEW) ──→ (QUIZ_PENDING) ──→ (QUIZ_COMPLETED)
    │              │                    │                    │
    │  Reception   │   Manager         │  Candidate        │  System
    │  completes   │   approves        │  submits quiz    │  auto-triggers
    │              │                   │  or timer expires │
    │              │                   │                    │
    ▼              ▼                   ▼                    ▼
(REJECTED)    (REJECTED)         (REJECTED)          (AI_EVALUATING)
                                                          │
                                                          │  System
                                                          │  auto-triggers
                                                          ▼
                                                    (MANAGER_REVIEW)
                                                          │
                                                     ┌────┴────┐
                                                     │         │
                                                  (ACCEPTED) (REJECTED)
```

### 4.5 Interview Scheduling and Result Recording

```
┌──────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Manager │     │  Frontend   │     │ InterviewService │     │  Database   │
└────┬─────┘     └──────┬──────┘     └────────┬─────────┘     └──────┬───────┘
     │                  │                     │                     │
     │1: Application status check             │                     │
     │   (must be QUIZ_COMPLETED + passed)    │                     │
     │                  │                     │                     │
     │2: Click "Schedule Interview"          │                     │
     │─────────────────>│                   │                     │
     │                  │                     │                     │
     │3: Fill form (date, interviewer, type) │                     │
     │─────────────────>│                   │                     │
     │                  │                     │                     │
     │                  │4: POST /api/interviews                    │
     │                  │─────────────────────>│                     │
     │                  │                     │                     │
     │                  │5: Save Interview (status=SCHEDULED)      │
     │                  │                     │─────────────────────>│
     │                  │                     │                     │
     │6: Interview scheduled, added to list  │                     │
     │<─────────────────│                   │                     │
     │                  │                     │                     │
     │   ... Interview occurs ...            │                     │
     │                  │                     │                     │
     │7: Fill result (score, notes, feedback) │                     │
     │─────────────────>│                   │                     │
     │                  │                     │                     │
     │                  │8: PUT /api/interviews/{id}/result        │
     │                  │   (UpdateInterviewResultRequest)         │
     │                  │─────────────────────>│                     │
     │                  │                     │                     │
     │                  │9: Update status=COMPLETED, save score    │
     │                  │                     │─────────────────────>│
     │                  │                     │                     │
     │10: Result recorded                    │                     │
     │<─────────────────│                   │                     │
```

### 4.6 Candidate Quiz Taking (with timer)

```
┌──────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Candidate │     │QuizInterface │     │   QuizService   │     │  Database    │
└────┬─────┘     └──────┬──────┘     └────────┬─────────┘     └──────┬───────┘
     │                  │                     │                     │
     │1: Navigate to quiz page                │                     │
     │─────────────────>│                   │                     │
     │                  │                     │                     │
     │                  │2: GET /api/quizzes/my-quiz               │
     │                  │─────────────────────>│                     │
     │                  │                     │                     │
     │                  │3: Return quiz (no correct answers)       │
     │                  │<─────────────────────│                    │
     │                  │                     │                     │
     │4: Display quiz with countdown timer   │                     │
     │<─────────────────│                   │                     │
     │                  │                     │                     │
     │5: Answer questions (navigate)         │                     │
     │─────────────────>│                   │                     │
     │                  │                     │                     │
     │6: Click Submit before timer expires    │                     │
     │─────────────────>│                   │                     │
     │                  │                     │                     │
     │                  │7: POST /api/quizzes/submit               │
     │                  │─────────────────────>│                     │
     │                  │                     │                     │
     │                  │8: Compare answers with correctOption     │
     │                  │9: Calculate score/percentage/passed      │
     │                  │10: Update Application → QUIZ_COMPLETED   │
     │                  │11: Notify candidate + all managers       │
     │                  │                     │─────────────────────>│
     │                  │                     │                     │
     │12: Display result (score, pass/fail)  │                     │
     │<─────────────────│                   │                     │
     │                  │                     │                     │
     │   On timer expiry (auto-submit):      │                     │
     │   System auto-submits current answers  │                     │
```

### 4.7 CV Upload + AI Project Matching

```
┌──────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Candidate │     │CVUploadPage  │     │  AiController   │     │ AiService    │
└────┬─────┘     └──────┬──────┘     └────────┬─────────┘     └──────┬───────┘
     │                  │                     │                      │
     │1: Upload CV (PDF/DOCX)                 │                      │
     │─────────────────>│                   │                      │
     │                  │                     │                      │
     │                  │2: POST /api/ai/analyze-cv (multipart)     │
     │                  │─────────────────────>│                     │
     │                  │                     │                      │
     │                  │                     │3: extractText(PDFBox/POI)
     │                  │                     │─────────────────────>│
     │                  │                     │                      │
     │                  │                     │4: extractSkills()   │
     │                  │                     │5: scoreAgainstProjects()
     │                  │                     │6: generateRoadmap() │
     │                  │                     │<────────────────────│
     │                  │                     │                      │
     │                  │7: Return CvProjectMatchDto               │
     │                  │<────────────────────│                     │
     │                  │                     │                      │
     │8: Display detected skills + ranked    │                     │
     │   projects + 4-week roadmap           │                     │
     │<─────────────────│                   │                      │
```

### 4.8 Manager: Update Application Status

```
┌──────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Manager │     │  Frontend   │     │ ApplicationSrv   │     │  Database   │
└────┬─────┘     └──────┬──────┘     └────────┬─────────┘     └──────┬───────┘
     │                  │                     │                     │
     │1: View applications list               │                     │
     │─────────────────>│                   │                     │
     │                  │                     │                     │
     │                  │2: GET /api/applications                   │
     │                  │─────────────────────>│                    │
     │                  │                     │                     │
     │                  │3: Return all apps with status + AI score  │
     │                  │<────────────────────│                    │
     │                  │                     │                     │
     │4: Click "Update Status" on an app     │                     │
     │─────────────────>│                   │                     │
     │                  │                     │                     │
     │5: Select new status + add notes       │                     │
     │─────────────────>│                   │                     │
     │                  │                     │                     │
     │                  │6: PATCH /api/applications/{id}/status     │
     │                  │   { status, managerNotes }                │
     │                  │─────────────────────>│                    │
     │                  │                     │                     │
     │                  │7: Validate transition + save             │
     │                  │                     │─────────────────────>│
     │                  │                     │                     │
     │                  │8: Send email notification async          │
     │                  │9: Create in-app notification             │
     │                  │                     │                     │
     │10: Status updated + toast success     │                     │
     │<─────────────────│                   │                     │
```

---

## 5. Business Rules Summary

| Rule ID | Description | Enforcement |
|---------|------------|-------------|
| BR-01 | Physical applications must be registered by a receptionist with a candidate record | ReceptionPanel + CandidateService |
| BR-02 | A candidate cannot advance to MANAGER_REVIEW if quiz score is below passing score (60%) | QuizAttempt.passed flag check |
| BR-03 | AI does not make final decisions; it provides a "Confidence Score" to help the Manager | AiService - Ranking only |
| BR-04 | A supervisor cannot manage more than 3 interns simultaneously (CurrentInterns <= MaxInterns) | Supervisor.maxInterns = 3 |
| BR-05 | All application status changes trigger automatic email notifications | EmailService.sendApplicationStatusUpdate() async |
| BR-06 | Quiz must be completed within configured duration (default 30 min) | Quiz.durationMins + timer auto-submit |
| BR-07 | New users must change temporary password on first login | mustChangePassword flag enforced in SecurityConfig |
| BR-08 | Each quiz can be tagged with a specialty (Web, Security, Power BI) or left general | Quiz.specialty field |
| BR-09 | A candidate can have multiple internship files (one per academic year) | InternshipFile.year per candidate |
| BR-10 | Document upload is optional during internship file creation | Document entity nullable relationship |
| BR-11 | Interview types: TECHNICAL or HR | Interview.type field |
| BR-12 | Interview status flow: SCHEDULED → COMPLETED or CANCELLED | Interview.status transitions |
| BR-13 | Manager can create a default 5-question quiz or assign an existing one during approval | ApproveAndSendQuizRequest.quizId optional |
| BR-14 | Application status transitions follow a strict DFA: PENDING → UNDER_REVIEW → QUIZ_PENDING → QUIZ_COMPLETED → AI_EVALUATING → MANAGER_REVIEW → ACCEPTED/REJECTED | ApplicationService.updateStatus() validates allowed transitions |
| BR-15 | A candidate cannot submit the same quiz twice | QuizService blocks duplicate QuizAttempt per (candidate, quiz) |
| BR-16 | Interview scheduling requires candidate to have PASSED the quiz | InterviewService validates QuizAttempt.passed |
| BR-17 | CIN is unique per candidate for physical dossier identification | Candidate.cin field |
| BR-18 | All file uploads are stored with UUID filenames to prevent path traversal | FileStorageService generates UUID names |
| BR-19 | Each department supervisor has defined expertise tags for AI matching | Supervisor.expertiseTags |
| BR-20 | Audit log entries are created for all state-changing operations | AuditService logs all CUD operations |

---

## 6. Role-Based Redirect Logic

| Condition | Redirect Path | Description |
|-----------|--------------|-------------|
| mustChangePassword = true | /change-password | Force password change |
| ROLE_RECEPTIONIST | /dashboard/reception-panel | Receptionist panel |
| ROLE_CANDIDATE | /dashboard/quiz-interface | Quiz taking interface |
| ROLE_ADMIN | /dashboard | Admin dashboard |
| ROLE_MANAGER | /dashboard | Manager dashboard |

---

## 7. API Endpoints Summary

### Authentication (public)
- `POST /api/auth/login` — Authenticate user, return JWT tokens + profile
- `POST /api/auth/change-password` — Change password (authenticated)
- `POST /api/public/login` — Public unauthenticated login
- `POST /api/public/register` — Self-registration for candidates

### Users (ADMIN, RECEPTIONIST)
- `GET /api/users` — List all users (ADMIN)
- `GET /api/users/candidates` — List candidate users
- `GET /api/users/{id}` — Get user by ID
- `POST /api/users` — Create user (optional temp password, sends welcome email)
- `PUT /api/users/{id}` — Update user fields and roles
- `PATCH /api/users/{id}/toggle-active` — Toggle user active/inactive
- `DELETE /api/users/{id}` — Delete user
- `POST /api/users/onboard` — Admin creates user with temp password (ADMIN)
- `POST /api/users/{id}/reset-password` — Admin resets user password (ADMIN)

### Candidates (ADMIN, MANAGER, RECEPTIONIST)
- `GET /api/candidates` — List all candidates
- `GET /api/candidates/{id}` — Get candidate by ID
- `POST /api/candidates` — Create candidate
- `PUT /api/candidates/{id}` — Update candidate
- `DELETE /api/candidates/{id}` — Delete candidate
- `POST /api/candidates/{id}/approve-and-send-quiz` — Approve candidate, create user, assign quiz, send email (MANAGER, ADMIN)
- `POST /api/candidates/{id}/invite` — Legacy invite alias

### Internship Files
- `POST /api/candidates/{id}/internship-files` — Add internship file (JSON)
- `GET /api/candidates/{id}/internship-files` — Get internship files for candidate
- `DELETE /api/candidates/internship-files/{id}` — Delete internship file
- `POST /api/candidates/{id}/internship-files/with-document` — Add file with document upload (multipart)

### Projects (ADMIN, MANAGER)
- `GET /api/projects` — List all projects
- `GET /api/projects/my` — Get current user's submitted projects
- `GET /api/projects/managed` — Get supervised projects
- `GET /api/projects/{id}` — Get project by ID
- `POST /api/projects` — Create project
- `PUT /api/projects/{id}` — Update project
- `DELETE /api/projects/{id}` — Delete project
- `PATCH /api/projects/{id}/status` — Update project status (APPROVED/REJECTED)
- `PATCH /api/projects/{id}/assign-supervisor` — Assign supervisor to project

### Applications (ADMIN, MANAGER, RECEPTIONIST, CANDIDATE)
- `GET /api/applications` — List all applications
- `GET /api/applications/my` — Get current candidate's applications
- `GET /api/applications/status/{status}` — Filter by status
- `GET /api/applications/{id}` — Get application by ID
- `POST /api/applications` — Submit online application (CANDIDATE)
- `POST /api/applications/physical` — Register physical dossier (ADMIN, RECEPTIONIST)
- `PATCH /api/applications/{id}/status` — Update application status with transition validation
- `PATCH /api/applications/{id}/assign-supervisor` — Assign supervisor (validates capacity)

### Supervisors (ADMIN, MANAGER)
- `GET /api/supervisors` — List all supervisors
- `GET /api/supervisors/active` — List active supervisors only
- `GET /api/supervisors/{id}` — Get supervisor by ID
- `POST /api/supervisors` — Create supervisor
- `PUT /api/supervisors/{id}` — Update supervisor
- `DELETE /api/supervisors/{id}` — Delete supervisor

### Interviews (ADMIN, MANAGER)
- `GET /api/interviews` — List all interviews
- `GET /api/interviews/by-status/{status}` — Filter by status
- `GET /api/interviews/by-candidate/{id}` — Get interviews for a candidate
- `POST /api/interviews` — Schedule interview (sends email notification)
- `PUT /api/interviews/{id}/result` — Record interview result (score, notes, feedback)
- `DELETE /api/interviews/{id}` — Delete interview

### Quizzes (ADMIN, MANAGER, CANDIDATE)
- `GET /api/quizzes` — List all quizzes with correct answers (ADMIN)
- `GET /api/quizzes/active` — List active quizzes without answers (CANDIDATE)
- `GET /api/quizzes/by-specialty?specialty=` — Get quiz matching specialty (CANDIDATE)
- `GET /api/quizzes/my-quiz` — Get assigned quiz for current candidate
- `GET /api/quizzes/my-results` — Get quiz results for current candidate
- `GET /api/quizzes/{id}` — Get quiz for taking (no correct answers)
- `GET /api/quizzes/{id}/full` — Get quiz with correct answers (ADMIN)
- `POST /api/quizzes` — Create quiz with questions (auto-calculates totalMarks)
- `PUT /api/quizzes/{id}` — Update quiz, replace questions
- `POST /api/quizzes/submit` — Submit quiz answers for grading
- `POST /api/quizzes/{quizId}/assign/{userId}` — Assign quiz to candidate

### AI (ADMIN, MANAGER)
- `POST /api/ai/rank-projects` — AI-ranking of all submitted projects
- `POST /api/ai/match-candidates/{supervisorId}` — AI-match candidates to supervisor
- `GET /api/ai/rankings/projects` — Historical project rankings
- `GET /api/ai/rankings/candidates/{supervisorId}` — Historical candidate matchings
- `POST /api/ai/generate-roadmap` — Generate project roadmap from CV text
- `POST /api/ai/match-cv-to-projects` — Match CV text to projects, generate roadmap
- `POST /api/ai/analyze-cv` (multipart) — Upload CV file, extract text, run AI matching

### Dashboard
- `GET /api/dashboard/manager/stats` — Dashboard statistics (total counts, by status/by month)

### Notifications
- `GET /api/notifications` — List all notifications for current user
- `GET /api/notifications/unread` — List unread notifications
- `GET /api/notifications/unread-count` — Get unread count
- `PATCH /api/notifications/{id}/read` — Mark notification as read
- `PATCH /api/notifications/read-all` — Mark all as read
- `POST /api/notifications` — Create notification for a user

### Audit Logs
- `GET /api/audit-logs` — Get 50 most recent audit log entries (ADMIN, MANAGER)

### Dev / Debug (no auth)
- `POST /api/dev/create-user` — Create user directly
- `POST /api/dev/direct-login` — Direct login returning JWT
- `GET /api/dev/users` — List all users with debug info
- `POST /api/dev/fix-password` — Reset password directly
- `GET /api/debug/users` — Return raw user entities
- `GET /api/debug/user/{email}` — Lookup user by email with hash info

---

## 8. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 + Tailwind CSS v4 + React Router v6 |
| Backend | Spring Boot 3.2.5 + Java 17 |
| Database | MySQL 8 + HikariCP |
| ORM | Hibernate 6 (JPA) |
| Auth | JWT (HS512) + Spring Security 6 + RBAC (@PreAuthorize) |
| AI | Custom scoring engine (weighted formula) + Spring AI |
| Email | Spring Mail + Gmail SMTP (async) |
| File Upload | Multipart + FileStorageService (./uploads with UUID names) |
| Build | Maven (backend) / npm (frontend) |
| Testing | JUnit 5 + Mockito + Postman collections |
| Icons | Lucide React v1 |
| Charts | Recharts v3 |
| Notifications | react-hot-toast v2 |

---

*Document updated: June 2026*
*SIPMS v2.0 - Smart Internship & Project Management System*
