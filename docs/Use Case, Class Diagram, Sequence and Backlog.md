# Smart Internship & Project Management System (SIPMS)
## Technical Specification Document

---

## 1. Product Backlog (User Stories)

| ID | Module | User Story | Priority |
|----|--------|-----------|----------|
| US-01 | Auth | As a **User**, I want to login with role-based access (RBAC) to access only features for my profile (Admin, Manager, Receptionist, Candidate). | **High** |
| US-02 | Auth | As an **Admin**, I want to create new user accounts with auto-generated passwords so candidates can login. | **High** |
| US-03 | Auth | As a **User**, I must change my temporary password on first login for security. | **High** |
| US-04 | Management | As a **Receptionist**, I want to register physical dossiers in the system with candidate profile (firstName, lastName, email, phone, CIN) for digitizing and integrating into the selection workflow. | **High** |
| US-05 | Management | As an **Admin/Manager**, I want to manage users (create, modify, delete) to maintain the system. | **High** |
| US-06 | Management | As an **Admin/Manager**, I want to manage supervisors (create, modify, delete) to assign them to projects. | **High** |
| US-07 | Candidate | As a **Candidate**, I want to submit my CV and project idea online to be evaluated by the system. | **High** |
| US-08 | AI System | As a **Manager**, I want the AI to analyze and rank submitted projects to validate the most relevant ones. | **High** |
| US-09 | AI System | As a **Manager**, I want the AI to suggest the most suitable supervisor by analyzing the match between their CV and the project. | **Medium** |
| US-10 | Evaluation | As a **Candidate**, I want to take a timed technical quiz to prove my skills. | **High** |
| US-11 | Evaluation | As a **System**, I want to auto-correct quizzes and generate scores to accelerate decision-making. | **High** |
| US-12 | Evaluation | As a **Candidate**, I want to take a quiz specific to my specialty (Web, Security, Power BI) within 48 hours. | **High** |
| US-13 | Management | As a **Manager**, I want to set candidate status (Accepted, Rejected, Pending) to formalize my final decision. | **High** |
| US-14 | Notification | As a **User**, I want to receive automatic notifications (Email/In-app) at each key step (decision, quiz reminder). | **Medium** |
| US-15 | Dashboard | As a **User**, I want to be redirected to my specific panel based on my role after login. | **High** |
| US-16 | Internship File | As a **Receptionist**, I want to add per-year internship files (year, university, degree, skills tags) with document upload for each candidate. | **High** |
| US-17 | Internship File | As a **Receptionist/Manager**, I want to view all internship files across candidates in a dedicated tab. | **High** |
| US-18 | Quiz | As a **Manager**, I want to approve a candidate and send a quiz — either creating a default 5-question quiz or assigning an existing one. | **High** |
| US-19 | Interview | As a **Manager**, I want to schedule interviews (technical/HR) for candidates who passed the quiz. | **High** |
| US-20 | Interview | As a **Manager**, I want to record interview results (score, notes, feedback) and update the interview status. | **High** |
| US-21 | Interview | As a **Manager**, I want to view all interviews in a dedicated interview management page. | **High** |

---

## 2. Use Case Diagram

### Actors:
- **Admin** - System administration, user management
- **Manager** - Review applications, make decisions, assign supervisors, view AI insights, approve & send quiz, schedule interviews
- **Receptionist** - Register physical dossiers, manage candidates, add per-year internship files with documents
- **Candidate** - Submit applications, take quizzes, view results

