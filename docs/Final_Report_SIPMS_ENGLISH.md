# FINAL PROJECT REPORT

---

# SMART INTERNSHIP & PROJECT MANAGEMENT SYSTEM (SIPMS)

### Smart System for Managing Internships and Projects

---

**University**: Institut International de Technologie - Sfax
**School**: IIT - Institut International de Technologie
**Field**: Computer Engineering
**Academic Year**: 2025-2026

---

**Student**: Ayadi Youssef
**Supervisor**: Rahma Bouaziz
**Company**: Clinisys
**Date**: May 2026

---

<div style="page-break-after: always;"></div>

# TABLE OF CONTENTS

[TABLE OF CONTENTS]

---

<div style="page-break-after: always;"></div>

# CHAPTER 1: GENERAL INTRODUCTION

## 1.1 Project Context

In the current economic context characterized by accelerated digital transformation and increasing competition in the job market, the effective management of internship recruitment processes and academic projects has become a major challenge for organizations. Traditional paper-based manual management methods present numerous limitations: document loss, long processing times, lack of traceability, and inefficiency in evaluating candidate competencies.

The **Smart Internship & Project Management System (SIPMS)** is a full-stack web application designed to digitize and automate the entire internship and academic project management process. This system integrates advanced artificial intelligence functionalities for analyzing and ranking projects submitted by candidates, as well as for intelligent matching between candidates and available supervisors.

## 1.2 Project Objectives

The main objective of this project is to develop a professional web application that allows:

1. **Digitizing the Application Process**: Enabling candidates to submit their applications online, including their CV and project ideas
2. **Automating Evaluation**: Implementing an automated technical quiz system with instant correction to evaluate candidates' technical skills
3. **AI Integration**: Using artificial intelligence algorithms to analyze and rank submitted projects, as well as to suggest the most suitable supervisor for each project
4. **Role-Based Access Control (RBAC)**: Implementing a role-based access system allowing different user types (Admin, Manager, Receptionist, Candidate) to access appropriate functionalities
5. **Automated Notifications**: Triggering automatic in-app and email notifications at each key stage of the selection process

## 1.3 Project Scope

The SIPMS system covers the following functionalities:

- **Authentication Module**: Secure JWT-based connection with role management
- **Application Management**: Online submission and physical registration
- **Evaluation Module**: Timed technical quiz with automatic correction
- **AI Module**: Project ranking and candidate-supervisor matching
- **Decision Module**: Validation workflow with acceptance/rejection
- **Notification Module**: In-app and email notifications

## 1.4 Problem Definition

Academic organizations and companies face several challenges in internship management:

| Identified Problem | SIPMS Solution |
|-------------------|---------------|
| Manual management of physical files | Complete digitization |
| Long processing times | Process automation |
| Lack of traceability | Complete audit logs |
| Subjective evaluation | Standardized quiz + AI |
| Supervisor/project matching difficulty | Matching algorithm |
| Inefficient communication | Automated notifications |

---

<div style="page-break-after: always;"></div>

# CHAPTER 2: REQUIREMENTS ANALYSIS

## 2.1 Current Situation Study

In the traditional internship management system, the process unfolds as follows:

1. **Physical File Reception**: Candidates bring their applications in person to the internship office
2. **Manual Filing**: Receptionists sort and file applications
3. **Paper Evaluation**: Managers evaluate projects manually
4. **Decision by Discussion**: Decisions are made during meetings
5. **Communication by Phone/Email**: Candidates are informed individually

## 2.2 Current System Disadvantages

- **Document Loss**: High risk of loss or misfiling
- **Processing Time**: Average delay of 2-3 weeks
- **Costs**: Storage and personnel expenses
- **No History**: Difficulty consulting old applications
- **Difficult Statistics**: Impossible to generate reports

## 2.3 Requirements Analysis

### 2.3.1 Functional Requirements

| Requirement | Priority | Description |
|-------------|----------|-------------|
| Authentication | High | Secure JWT connection |
| Candidate Registration | High | Online registration form |
| Project Submission | High | Submission interface |
| Technical Quiz | High | Automated evaluation |
| AI Ranking | Medium | Project analysis |
| Supervisor Matching | Medium | Supervisor suggestion |
| Manager Decision | High | Acceptance/Rejection |
| Notifications | Medium | Automatic emails |

### 2.3.2 Non-Functional Requirements

