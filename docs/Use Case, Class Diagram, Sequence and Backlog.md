# Smart Internship & Project Management System (SIPMS)
## Technical Specification Document

---

## 1. Product Backlog (User Stories)

| ID | Module | User Story | Priority |
|----|--------|-----------|----------|
| US-01 | Auth | As a **User**, I want to login with role-based access (RBAC) to access only features for my profile (Admin, Manager, Receptionist, Candidate). | **High** |
| US-02 | Auth | As an **Admin**, I want to create new user accounts with auto-generated passwords so candidates can login. | **High** |
| US-03 | Auth | As a **User**, I must change my temporary password on first login for security. | **High** |
| US-04 | Management | As a **Receptionist**, I want to register physical dossiers in the system for digitizing and integrating into the selection workflow. | **High** |
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

---

## 2. Use Case Diagram

### Actors:
- **Admin** - System administration, user management
- **Manager** - Review applications, make decisions, assign supervisors, view AI insights
- **Receptionist** - Register physical dossiers, manage candidates
- **Candidate** - Submit applications, take quizzes, view results

### System Features:

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    SMART INTERNSHIP & PROJECT MANAGEMENT SYSTEM                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐   │
│  │   AUTHENTICATION    │     │   USER MANAGEMENT   │     │  SUPERVISOR MGMT    │   │
│  │  • Login/Logout     │     │  • Create User      │     │  • Create Supervisor│   │
│  │  • Role-Based Access│     │  • Modify User      │     │  • Modify Supervisor│   │
│  │  • Password Reset   │     │  • Delete User      │     │  • Delete Supervisor│   │
│  │  • Session Management│     │  • Generate Password│     │  • View Capacity   │   │
│  └──────────┬──────────┘     └──────────┬──────────┘     └──────────┬──────────┘   │
│             │                            │                            │              │
│  ┌──────────┴────────────────────────────┴────────────────────────────┴──────────┐  │
│  │                                    ACTORS                                      │  │
│  ├──────────────────┬──────────────────┬──────────────────┬───────────────────────┤  │
│  │      ADMIN       │     MANAGER      │   RECEPTIONIST   │      CANDIDATE       │  │
│  │  • System Admin  │  • Review Apps   │  • Register Dossiers│  • Submit Application│  │
│  │  • Manage Users  │  • Make Decisions│  • Manage Candidates│ • Take Quiz         │  │
│  │  • View Reports  │  • Assign Supervisors│ • View Candidates │ • View Results    │  │
│  │  • AI Insights    │  • AI Rankings    │  • Update Status  │ • Upload CV        │  │
│  └──────────────────┴──────────────────┴──────────────────┴───────────────────────┘  │
│                                                                                     │
│  ┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐   │
│  │   APPLICATION      │     │      QUIZ SYSTEM    │     │      AI MODULE      │   │
│  │  • Submit Online   │     │  • Take Quiz        │     │  • Rank Projects    │   │
│  │  • Register Physical│     │  • Timer (48h)      │     │  • Match Supervisor│   │
│  │  • Update Status   │     │  • Auto-Correct     │     │  • Calculate Score  │   │
│  │  • Assign Project  │     │  • View Results     │     │  • NLP Analysis     │   │
│  │  • Assign Supervisor│     │  • Specialty-Based  │     │  • Recommendations  │   │
│  └─────────────────────┘     └─────────────────────┘     └─────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────┐                                                           │
│  │    NOTIFICATIONS    │                                                           │
│  │  • In-App Alerts    │                                                           │
│  │  • Email Triggers   │                                                           │
│  │  • Status Updates   │                                                           │
│  └─────────────────────┘                                                           │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Class Diagram (Detailed)

### Core Entities:

```java
// User (Base Entity for Authentication)
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue
    private Long id;
    
    private String firstName;
    private String lastName;
    private String email;
    private String passwordHash;
    private String phone;
    private String avatarUrl;
    private boolean active;
    private boolean mustChangePassword;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @ManyToMany
    @JoinTable(name = "user_roles")
    private Set<Role> roles;
}

// Role
@Entity
@Table(name = "roles")
public class Role {
    @Id @GeneratedValue
    private Long id;
    
    @Enumerated
    private RoleName name; // ADMIN, MANAGER, RECEPTIONIST, CANDIDATE
    
    private String description;
}

// Candidate (extends User profile)
@Entity
@Table(name = "candidates")
public class Candidate {
    @Id @GeneratedValue
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String specialty; // Web, Security, Power BI
    private String university;
    private String degree;
    private Integer graduationYear;
    private String skillsTags;
    private String cvFilePath;
    private String photoPath;
    private String bio;
    
    @Enumerated
    private CandidateStatus status; // PENDING, QUIZ_IN_PROGRESS, QUIZ_COMPLETED, ACCEPTED, REJECTED
    
    private LocalDateTime quizCreatedAt;
    private LocalDateTime quizCompletedAt;
    private Integer quizScore;
}

// Supervisor (Project Mentor)
@Entity
@Table(name = "supervisors")
public class Supervisor {
    @Id @GeneratedValue
    private Long id;
    
    @OneToOne
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
    @Id @GeneratedValue
    private Long id;
    
    private String title;
    private String description;
    private String domain;
    private String technologyTags;
    
    @ManyToOne
    @JoinColumn(name = "submitted_by")
    private User submittedBy;
    
    @ManyToOne
    @JoinColumn(name = "supervisor_id")
    private Supervisor supervisor;
    
    @Enumerated
    private ProjectStatus status; // DRAFT, SUBMITTED, APPROVED, REJECTED
    
    private Double aiScore;
}

// Application (Main Lifecycle Entity)
@Entity
@Table(name = "applications")
public class Application {
    @Id @GeneratedValue
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "candidate_id")
    private Candidate candidate;
    
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;
    
    @ManyToOne
    @JoinColumn(name = "supervisor_id")
    private Supervisor supervisor;
    
    @Enumerated
    private ApplicationStatus status;
    
    @Enumerated
    private IntakeMethod intakeMethod; // ONLINE, PHYSICAL
    
    @ManyToOne
    @JoinColumn(name = "registered_by")
    private User registeredBy;
    
    private String managerNotes;
    private LocalDateTime decisionDate;
    private Double aiMatchScore;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// Quiz (Assessment)
@Entity
@Table(name = "quizzes")
public class Quiz {
    @Id @GeneratedValue
    private Long id;
    
    private String title;
    private String description;
    private String specialty; // Web, Security, Power BI
    private int durationMins = 48; // 48 hours
    private int passingScore = 60;
    private int totalMarks = 100;
    private boolean active;
    
    @OneToMany(mappedBy = "quiz")
    private List<QuizQuestion> questions;
}

// QuizQuestion
@Entity
@Table(name = "quiz_questions")
public class QuizQuestion {
    @Id @GeneratedValue
    private Long id;
    
    @ManyToOne
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

// QuizAttempt
@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {
    @Id @GeneratedValue
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;
    
    @ManyToOne
    @JoinColumn(name = "candidate_id")
    private Candidate candidate;
    
    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;
    
    private Integer score;
    private Integer totalMarks;
    private Double percentage;
    private Boolean passed;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime expiresAt; // 48 hours from start
    
    @OneToMany(mappedBy = "attempt")
    private List<QuizAnswer> answers;
}

// Notification
@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue
    private Long id;
    
    @ManyToOne
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
    @Id @GeneratedValue
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
User <|-- Candidate
User <|-- Supervisor
User *-- Role (ManyToMany)
Candidate "1" *-- "0..*" Application
Application "1" -- "1" Quiz
Application "1" -- "0..1" Project
Supervisor "1" -- "0..*" Project
Quiz "1" *-- "0..*" QuizQuestion
Quiz "1" *-- "0..*" QuizAttempt
Candidate "1" *-- "0..1" QuizAttempt
```