### System Features:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                      SMART INTERNSHIP & PROJECT MANAGEMENT SYSTEM (SIPMS)                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                     │
│  ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────┐  │
│  │    AUTHENTICATION     │   │   USER MANAGEMENT    │   │  SUPERVISOR MGMT     │   │    DASHBOARD  │  │
│  │  • Login/Logout       │   │  • Create User       │   │  • Create Supervisor│   │  • Role-Based  │  │
│  │  • Role-Based Access  │   │  • Modify User       │   │  • Modify Supervisor│   │  • Stats View  │  │
│  │  • Password Reset     │   │  • Delete User       │   │  • Delete Supervisor│   │  • Pending QA  │  │
│  │  • Session Management │   │  • Generate Password  │   │  • View Capacity   │   │  • Quick Actions│  │
│  └──────────┬───────────┘   └──────────┬───────────┘   └──────────┬───────────┘   └──────┬───────┘  │
│             │                          │                          │                       │           │
│  ┌──────────┴──────────────────────────┴──────────────────────────┴───────────────────────┴───────┐ │
│  │                                          ACTORS                                                │ │
│  ├──────────────┬──────────────┬────────────────────┬──────────────────────┬──────────────────────┤ │
│  │    ADMIN     │   MANAGER    │   RECEPTIONIST     │     CANDIDATE        │     SYSTEM (AI)      │ │
│  │  • Sys Admin │  • Review App│  • Register Dossiers│ • Submit Application│  • Rank Projects    │ │
│  │  • Manage Usr│  • Make Dec. │  • Manage Candidates│ • Take Quiz         │  • Match Supervisor │ │
│  │  • View Rpts │  • Assign Sup│  • Add Internship   │ • View Results      │  • Calculate Score  │ │
│  │  • AI Insight│  • AI Rank   │    File + Document  │ • Upload CV         │  • Auto-Correct Quiz│ │
│  │              │  • Approve & │  • View Files Tab   │                     │  • NLP Analysis    │ │
│  │              │    Send Quiz │                     │                     │                    │ │
│  │              │  • Schedule  │                     │                     │                    │ │
│  │              │    Interview │                     │                     │                    │ │
│  │              │  • Record    │                     │                     │                    │ │
│  │              │    Result    │                     │                     │                    │ │
│  └──────────────┴──────────────┴────────────────────┴──────────────────────┴──────────────────────┘ │
│                                                                                                     │
│  ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐                    │
│  │    APPLICATION       │   │      QUIZ SYSTEM     │   │    INTERVIEW SYSTEM  │                    │
│  │  • Submit Online     │   │  • Create Quiz       │   │  • Schedule Interview│                    │
│  │  • Register Physical │   │  • Take Quiz         │   │  • Record Result     │                    │
│  │  • Update Status     │   │  • Timer (48h/30min) │   │  • Update Status     │                    │
│  │  • Assign Project    │   │  • Auto-Correct      │   │  • View All          │                    │
│  │  • Assign Supervisor │   │  • View Results      │   │  • Score + Feedback  │                    │
│  │  • Approve & Send    │   │  • Specialty-Based   │   │  • TECHNICAL/HR type │                    │
│  │    Quiz              │   │  • Existing/Default  │   └──────────────────────┘                    │
│  └──────────────────────┘   └──────────────────────┘                                              │
│                                                                                                     │
│  ┌──────────────────────┐   ┌──────────────────────┐                                               │
│  │  INTERNSHIP FILE     │   │    NOTIFICATIONS      │                                               │
│  │  • Per-Year Dossier  │   │  • In-App Alerts      │                                               │
│  │  • University/Degree │   │  • Email Triggers     │                                               │
│  │  • Skills Tags       │   │  • Status Updates     │                                               │
│  │  • Document Upload   │   └──────────────────────┘                                               │
│  │  • View All Files    │                                                                           │
│  └──────────────────────┘                                                                           │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
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

    private String firstName;
    private String lastName;
    @Column(unique = true)
    private String email;
    private String passwordHash;
    private String phone;
    private boolean active;
    private boolean mustChangePassword;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles")
    private Set<Role> roles;
}

// Role
@Entity
@Table(name = "roles")
public class Role {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private RoleName name; // ADMIN, MANAGER, RECEPTIONIST, CANDIDATE

    private String description;
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

    @Column(nullable = false) private String firstName;
    @Column(nullable = false) private String lastName;
    @Column(nullable = false) private String email;
    private String phone;
    private String cin;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;  // Optional: only set when manager invites

    @OneToMany(mappedBy = "candidate", cascade = ALL, orphanRemoval = true)
    private List<InternshipFile> internshipFiles = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Convenience getters (delegate to latest InternshipFile)
    public String getSkillsTags() { ... }
    public String getDegree() { ... }
    public String getUniversity() { ... }
    public Integer getGraduationYear() { ... }
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

    @Column(nullable = false) private String fileName;
    @Column(nullable = false) private String filePath;
    @Column(nullable = false) private String fileType;
    private Long fileSize;

    @Enumerated(EnumType.STRING)
    private DocumentType documentType; // CV, COVER_LETTER, TRANSCRIPT, ID_CARD, PHOTO, OTHER

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

    private String fullName;
    private String email;
    private String department;
    private String expertiseTags;
    private int maxInterns = 3;
    private int currentInterns;
    private String bio;
    private boolean active;
}

// Project (Internship Project Idea)
@Entity
@Table(name = "projects")
public class Project {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String domain;
    private String technologyTags;

    @ManyToOne @JoinColumn(name = "submitted_by")
    private User submittedBy;

    @ManyToOne @JoinColumn(name = "supervisor_id")
    private Supervisor supervisor;