- **Performance**: Response time < 2 seconds
- **Security**: JWT encryption, XSS/SQLi protection
- **Availability**: 99.5% uptime
- **Scalability**: Modular architecture
- **Maintainability**: Documented code, unit tests

## 2.4 Business Rules

| Rule ID | Description |
|---------|-----------|
| BR-01 | Any physical application must be scanned and associated with a candidate account |
| BR-02 | A candidate must pass the quiz (≥60%) before the interview |
| BR-03 | AI does not make final decisions; it provides a confidence score |
| BR-04 | A supervisor cannot manage more than 3 interns simultaneously |
| BR-05 | Every status change triggers an automatic email |

---

<div style="page-break-after: always;"></div>

# CHAPTER 3: TECHNICAL STUDY

## 3.1 Technology Choices

### 3.1.1 Frontend

| Technology | Version | Justification |
|------------|---------|---------------|
| React | 18.x | Modern framework, large community |
| Vite | 5.x | Fast build tool |
| Tailwind CSS | 3.x | Utility-first styling |
| Axios | 1.x | HTTP client |
| React Router | 6.x | Routing |

### 3.1.2 Backend

| Technology | Version | Justification |
|------------|---------|---------------|
| Spring Boot | 3.2.5 | Enterprise Java framework |
| Spring Security | 6.x | Integrated security |
| JWT | 0.12.5 | Stateless authentication |
| MySQL | 8.0 | Relational database |
| JPA/Hibernate | 6.4 | ORM |

### 3.1.3 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (React)                      │
│                 http://localhost:5173                       │
└─────────────────────────┬───────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │    Vite Proxy     │
              │   (Port 5173)    │
              └────────┬───────────┘
                         │
              ┌──────────▼──────────┐
              │   Spring Boot      │
              │   (Port 8080)    │
              └────────┬───────────┘
                         │
              ┌──────────▼──────────┐
              │      MySQL        │
              │   (Port 3306)    │
              └────────────��──────┘
```

## 3.2 UML Diagrams

### 3.2.1 Use Case Diagram

```
┌────────────────────────────────────────────────────────────────┐
│       SMART INTERNSHIP & PROJECT MANAGEMENT SYSTEM         │
├────────────────────────────────────────────────────────────────┤
│                                                          │
│   ┌─────────────────┐                                      │
│   │  Authenticate  │──────┐                               │
│   │   Manage Profile│     │                               │
│   └───────┬───────┘     │                               │
│           │           │ ┌────▼──────┐                     │
│           │           │ │   ADMIN  │                      │
│           │           └──────────┘                     │
│           │                                        │
│   ┌───────▼──────────────────────────┐                │
│   │         CANDIDATE            │                  │
│   └───────┬──────────────────────────┘                │
│           │                                          │
│   ┌───────▼────────────┐                            │
│   │    MANAGER       │                            │
│   │    RECEPTIONIST  │                            │
│   │    AI SYSTEM   │                            │
│   └───────┬─────────┘                            │
│           │                                       │
│   ┌───────▼─────────────────────────────────────┐    │
│   │         APPLICATION & WORKFLOW              │    │
│   │  ┌───────────┐  ┌───────────┐  ┌────┐  │    │
│   │  │ Submit   │  │  Evaluate │  │Decide│  │    │
│   │  │Application│  │  (Quiz)  │  │     │  │    │
│   │  └───────────┘  └───────────┘  └────┘  │    │
│   └─────────────────────────────────────────┘    │
└────────────────────────────────────────────────┘
```

### 3.2.2 Class Diagram (Key Entities)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    User     │       │    Role    │       │  UserRoles  │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id: Long   │◄──M:N───│ id: Long   │       │ user_id   │
│ firstName  │       │ name      │       │ role_id  │
│ lastName   │       │           │       │           │
│ email     │       └───────────┘       └───────────┘
│ password  │
│ roles    │
└────┬─────┘
     │ 1:1
     ▼
┌──────────────┐       ┌───────────��─��┐
│  Candidate │       │ Supervisor │
├──────────────┤       ├──────────────┤
│ id: Long   │       │ id: Long   │
│ user      │       │ user      │
│ university│       │ fullName  │
│ degree   │       │ department│
│ skills   │       │ expertise │
│ cvPath   │       │ maxInterns│
└────┬─────┘       │ current   │
     │ 1:*        └──────────┘
     ▼
┌───────────────────────────────────┐
│       Application                 │
├───────────────────────────────┤
│ id: Long                  │
│ candidate: Candidate     │
│ project: Project         │
│ supervisor: Supervisor  │
│ status: Enum            │
│ intakeMethod: Enum      │
│ aiMatchScore: Double    │
└───────────────────────┘
```