---

## 4. Sequence Diagrams

### 4.1 Authentication & Role-Based Redirect

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  User    │     │  Frontend   │     │  AuthContext   │     │  Database    │
└────┬─────┘     └──────┬──────┘     └───────┬────────┘     └───────┬────────┘
     │                  │                    │                     │
     │1: Enter credentials                 │                     │
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
     │                  │8: Read roles & redirect                │
     │                  │<───────────────────│                  │
     │                  │                    │                     │
     │9: Redirect to /dashboard or /reception-panel or /quiz-interface
     │<─────────────────│                  │                     │
     │                  │                    │                     │
```

### 4.2 Logout & Session Clear

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  User    │     │  Sidebar    │     │  AuthContext   │     │ localStorage │
└────┬─────┘     └──────┬──────┘     └───────┬────────┘     └───────┬────────┘
     │                  │                    │                     │
     │1: Click Logout  │                    │                     │
     │─────────────────>│                  │                     │
     │                  │                    │                     │
     │                  │2: logout()        │                     │
     │                  │───────────────────>│                  │
     │                  │                    │                     │
     │                  │3: Clear localStorage (token, user, etc)│
     │                  │<───────────────────│<───────────────────│
     │                  │                    │                     │
     │                  │4: dispatch(LOGOUT)                     │
     │                  │───────────────────>│                  │
     │                  │                    │5: isAuthenticated=false
     │                  │                    │<──────────────────│
     │                  │                    │                     │
     │                  │6: navigate('/login', replace:true)     │
     │                  │───────────────────>│                  │
     │                  │                    │                     │
     │7: Redirect to /login                 │                     │
     │<─────────────────│                  │                     │
```

### 4.3 User Creation & Email Notification

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Admin   │     │  UsersPage   │     │  usersApi      │     │ localStorage │
└────┬─────┘     └──────┬──────┘     └───────┬────────┘     └───────┬────────┘
     │                  │                    │                     │
     │1: Fill form + Click Create            │                     │
     │─────────────────>│                  │                     │
     │                  │                    │                     │
     │                  │2: generateSecurePassword()             │
     │                  │───────────────────>│                  │
     │                  │                    │3: Return temp password
     │                  │<───────────────────│                  │
     │                  │                    │                     │
     │                  │4: usersApi.create(userData)            │
     │                  │───────────────────>│                  │
     │                  │                    │                     │
     │                  │5: Save to localStorage                 │
     │                  │<───────────────────│<───────────────────│
     │                  │                    │                     │
     │                  │6: Show success alert with credentials   │
     │                  │<─────────────────│                  │
     │                  │                    │                     │
     │7: Success message displayed          │                     │
     │<─────────────────│                  │                     │
```

### 4.4 Candidate First Login & Password Reset

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│ Candidate│     │  LoginPage   │     │  AuthContext   │     │ localStorage │
└────┬─────┘     └──────┬──────┘     └───────┬────────┘     └───────┬────────┘
     │                  │                    │                     │
     │1: Enter email + temp password       │                     │
     │─────────────────>│                  │                     │
     │                  │                    │                     │
     │                  │2: Login success, mustChangePassword=true│
     │                  │<───────────────────│                  │
     │                  │                    │                     │
     │                  │3: Redirect to /reset-password          │
     │                  │───────────────────>│                  │
     │                  │                    │                     │
     │4: Show reset password form           │                     │
     │<─────────────────│                  │                     │
     │                  │                    │                     │
     │5: Enter new password│                │                     │
     │─────────────────>│                  │                     │
     │                  │                    │                     │
     │                  │6: resetPassword() │                    │
     │                  │───────────────────>│                  │
     │                  │                    │7: Update localStorage
     │                  │<───────────────────│<───────────────────│
     │                  │                    │                     │
     │                  │8: dispatch(SET_USER)                  │
     │                  │───────────────────>│                  │
     │                  │                    │9: mustChangePassword=false
     │                  │<───────────────────│                  │
     │                  │                    │                     │
     │                  │10: Redirect to /quiz-interface          │
     │                  │<───────────────────│                  │
```