    @Enumerated(EnumType.STRING)
    private ProjectStatus status; // DRAFT, SUBMITTED, APPROVED, REJECTED

    private Double aiScore;
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

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status; // PENDING → UNDER_REVIEW → QUIZ_PENDING → QUIZ_COMPLETED → AI_EVALUATING → MANAGER_REVIEW → ACCEPTED/REJECTED

    @Enumerated(EnumType.STRING)
    private IntakeMethod intakeMethod; // ONLINE, PHYSICAL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registered_by")
    private User registeredBy;

    private String managerNotes;
    private LocalDateTime decisionDate;
    private Double aiMatchScore;
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

    @Column(nullable = false) private String title;
    private String description;
    private int durationMins = 30;
    private int passingScore = 60;
    private int totalMarks = 100;
    private boolean active = true;
    private String specialty;

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
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private char correctOption;
    private int marks;
    private int orderIndex;
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
    private Integer totalMarks;
    private Double percentage;
    private Boolean passed;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

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

    private String interviewer;
    private String type = "TECHNICAL";   // TECHNICAL or HR
    private String status = "SCHEDULED"; // SCHEDULED, COMPLETED, CANCELLED
    private Integer score;
    private String notes;
    private String feedback;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// ============================================================
// NOTIFICATIONS
// ============================================================

// Notification
@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String title;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private String link;
    private LocalDateTime createdAt;
}

// AuditLog
@Entity
@Table(name = "audit_log")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String action;
    private String entityType;
    private Long entityId;
    private String details;
    private String ipAddress;
    private LocalDateTime createdAt;
}
```

### Relationships:
```
User *-- Role (ManyToMany)
Candidate "1" --> "0..1" User (optional OneToOne)
Candidate "1" *--> "0..*" InternshipFile (OneToMany)
InternshipFile "1" *--> "0..*" Document (OneToMany)
Application "1" --> "0..*" Document (OneToMany)
Candidate "1" *--> "0..*" Application (OneToMany)
Application "1" --> "0..1" Project (ManyToOne)
Application "1" --> "0..1" Supervisor (ManyToOne)
Supervisor "1" *--> "0..*" Project (OneToMany)
Quiz "1" *--> "0..*" QuizQuestion (OneToMany)
Quiz "1" *--> "0..*" QuizAttempt (OneToMany)
Candidate "1" *--> "0..*" QuizAttempt (OneToMany)
Application "1" *--> "0..*" QuizAttempt (OneToMany)
Candidate "1" *--> "0..*" Interview (OneToMany)
Application "1" *--> "0..*" Interview (OneToMany)
User "1" *--> "0..*" Quiz (createdBy)
User "1" *--> "0..*" Notification (OneToMany)
```

---

## 4. Sequence Diagrams

### 4.1 Authentication & Role-Based Redirect

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  User    │     │  Frontend   │     │  AuthContext   │     │  Database    │
└────┬─────┘     └──────┬──────┘     └───────┬────────┘     └───────┬────────┘
     │                  │                    │                     │
     │1: Enter credentials                  │                     │
     │─────────────────>│                  │                     │
     │                  │                    │                     │
     │                  │2: Call authApi.login()                 │
     │                  │───────────────────>│                  │
     │                  │                    │                     │
     │                  │3: Validate & return user + role         │
     │                  │<───────────────────│                  │
     │                  │                    │                     │
     │                  │4: Store token + user in localStorage   │
     │                  │───────────────────>│                  │
     │                  │                    │                     │
     │                  │5: dispatch(LOGIN)  │                     │
     │                  │───────────────────>│                  │
     │                  │                    │6: isAuthenticated=true
     │                  │                    │<──────────────────│
     │                  │                    │                     │
     │                  │7: useEffect detects change             │
     │                  │───────────────────>│                  │
     │                  │                    │                     │
     │                  │8: Read roles & redirect                 │
     │                  │<───────────────────│                  │
     │                  │                    │                     │
     │9: Redirect to role-based dashboard   │                     │
     │<─────────────────│                  │                     │
     │                  │                    │                     │
```