### 3.2.3 Sequence Diagrams

#### Sequence 1: Authentication

```
┌──────────┐      ┌────────────┐      ┌─────────────┐
│ Candidate │      │  System   │      │  Database │
└────┬─────┘      └─────┬──────┘      └──────┬──────┘
     │                  │                    │
     │1: Submit credentials│                  │
     ├────────────────────>│                    │
     │                  │                    │
     │                  │2: Verify credentials│
     │                  ├─────────────────────>│
     │                  │                    │
     │                  │3: Return user + role│
     │                  ├<────────────────────│
     │                  │                    │
     │4: JWT Token      │                    │
     ├<─────────────────┤                    │
```

#### Sequence 2: Application & AI Evaluation

```
┌──────────┐      ┌────────────┐      ┌─────────────┐    ┌─────────┐
│ Candidate │      │Application│      │ Notification│   │   AI    │
│          │      │ Service   │      │  Service   │    │ Engine  │
└────┬─────┘      └─────┬──────┘      └──────┬──────┘    └────┬───┘
     │                  │                     │                │
     │1: Submit project idea│                  │
     ├───────────────────>│                     │
     │                  │                     │
     │                  │2: Validate + Save│
     │                  ├───────────────────>│
     │                  │                     │
     │                  │3: Create in-app notification │
     │                  ├──────────────────>│
     │                  │                     │
     │                  │4: Trigger AI analysis │
     │                  ├────────────────────────────────>│
     │                  │                     │    │
     │                  │                     │    │
     │                  │5: Calculate relevance   │    │
     │                  │<═════════════════════════════    │
     │                  │                     │         │
     │6: Update with AI score│                 │         │
     ├<───────────────────┤                     │
```

#### Sequence 3: Quiz & Auto-Grading

```
┌──────────┐      ┌────────────┐      ┌─────────────┐
│ Candidate │      │QuizService │      │ Application│
└────┬─────┘      └─────┬──────┘      └──────┬──────┘
     │                  │                     │
     │1: Start quiz   │                     │
     ├────────────────>│                     │
     │                  │                     │
     │                  │2: Start timer    │
     │                  │3: Get questions│
     │                  ├────────────────>│
     │                  │                     │
     │4: Display quiz│                     │
     ├<────────────────┤                     │
     │                  │                     │
     │5: Submit answers│                    │
     ├────────────────>│                     │
     │                  │                     │
     │                  │6: Auto-grade   │
     │                  │7: Calculate   │
     │                  │                │              │
     │                  │8: Save attempt│               │
     │                  ├────────────────────────────────>│
     │                  │                     │
     │                  │9: Update to QUIZ_COMPLETED │
     │                  ├────────────────────────────────>│
     │                  │                     │
     │10: Show result │                     │
     ├<────────────────┤                     │
```

---

<div style="page-break-after: always;"></div>

# CHAPTER 4: IMPLEMENTATION

## 4.1 Project Structure

```
SIPMS/
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/project/sipms/
│   │   ├── controller/       # REST APIs
│   │   ├── service/         # Business logic
│   │   ├── repository/     # Data access
│   │   ├── entity/         # JPA entities
│   │   ├── dto/          # Data transfer objects
│   │   ├── security/      # JWT & auth
│   │   ├── ai/           # AI algorithms
│   │   └── common/        # Utilities
│   └── src/main/resources/
│       └── application.properties
│
├── frontend/                  # React Application
│   ├── src/
│   │   ├── pages/         # Dashboard pages
│   │   ├── components/    # Reusable components
│   │   ├── api/         # Axios config
│   │   ├── context/     # React contexts
│   │   └── layouts/     # Layout components
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── schema.sql          # Database schema
│   └── data.sql          # Sample data
│
└── docs/                 # Documentation
```

## 4.2 Development Phases

### Phase 1: Configuration & Infrastructure (Week 1-2)

- Development environment configuration
- Spring Boot project creation with dependencies
- React setup with Vite and Tailwind
- MySQL and JPA configuration
- JWT authentication setup

### Phase 2: User Management (Week 3-4)

- Registration and login
- Role management (Admin, Manager, Receptionist, Candidate)
- User profile
- JWT token management

### Phase 3: Application Module (Week 5-6)