### 4.5 Quiz Taking (48-hour timer)

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│ Candidate│     │QuizInterface│     │  QuizService   │     │  Database    │
└────┬─────┘     └──────┬──────┘     └───────┬────────┘     └───────┬────────┘
     │                  │                    │                     │
     │1: Start Quiz    │                    │                     │
     │─────────────────>│                  │                     │
     │                  │                    │                     │
     │                  │2: Create QuizAttempt with expiresAt     │
     │                  │───────────────────>│                  │
     │                  │                    │3: Save attempt     │
     │                  │                    │───────────────────>│
     │                  │                    │                     │
     │                  │4: Start 48-hour timer                 │
     │                  │<───────────────────│                  │
     │                  │                    │                     │
     │5: Display questions│                │                     │
     │<─────────────────│                  │                     │
     │                  │                    │                     │
     │6: Submit answers│                    │                     │
     │─────────────────>│                  │                     │
     │                  │                    │                     │
     │                  │7: Auto-grade (compare with correctOption)│
     │                  │───────────────────>│                  │
     │                  │                    │8: Calculate score │
     │                  │                    │<───────────────────│
     │                  │                    │                     │
     │                  │9: Update candidate status to QUIZ_COMPLETED│
     │                  │                    │───────────────────>│
     │                  │                    │                     │
     │10: Display results│                │                     │
     │<─────────────────│                  │                     │
```

---

## 5. Business Rules Summary

| Rule ID | Description | Enforcement |
|---------|------------|-------------|
| BR-01 | Any physical application must be scanned and associated with a candidate account created by the receptionist | ApplicationService.createApplication() |
| BR-02 | A candidate cannot access Manager Review if their quiz score is below passing score (60%) | ApplicationService.checkQuizPassed() |
| BR-03 | AI does not make final decisions; it provides a "Confidence Score" to help the Manager | AiService - Ranking only |
| BR-04 | A supervisor cannot manage more than 3 interns simultaneously (CurrentLoad <= 3) | Supervisor.maxInterns = 3 |
| BR-05 | All status changes must trigger an automatic email within 5 minutes maximum | EmailService.sendApplicationStatusUpdate() |
| BR-06 | Quiz must be completed within 48 hours of assignment | QuizTimeLimitInterceptor |
| BR-07 | New users must change their temporary password on first login | mustChangePassword flag |
| BR-08 | Each quiz is specific to a specialty (Web, Security, Power BI) | Quiz.specialty field |

---

## 6. Role-Based Redirect Logic

| Role | Redirect Path | Description |
|------|--------------|-------------|
| mustChangePassword = true | /reset-password | Force password change |
| ROLE_RECEPTIONIST | /reception-panel | Receptionist CRUD panel |
| ROLE_CANDIDATE | /quiz-interface | Quiz taking interface |
| ROLE_ADMIN | /dashboard | Admin dashboard |
| ROLE_MANAGER | /dashboard | Manager dashboard |

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

### Candidates
- GET /api/candidates
- GET /api/candidates/{id}
- PUT /api/candidates/me
- POST /api/candidates/me/cv

### AI
- GET /api/ai/rank-projects
- GET /api/ai/match-supervisor/{id}

### Quiz
- GET /api/quiz
- GET /api/quiz/{id}
- POST /api/quiz/submit
- GET /api/quiz/results

### Notifications
- GET /api/notifications
- GET /api/notifications/unread-count
- PATCH /api/notifications/{id}/read
- PATCH /api/notifications/read-all

### Dashboard
- GET /api/dashboard/manager/stats

---

*Document updated: May 2026*
*SIPMS v2.0 - Smart Internship & Project Management System*