### 4.2 Receptionist: Create Candidate + Add Internship File with Document

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Receptionist │     │  Frontend   │     │  CandidateService │     │  Database   │
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
       │   degree, skills, file)                   │                     │
       │────────────────────>│                     │                     │
       │                    │                      │                     │
       │                    │6: POST /candidates/{id}/internship-files  │
       │                    │   /with-document (multipart)              │
       │                    │─────────────────────>│                    │
       │                    │                      │                     │
       │                    │7: Save file to ./uploads                 │
       │                    │                      │─────────────────────>│
       │                    │                      │                     │
       │                    │8: Create Document record                 │
       │                    │                      │─────────────────────>│
       │                    │                      │                     │
       │                    │9: Create InternshipFile record            │
       │                    │                      │─────────────────────>│
       │                    │                      │                     │
       │10: File added (returns InternshipFileDto)│                    │
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
     │   (loads existing quizzes)           │                     │
     │<─────────────────│                  │                     │
     │                  │                    │                     │
     │3: Select existing quiz OR "Create     │                     │
     │   Default 5-Question Quiz"           │                     │
     │─────────────────>│                  │                     │
     │                  │                    │                     │
     │                  │4: POST /api/candidates/{id}/approve-and- │
     │                  │   send-quiz { quizId? }                  │
     │                  │───────────────────>│                    │
     │                  │                    │                     │
     │                  │5: Create User account with temp password │
     │                  │                    │─────────────────────>│
     │                  │                    │                     │
     │                  │6: Create QuizAttempt if quizId provided, │
     │                  │   or create Quiz + 5 default questions   │
     │                  │                    │─────────────────────>│
     │                  │                    │                     │
     │                  │7: Send email with credentials + quiz     │
     │                  │   title                                  │
     │                  │                    │                     │
     │8: Success response                  │                     │
     │<─────────────────│                  │                     │
```

### 4.4 Manager: Schedule Interview

```
┌──────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Manager │     │  Frontend   │     │ InterviewService │     │  Database   │
└────┬─────┘     └──────┬──────┘     └────────┬─────────┘     └──────┬───────┘
     │                  │                     │                     │
     │1: Application status = QUIZ_COMPLETED+ │                     │
     │   Click "Schedule Interview"           │                     │
     │─────────────────>│                   │                     │
     │                  │                     │                     │
     │2: Fill form (date, interviewer, type)  │                     │
     │─────────────────>│                   │                     │
     │                  │                     │                     │
     │                  │3: POST /api/interviews (CreateInterviewRequest)│
     │                  │─────────────────────>│                     │
     │                  │                     │                     │
     │                  │4: Save Interview (status=SCHEDULED)      │
     │                  │                     │─────────────────────>│
     │                  │                     │                     │
     │5: Interview scheduled, added to list  │                     │
     │<─────────────────│                   │                     │
     │                  │                     │                     │
     │6: Interview Completed                 │                     │
     │─────────────────>│                   │                     │
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

### 4.5 Candidate Quiz Taking (48-hour timer)

```
┌──────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Candidate │     │QuizInterface │     │   QuizService   │     │  Database    │
└────┬─────┘     └──────┬──────┘     └────────┬─────────┘     └──────┬───────┘
     │                  │                     │                     │
     │1: Start Quiz     │                     │                     │
     │─────────────────>│                   │                     │
     │                  │                     │                     │
     │                  │2: Create QuizAttempt with expiresAt       │
     │                  │─────────────────────>│                     │
     │                  │                     │                     │
     │                  │                     │3: Save attempt      │
     │                  │                     │─────────────────────>│
     │                  │                     │                     │
     │                  │4: Start timer (30 min or 48h)            │
     │                  │<─────────────────────│                    │
     │                  │                     │                     │
     │5: Display questions│                 │                     │
     │<─────────────────│                   │                     │
     │                  │                     │                     │
     │6: Submit answers │                     │                     │
     │─────────────────>│                   │                     │
     │                  │                     │                     │
     │                  │7: Auto-grade (compare with correctOption) │
     │                  │─────────────────────>│                     │
     │                  │                     │                     │
     │                  │                     │8: Calculate score   │
     │                  │                     │<────────────────────│
     │                  │                     │                     │
     │                  │9: Update Application status               │
     │                  │   → QUIZ_COMPLETED                        │
     │                  │                     │─────────────────────>│
     │                  │                     │                     │
     │10: Display results│                  │                     │
     │<─────────────────│                   │                     │
```

---

## 5. Business Rules Summary