- Online submission
- Physical registration by receptionist
- CV and document upload
- Application status management

### Phase 4: Quiz Module (Week 7-8)

- Quiz creation with questions
- Timer functionality
- Auto-correction
- Score calculation

### Phase 5: Artificial Intelligence (Week 9-10)

- Analysis of submitted projects
- Relevance scoring
- Candidate-supervisor matching
- Automatic ranking

### Phase 6: Notifications (Week 11)

- In-app notifications
- Transactional emails
- Automatic reminders

### Phase 7: Testing & Deployment (Week 12)

- Unit tests
- Integration tests
- Bug fixing
- Deployment preparation

## 4.3 Database Design

### Key Tables

#### Table: users

| Column | Type | Description |
|--------|------|------------|
| id | BIGINT | Primary key |
| first_name | VARCHAR(100) | First name |
| last_name | VARCHAR(100) | Last name |
| email | VARCHAR(255) | Unique email |
| password_hash | VARCHAR(255) | Encrypted password |
| phone | VARCHAR(20) | Phone |
| avatar_url | VARCHAR(500) | Profile photo URL |
| active | BOOLEAN | Active status |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Modification date |

#### Table: applications

| Column | Type | Description |
|--------|------|------------|
| id | BIGINT | Primary key |
| candidate_id | BIGINT | Candidate reference |
| project_id | BIGINT | Project reference |
| supervisor_id | BIGINT | Supervisor reference |
| status | ENUM | Workflow status |
| intake_method | ENUM | ONLINE/PHYSICAL |
| registered_by | BIGINT | Receptionist |
| manager_notes | TEXT | Decision notes |
| decision_date | TIMESTAMP | Decision date |
| ai_match_score | DOUBLE | AI score |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Modification date |

#### Application Status Workflow

```
PENDING → UNDER_REVIEW → QUIZ_PENDING → QUIZ_COMPLETED 
         → AI_EVALUATING → MANAGER_REVIEW → ACCEPTED/REJECTED
```

---

<div style="page-break-after: always;"></div>

# CHAPTER 5: USER INTERFACE

## 5.1 Design System

### Color Palette

| Color | Hex Code | Usage |
|-------|---------|-------|
| Primary | #4F46E3 | Primary buttons, links |
| Primary Light | #818CF8 | Hover states |
| Primary Dark | #3730A3 | Active states |
| Success | #10B981 | Accepted status |
| Warning | #F59E0B | Warnings |
| Error | #EF4444 | Errors, rejected |
| Surface 50 | #F9FAFB | Background |
| Surface 100 | #F3F4F6 | Cards |
| Surface 200 | #E5E7EB | Borders |
| Surface 500 | #6B7280 | Secondary text |
| Surface 900 | #111827 | Primary text |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Inter | 32px | 700 |
| H2 | Inter | 24px | 700 |
| H3 | Inter | 20px | 600 |
| Body | Inter | 14px | 400 |
| Caption | Inter | 12px | 400 |

## 5.2 Main Screens

### 5.2.1 Login Page

The login screen includes:
- IIT Logo
- Email/password form
- "Sign In" button
- "Create Account" link
- Clean design with gradient background

### 5.2.2 Admin Dashboard

The admin dashboard includes:
- **Sidebar**: Main navigation
- **Statistics**: Key metric cards
- **Data Table**: Application list
- **Filters**: By status, date
- **Actions**: Edit, assign supervisor, decide

### 5.2.3 Applications Page

Features:
- Paginated application list
- Candidate and project details
- Status change
- Supervisor assignment
- Manager notes
- AI score display

### 5.2.4 Quiz Page

The quiz interface includes:
- Visible timer
- Multiple choice questions (A, B, C, D)
- Question navigation
- Automatic submission at end
- Immediate result with score

### 5.2.5 AI Insights Page

This page displays:
- Projects ranked by AI score
- Supervisor/candidate matching
- Distribution charts
- Match suggestions

## 5.3 Reusable UI Components

| Component | Description | States |
|-----------|-------------|-------|
| Button | Action button | default, hover, active, disabled |
| Input | Input field | default, focus, error, disabled |
| Select | Dropdown list | default, open, selected |
| Badge | Status badge | info, success, warning, error |
| Table | Data table | default, loading, empty |
| Modal | Popup window | open, closed |
| Card | Info card | default, hover |
| StatCard | Statistics card | default |
| Loading | Loading indicator | loading |

---

<div style="page-break-after: always;"></div>