| Rule ID | Description | Enforcement |
|---------|------------|-------------|
| BR-01 | Any physical application must be scanned and associated with a candidate account created by the receptionist | ReceptionPanel + CandidateService |
| BR-02 | A candidate cannot access Manager Review if their quiz score is below passing score (60%) | QuizAttempt.passed flag |
| BR-03 | AI does not make final decisions; it provides a "Confidence Score" to help the Manager | AiService - Ranking only |
| BR-04 | A supervisor cannot manage more than 3 interns simultaneously (CurrentLoad <= 3) | Supervisor.maxInterns = 3 |
| BR-05 | All status changes must trigger an automatic email within 5 minutes maximum | EmailService.sendApplicationStatusUpdate() |
| BR-06 | Quiz must be completed within 48 hours of assignment (candidate) or 30 min (default technical) | Quiz.durationMins field |
| BR-07 | New users must change their temporary password on first login | mustChangePassword flag |
| BR-08 | Each quiz is specific to a specialty (Web, Security, Power BI) or general | Quiz.specialty field |
| BR-09 | A candidate can have multiple internship files (one per academic year) | InternshipFile.year field + Candidate.internshipFiles |
| BR-10 | Document upload is optional during internship file creation | Document entity nullable |
| BR-11 | Interview types: TECHNICAL or HR | Interview.type enum |
| BR-12 | Interview status flow: SCHEDULED → COMPLETED or CANCELLED | Interview.status field |
| BR-13 | Manager can either create a default quiz or assign an existing one during approval | ApproveAndSendQuizRequest.quizId optional |

---

## 6. Role-Based Redirect Logic

| Role | Redirect Path | Description |
|------|--------------|-------------|
| mustChangePassword = true | /reset-password | Force password change |
| ROLE_RECEPTIONIST | /reception-panel | Receptionist: candidates + internship files |
| ROLE_CANDIDATE | /quiz-interface | Quiz taking interface |
| ROLE_ADMIN | /dashboard | Admin dashboard |
| ROLE_MANAGER | /dashboard | Manager dashboard + interview page |

---

## 7. API Endpoints Summary

### Authentication
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/refresh

### Users (Admin only)
- GET /api/users
- POST /api/users
- PUT /api/users/{id}
- DELETE /api/users/{id}
- PATCH /api/users/{id}/toggle-active

### Candidates (Receptionist / Manager)
- GET /api/candidates — list all candidates
- GET /api/candidates/{id} — get candidate by ID
- POST /api/candidates — create candidate (firstName, lastName, email, phone, cin)
- PUT /api/candidates/{id} — update candidate
- DELETE /api/candidates/{id} — delete candidate
- POST /api/candidates/{id}/invite — create User account + send email (Manager)
- POST /api/candidates/{id}/approve-and-send-quiz — approve + assign quiz + send email (Manager)
  - Body: { quizId? } — optional: if omitted, creates default 5-question quiz

### Internship Files (Receptionist / Manager)
- POST /api/candidates/{id}/internship-files — add internship file (JSON)
- POST /api/candidates/{id}/internship-files/with-document — add file + upload document (multipart)

### Supervisors
- GET /api/supervisors
- POST /api/supervisors
- PUT /api/supervisors/{id}
- DELETE /api/supervisors/{id}

### Applications
- GET /api/applications
- POST /api/applications (CANDIDATE)
- POST /api/applications/physical (RECEPTIONIST)
- PATCH /api/applications/{id}/status
- PATCH /api/applications/{id}/assign-supervisor

### Interviews (Manager)
- GET /api/interviews — list all interviews
- GET /api/interviews/{id} — get interview by ID
- POST /api/interviews — create/schedule interview
  - Body: { candidateId, applicationId?, scheduledAt, interviewer?, type? }
- PUT /api/interviews/{id} — update interview
- DELETE /api/interviews/{id} — delete interview
- PUT /api/interviews/{id}/result — record interview result
  - Body: { score?, notes?, feedback?, status? }

### Quiz (Manager / Candidate)
- GET /api/quizzes — list all quizzes
- GET /api/quizzes/{id} — get quiz with questions
- POST /api/quizzes — create quiz (Manager)
- POST /api/quiz/submit — submit quiz attempt (Candidate)
- GET /api/quiz/results — view results (Candidate)

### AI
- GET /api/ai/rank-projects
- GET /api/ai/match-supervisor/{id}

### Notifications
- GET /api/notifications
- GET /api/notifications/unread-count
- PATCH /api/notifications/{id}/read
- PATCH /api/notifications/read-all

### Dashboard
- GET /api/dashboard/manager/stats

---

## 8. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS + React Router v7 |
| Backend | Spring Boot 3.2.5 + Java 17 |
| Database | MySQL 8 + HikariCP |
| ORM | Hibernate 6 (JPA) |
| Auth | JWT (HS512) + Spring Security 6 + RBAC |
| AI | Spring AI (GPT-4-mini / DeepSeek) |
| Email | Spring Mail + Gmail SMTP |
| File Upload | Multipart + FileStorageService (./uploads) |
| Build | Maven (backend) / npm (frontend) |

---

*Document updated: June 2026*
*SIPMS v2.0 - Smart Internship & Project Management System*