# CHAPTER 6: CHALLENGES AND SOLUTIONS

## 6.1 Technical Challenges

### Challenge 1: Secure Authentication

**Problem**: Implement secure authentication without server session.

**Solution**:
- Use of JWT (JSON Web Tokens)
- Token storage in localStorage
- Axios interceptors for automatic attachment
- Automatic token renewal

### Challenge 2: File Upload

**Problem**: Securely manage file uploads (CV, photos).

**Solution**:
- Local storage service with configurable path
- File type validation
- Size limitation (10MB max)
- Unique file name generation

### Challenge 3: Real-Time Quiz

**Problem**: Implement precise timer and prevent cheating.

**Solution**:
- Server-side and client-side timer
- Time calculation at submission moment
- Response validation by time
- Score = 0 if time exceeded

### Challenge 4: Local AI

**Problem**: Implement AI functionalities without external API.

**Solution**:
- Local TF-IDF scoring algorithm
- Text similarity comparison
- Expertise tag matching
- No external dependencies

### Challenge 5: Email Notifications

**Problem**: Send transactional emails.

**Solution**:
- Spring Mail integration
- Email templates
- Asynchronous sending (@Async)
- Flexible SMTP configuration

## 6.2 Business Challenges

### Challenge 6: Complex Workflow

**Problem**: Manage complex status transitions with validation.

**Solution**:
- Status enum with allowed transitions
- validateStatusTransition() method
- Clear business exceptions
- Decision audit logs

### Challenge 7: Supervisor Capacity

**Problem**: Limit the number of interns per supervisor.

**Solution**:
- maxInterns field in Supervisor entity
- Verification before assignment
- Exception if capacity reached
- Automatic update

---

<div style="page-break-after: always;"></div>

# CHAPTER 7: CONCLUSION

## 7.1 Project Summary

The **Smart Internship & Project Management System (SIPMS)** is a complete web application that allows:

1. **Digitizing** the entire internship management process
2. **Automating** technical evaluations by quiz
3. **Integrating** artificial intelligence functionalities
4. **Securing** access by JWT authentication and RBAC
5. **Notifying** users automatically by email and in-app

## 7.2 Results Obtained

| Module | Functionality | Status |
|--------|--------------|--------|
| Auth | JWT Connection | ✅ |
| Management | User CRUD | ✅ |
| Application | Online Submission | ✅ |
| Reception | Physical Files | ✅ |
| Quiz | Auto Evaluation | ✅ |
| AI | Project Ranking | ✅ |
| AI | Supervisor Matching | ✅ |
| Notifications | In-App + Email | ✅ |
| Dashboard | Statistics | ✅ |

## 7.3 Future Improvements

Several features can be added:

1. **Video Interview**: Video conferencing integration
2. **Calendar**: Interview scheduling
3. **Reporting**: PDF report generation
4. **Multi-lingual**: Arabic/English/French support
5. **Mobile App**: Native mobile application
6. **Public API**: For external integration

## 7.4 Lessons Learned

This project allowed:
- Mastering full-stack development with Spring Boot and React
- Understanding web security issues
- Implementing simple AI algorithms
- Working in agile methodologies
- Technically documenting a project

---

# APPENDICES

## Appendix A: Selected Source Code

### A.1 Application Configuration

```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/sipms_db
spring.datasource.username=root
spring.datasource.password=12345

app.jwt.secret=SIPMS_Super_Secret_Key_2024
app.jwt.expiration-ms=86400000

app.cors.allowed-origins=http://localhost:5173
```

### A.2 Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/ai/**").hasAnyRole("ADMIN", "MANAGER")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

---

## Appendix B: Glossary

| Term | Definition |
|------|-----------|
| JWT | JSON Web Token - Standard for stateless authentication |
| RBAC | Role-Based Access Control |
| ORM | Object-Relational Mapping |
| API | Application Programming Interface |
| TF-IDF | Term Frequency-Inverse Document Frequency |
| Quiz | Online technical assessment |

---

## Appendix C: References

1. Spring Boot Documentation - https://spring.io/projects/spring-boot
2. React Documentation - https://react.dev
3. JWT Documentation - https://jwt.io
4. Tailwind CSS - https://tailwindcss.com
5. Hibernate ORM - https://hibernate.org/orm

---

**Document prepared by**: Ayadi Youssef
**Date**: May 2026
**School**: IIT - Institut International de Technologie Sfax

---

*End of Report*