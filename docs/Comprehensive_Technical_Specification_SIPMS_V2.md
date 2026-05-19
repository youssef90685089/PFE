# COMPREHENSIVE TECHNICAL SPECIFICATION

# SMART INTERNSHIP & PROJECT MANAGEMENT SYSTEM (SIPMS) V2.0

## Professional Recruitment Management Platform with AI Integration

---

**Version**: 2.0
**Student**: Ayadi Youssef  
**Supervisor**: Rahma Bouaziz  
**Company**: Clinisys  
**Academic Year**: 2025-2026  
**Date**: May 2026

---

<div style="page-break-after: always;"></div>

# TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Functional Requirements](#3-functional-requirements)
4. [Use Case Diagram](#4-use-case-diagram)
5. [Class Diagram](#5-class-diagram)
6. [Sequence Diagrams](#6-sequence-diagrams)
7. [Product Backlog](#7-product-backlog)
8. [Database Design](#8-database-design)
9. [Technology Stack Recommendation](#9-technology-stack-recommendation)
10. [UIUX-Pages-Design](#10-uiux-pages-design)
11. [Business Rules](#11-business-rules)
12. [Conclusions-and-Recommendations](#12-conclusions-and-recommendations)

---

<div style="page-break-after: always;"></div>

# 1. EXECUTIVE SUMMARY

## 1.1 Project Vision

The **Smart Internship & Project Management System (SIPMS) V2.0** is a next-generation professional recruitment management platform designed to transform the traditional internship and project placement process. Building upon the foundation of version 1.0, this enhanced system introduces sophisticated AI-powered matching capabilities, comprehensive administrative controls, and advanced analytics.

## 1.2 Key Objectives

| Objective | Description | Priority |
|-----------|-------------|-----------|
| **AI-Powered Matching** | Intelligent matching between candidates, projects, and supervisors based on Skills, Experience, Education | HIGH |
| **Professional Admin Dashboard** | Comprehensive administrative controls for all system operations | HIGH |
| **Automated Quiz System** | Timed technical assessments with auto-grading and instant results | HIGH |
| **Real-time Notifications** | Instant notifications for all system events | HIGH |
| **Advanced Analytics** | Charts, statistics, and data-driven insights | MEDIUM |

## 1.3 Current System Analysis

### Existing Features (V1.0):

- ✅ User Authentication with JWT
- ✅ Role-Based Access Control (Admin, Manager, Receptionist, Candidate)
- ✅ Basic Application Management
- ✅ Quiz System with Auto-Grading
- ✅ AI Project Ranking
- ✅ In-App Notifications

### New Features to Add (V2.0):

| Feature | Current Status | Required Action |
|--------|----------------|-----------------|
| Advanced Admin Dashboard | ❌ Missing | Build Complete |
| CV Upload (PDF/DOCX) | ⚠️ Basic | Enhance |
| AI Candidate Matching | ⚠️ Basic | Advanced |
| Notification System | ⚠️ Basic | Complete |
| Reports & Analytics | ❌ Missing | Build Complete |
| Candidate Progress Tracking | ❌ Missing | Build Complete |
| System Settings | ❌ Missing | Build Complete |

---

<div style="page-break-after: always;"></div>

# 2. SYSTEM OVERVIEW

## 2.1 System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        SIPMS V2.0 ARCHITECTURE                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────���─────────────────────────────────────────────────────────────┐    │
│  │                         CLIENT LAYER                                  │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐   │    │
│  │  │   Admin Web     │  │  Candidate Web   │  │ Mobile API  │   │    │
│  │  │  (React/Vue)    │  │   (React/Vue)   │  │  (REST)    │   │    │
│  │  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘   │    │
│  └───────────┼──────────────────────┼────────────────────┼───────────┘    │
│              │                      │                     │                   │
│  ┌───────────▼────────────────────▼────────────────────▼───────────┐    │
│  │                       API GATEWAY / PROXY                          │    │
│  │                    (Nginx / Spring Gateway)                      │    │
│  └───────────────────────────┬─────────────────────────────────────────────┘    │
│                              │                                          │
│  ┌───────────────────────────▼───────────────────────────────────────┐    │
│  │                      BACKEND LAYER                              │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────┐ │    │
│  │  │ Auth API   │  │ Admin API  │  │ Quiz API   │  │ AI API │ │    │
│  │  │  (JWT)    │  │  (CRU D)  │  │ (Timer)  │  │(ML)    │ │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────┘ │    │
│  └───────────────────────────┬─────────────────────────────────────────────┘    │
│                              │                                          │
│  ┌───────────────────────────▼───────────────────────────────────────┐    │
│  │                    DATABASE LAYER                               │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────┐ │    │
│  │  │   MySQL     │  │   Redis    │  │   S3/Blob │  │Elastic │    │
│  │  │ (Primary)   │  │ (Cache)    │  │ (Files)   │  │(Search)│    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────┘ │    │
└────────────────────────────────���─���───────────────────────────────────────────┘
```

## 2.2 System Components

| Component | Description | Responsibility |
|-----------|-------------|----------------|
| **Auth Module** | JWT Authentication | Login, Registration, Token Management |
| **User Management** | User CRUD Operations | Admin, Supervisor, Candidate management |
| **CV Management** | Document Upload/Download | PDF/DOCX processing |
| **Quiz Engine** | Timed Assessments | Question Bank, Timer, Auto-Grading |
| **AI Matching Engine** | ML-based Matching | Candidate-Project-Supervisor matching |
| **Notification Service** | Real-time Notifications | Email, In-App, Push notifications |
| **Analytics Engine** | Reports & Charts | Statistics, Reports generation |
| **Application Workflow** | Status Management | PENDING → ACCEPTED/REJECTED |

---

<div style="page-break-after: always;"></div>

# 3. FUNCTIONAL REQUIREMENTS

## 3.1 User Roles

| Role | Abbreviation | Description | Access Level |
|------|-------------|-------------|--------------|
| **Administrator** | ADMIN | System administrator | Full Access |
| **Manager** | MANAGER | Department manager | Partial Admin |
| **Supervisor** | SUPERVISOR | Project mentor | Limited |
| **Candidate** | CANDIDATE | Job seeker | Self-Service |

## 3.2 Admin Dashboard Requirements

### 3.2.1 Candidate Management

| Feature | Description |
|---------|-------------|
| View All Candidates | Datagrid with pagination |
| Search Candidates | By name, email, skills |
| Filter Candidates | By status, date, quiz score |
| Edit Candidate | Update profile |
| Delete Candidate | Soft delete |
| Export Candidates | CSV/Excel export |
| View Candidate Details | Full profile view |
| View Quiz History | All attempts |
| Download CV | PDF viewer |

### 3.2.2 Supervisor Management

| Feature | Description |
|---------|-------------|
| Add Supervisor | Create new supervisor |
| Edit Supervisor | Update details |
| Delete Supervisor | Soft delete |
| View Projects | Assigned projects |
| View Capacity | Current/Max interns |
| Track Performance | Intern success rate |
| Expertise Tags | Skills/Technologies |

### 3.2.3 Project Management

| Feature | Description |
|---------|-------------|
| Create Project | New project form |
| Edit Project | Update details |
| Delete Project | Archive project |
| Assign to Candidate | Link candidate |
| Assign Supervisor | Link supervisor |
| AI Analysis | Get AI recommendations |
| Project Status | DRAFT, SUBMITTED, APPROVED, REJECTED |

### 3.2.4 Quiz Management

| Feature | Description |
|---------|-------------|
| Create Quiz | Question builder |
| Edit Quiz | Update questions |
| Delete Quiz | Remove quiz |
| View Results | All attempts |
| Export Results | CSV/Excel |
| Statistics | Pass/Fail rates |

### 3.2.5 Application Management

| Feature | Description |
|---------|-------------|
| View All | Filterable list |
| Approve | Accept candidate |
| Reject | Decline candidate |
| Pending Interview | Schedule interview |
| Assign Project | Link project |
| Assign Supervisor | Link mentor |
| Track Progress | Status timeline |
| Bulk Actions | Batch processing |

### 3.2.6 System Settings

| Feature | Description |
|---------|-------------|
| General Settings | Site configuration |
| Email Settings | SMTP configuration |
| Quiz Settings | Timer defaults |
| Role Management | Permissions |
| Audit Logs | Activity logs |

## 3.3 Candidate Portal Requirements

### 3.3.1 CV Submission

| Feature | Description |
|---------|-------------|
| Register Account | Sign up form |
| Upload CV | PDF/DOCX upload |
| Edit Profile | Personal info |
| Submit Application | Fill application |
| Take Quiz | Start assessment |
| View Results | Quiz scores |
| Track Status | Application status |
| Notifications | Alerts |

## 3.4 AI Matching System Requirements

### 3.4.1 Matching Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **Skills Match** | 30% | Technical skills overlap |
| **Experience** | 20% | Years of experience |
| **Education** | 15% | Degree level |
| **Technologies** | 15% | Tech stack match |
| **Career Interests** | 10% | Career goals alignment |
| **Availability** | 10% | Supervisor capacity |

### 3.4.2 Matching Output

| Output | Description |
|--------|-------------|
| Best Project | Top 1-3 recommended projects |
| Best Supervisor | Top 1-3 recommended supervisors |
| Match Score | 0-100% similarity |
| Reasoning | Human-readable explanation |

## 3.5 Quiz System Requirements

### 3.5.1 Quiz Configuration

| Feature | Description |
|---------|-------------|
| Question Types | Multiple choice, True/False |
| Time Limit | Configurable (15-120 mins) |
| Passing Score | Configurable (50-80%) |
| Randomize | Shuffle questions |
| Attempts | Limited retries |

### 3.5.2 Quiz Results

| Result | Status |
|--------|--------|
| **ACCEPTED** | Score ≥ Passing Score |
| **REJECTED** | Score < Passing Score |
| **PENDING INTERVIEW** | Score ≥ Passing Score + Admin review |

## 3.6 Notification System Requirements

### 3.6.1 Admin Notifications

| Event | Recipient | Channel |
|-------|-----------|---------|
| New CV Submitted | Admin | In-App + Email |
| Candidate Registered | Admin | In-App |
| Quiz Completed | Admin | In-App |
| Application Updated | Admin | In-App |
| Project Assigned | Admin | In-App |

### 3.6.2 Candidate Notifications

| Event | Recipient | Channel |
|-------|-----------|---------|
| Application Accepted | Candidate | In-App + Email |
| Application Rejected | Candidate | In-App + Email |
| Pending Interview | Candidate | In-App + Email |
| Quiz Available | Candidate | In-App + Email |
| Project Assigned | Candidate | In-App + Email |
| Supervisor Assigned | Candidate | In-App + Email |

---

<div style="page-break-after: always;"></div>

# 4. USE CASE DIAGRAM

## 4.1 Complete Use Case Diagram

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                    SIPMS V2.0 - COMPLETE USE CASE DIAGRAM                      │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        ACTORS                                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │  ADMIN   │  │SUPERVISOR │  │ CANDIDATE │  │    AI    │  │MANAGER   │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    USE CASES - ADMIN MODULE                              │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐ │   │
│  │  │  Manage     │ │  Manage     │ │  Manage     │ │  Manage   │ │   │
│  │  │ Candidates │ │Supervisors │ │  Projects │ │ Quizzes  │ │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘ │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐  │   │
│  │  │  Approve  │ │  View      │ │  Generate  │ │  System   │  │   │
���  ��  │ Applic.   │ │ Statistics│ │  Reports   │ │ Settings │ │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                   USE CASES - CANDIDATE MODULE                         │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐  │   │
│  │  │   Register  │ │  Submit CV │ │  Take Quiz │ │  View     │  │   │
│  │  │  Account   │ │ Application│ │  Test    │ │ Status    │  │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘  │   │
│  │  ┌──────────────┐ ┌──────────────┐                               │   │
│  │  │  Edit      │ │  Receive    │                               │   │
│  │  │  Profile  │ │  Notif.     │                               │   │
│  │  └──────────────┘ └──────────────┘                               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      USE CASES - AI SYSTEM                              │   │
│  │  ┌───────────────────────────┐ ┌─────────────────────────────┐        │   │
│  │  │   Analyze CV & Match     │ │   Recommend Best Project    │        │   │
│  │  │   to Project/Supervisor │ │   to Candidate           │        │   │
│  │  └───────────────────────────┘ └─────────────────────────────┘        │   │
│  │  ┌───────────────────────────┐ ┌─────────────────────────────┐                   │   │
│  │  │   Calculate Match    │ │   Generate AI           │                   │   │
│  │  │   Score             │ │   Insights            │                   │   │
│  │  └───────────────────────────┘ └─────────────────────────────┘                   │   │
│  └──────────────────────────────────────────────────────────────────────────────┘       │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Use Case Descriptions

### UC-001: Admin Login
- **Actor**: Admin
- **Pre-condition**: Valid credentials
- **Post-condition**: Authenticated session
- **Flow**: Enter credentials → Verify → Create JWT → Redirect to Dashboard

### UC-002: Manage Candidates
- **Actor**: Admin
- **Pre-condition**: Admin authenticated
- **Post-condition**: CRUD operations completed
- **Flow**: View List → Add/Edit/Delete → Save → Notify

### UC-003: Submit CV
- **Actor**: Candidate
- **Pre-condition**: Candidate authenticated
- **Post-condition**: CV uploaded and parsed
- **Flow**: Upload PDF/DOCX → Parse → Store → AI Analyze → Notify Admin

### UC-004: AI Match
- **Actor**: System (Automatic)
- **Pre-condition**: CV submitted
- **Post-condition**: Matching scores generated
- **Flow**: Analyze CV → Compare with Projects → Calculate Scores → Rank → Display

### UC-005: Take Quiz
- **Actor**: Candidate
- **Pre-condition**: Quiz assigned
- **Post-condition**: Quiz completed and graded
- **Flow**: Start Quiz → Timer → Answer Questions → Auto-Grade → Calculate Score → Update Status

### UC-006: Approve/Reject Application
- **Actor**: Admin
- **Pre-condition**: Application complete
- **Post-condition**: Status updated
- **Flow**: Review Application → Evaluate → Decide → Update → Notify Candidate

---

<div style="page-break-after: always;"></div>

# 5. CLASS DIAGRAM

## 5.1 Core Entities

### 5.1.1 User Entity
```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: Long {PK}                                                         │
│ - firstName: String {not null}                                           │
│ - lastName: String {not null}                                           │
│ - email: String {unique, not null}                                       │
│ - passwordHash: String {not null}                                       │
│ - phone: String                                                         │
│ - avatarUrl: String                                                     │
│ - active: Boolean {default=true}                                         │
│ - createdAt: LocalDateTime                                              │
│ - updatedAt: LocalDateTime                                              │
├─────────────────────────────────────────────────────────────────────────┤
│ + login(): AuthResponse                                                 │
│ + logout(): void                                                       │
│ + updateProfile(UserDto): User                                          │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:1
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             CANDIDATE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: Long {PK}                                                         │
│ - userId: Long {FK}                                                    │
│ - university: String                                                  │
│ - degree: String                                                      │
│ - graduationYear: Integer                                           │
│ - skillsTags: String (CSV)                                            │
│ - experience: Integer                                                │
│ - cvFilePath: String                                                  │
│ - photoPath: String                                                  │
│ - bio: String                                                        │
│ - careerInterests: String                                            │
│ - createdAt: LocalDateTime                                          │
│ - updatedAt: LocalDateTime                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ + submitApplication(): Application                                     │
│ + uploadCV(File): String                                               │
│ + takeQuiz(Quiz): QuizAttempt                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.1.2 Supervisor Entity
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SUPERVISOR                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: Long {PK}                                                         │
│ - userId: Long {FK}                                                    │
│ - fullName: String {not null}                                           │
│ - email: String {unique, not null}                                     │
│ - department: String                                                 │
│ - expertiseTags: String (CSV)                                          │
│ - maxInterns: Integer {default=3}                                        │
│ - currentInterns: Integer {default=0}                                      │
│ - bio: String                                                        │
│ - active: Boolean {default=true}                                         │
│ - createdAt: LocalDateTime                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ + assignIntern(Candidate): void                                         │
│ + checkCapacity(): Boolean                                            │
│ + getPerformance(): Double                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.1.3 Project Entity
```
┌─────────────────────────────────────────────────────────────────────────┐
│                              PROJECT                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: Long {PK}                                                         │
│ - title: String {not null}                                            │
│ - description: String                                               │
│ - domain: String                                                    │
│ - technologyTags: String (CSV)                                       │
│ - requiredSkills: String (CSV)                                       │
│ - submittedBy: User {FK}                                            │
│ - supervisorId: Long {FK}                                           │
│ - status: ProjectStatus (DRAFT, SUBMITTED, APPROVED, REJECTED)        │
│ - aiScore: Double                                                    │
│ - createdAt: LocalDateTime                                          │
│ - updatedAt: LocalDateTime                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ + submit(): void                                                     │
│ + assignSupervisor(Supervisor): void                                │
│ + getAIRecommendations(List): List<AIResult>                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.1.4 Application Entity
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: Long {PK}                                                         │
│ - candidateId: Long {FK}                                               │
│ - projectId: Long {FK}                                               │
│ - supervisorId: Long {FK}                                          │
│ - status: ApplicationStatus (PENDING, UNDER_REVIEW, QUIZ_PENDING,   │
│   QUIZ_COMPLETED, AI_EVALUATING, MANAGER_REVIEW, ACCEPTED, REJECTED)│
│ - intakeMethod: IntakeMethod (ONLINE, PHYSICAL)                          │
│ - managerNotes: String                                                │
│ - decisionDate: LocalDateTime                                      │
│ - aiMatchScore: Double                                              │
│ - interviewDate: LocalDateTime                                     │
│ - createdAt: LocalDateTime                                         │
│ - updatedAt: LocalDateTime                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ + updateStatus(): Application                                       │
│ + assignSupervisor(): void                                          │
│ + addNotes(): void                                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.1.5 Quiz Entity
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                QUIZ                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: Long {PK}                                                         │
│ - title: String                                                     │
│ - description: String                                              │
│ - durationMins: Integer {default=30}                                 │
│ - passingScore: Integer {default=60}                                │
│ - totalMarks: Integer                                               │
│ - active: Boolean                                                  │
│ - questions: List<QuizQuestion>                                    │
│ - createdBy: User {FK}                                             │
│ - createdAt: LocalDateTime                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ + startQuiz(): void                                                 │
│ + autoGrade(List<Answer>): QuizResult                               │
│ + calculateScore(): Integer                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.1.6 Notification Entity
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           NOTIFICATION                                │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: Long {PK}                                                         │
│ - userId: Long {FK}                                                    │
│ - title: String                                                     │
│ - message: String                                                   │
│ - type: NotificationType (INFO, SUCCESS, WARNING, ERROR)            │
│ - isRead: Boolean {default=false}                                  │
│ - link: String                                                     │
│ - createdAt: LocalDateTime                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ + markAsRead(): void                                               │
│ + sendEmail(): void                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

## 5.2 Entity Relationships

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                          ENTITY RELATIONSHIPS                                │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    USER (1)◄──────(1) CANDIDATE (1)◄──────(0..*) APPLICATION             │
│       │                        │                            │                       │
│       │                        │                            │                       │
│    (1)│                        │ (1)                       │ (0..1)              │
│       ▼                        ▼                            ▼                │
│   SUPERVISOR (1)◄───────────(0..*) PROJECT (1)◄────────────(0..*) QUIZ             │
│       │                        │                            │                       │
│       │                        │                            │                       │
│       └──────────(0..*)───────┘                            │                       │
│               APPLICATION                               │ (0..*)             │
│                   │                              QUIZ_ATTEMPT ◄──────────┘
│                   │ (1)
│                   ▼
│            NOTIFICATION (0..*)──► USER
│
└─────────────────────────────────────────────────────────��──────────────────────┘
```

---

<div style="page-break-after: always;"></div>

# 6. SEQUENCE DIAGRAMS

## 6.1 Sequence 1: Candidate Submits CV

```
┌──────────┐      ┌────────────┐      ┌─────────────┐    ┌─────────┐    ┌──────────┐
│Candidate │      │  Candidate │      │  FileService│    │   AI     │    │Notification│
│          │      │  Service   │      │             │    │ Service  │    │ Service   │
└────┬─────┘      └─────┬──────┘      └──────┬──────┘    └────┬───┘    └────┬───┘
     │                  │                    │                │            │
     │1: Upload CV (PDF/DOCX)            │                │            │
     │─────────────────>│                │                │            │
     │                  │                    │                │            │
     │                  │2: Validate file type/size│         │            │
     │                  │<─────────────────>│           │            │
     │                  │                    │                │            │
     │                  │3: Store file locally   │           │            │
     │                  │─────────────────────>│           │            │
     │                  │                    │                │            │
     │                  │4: Return file path │            │            │
     │                  │<───────────────────│             │            │
     │                  │                    │                │            │
     │                  │5: Update candidate CV│              │            │
     │                  │<───────────────────>│            │            │
     │                  │                    │                │            │
     │                  │6: Trigger AI analysis│              │            │
     │                  │────────────────────────>│            │            │
     │                  │                    │    │        │            │
     │                  │                    │    │        │            │
     │                  │7: Parse CV & Extract Skills│       │            │
     │                  │<─────────────────────────────────│            │
     │                  │                    │    │        │            │
     │                  │                    │    │        │            │
     │                  │8: Calculate matching scores │      │            │
     │                  │<─────────────────────────────────│            │
     │                  │                    │                │            │
     │                  │9: Notify Admin    │              │            │
     │                  │───────────────────────────────────────>│            │
     │                  │                    │                │            │
     │10: CV Submitted Confirmation│
     │<───────────────────│
```

## 6.2 Sequence 2: AI Matches Project and Supervisor

```
┌──────────┐      ┌────────────┐      ┌─────────────┐    ┌─────────┐
│ Admin    │      │ Application│      │  Candidate │    │   AI   │
│          │      │  Service   │      │  Service   │    │ Engine │
└────┬─────┘      └─────┬──────┘      └──────┬──────┘    └────┬───┘
     │                  │                    │                │
     │                  │                    │1: NewCandidate │ 
     │                  │                    │  registered   │
     │                  │                    │<───────────────┤
     │                  │                    │                │
     │1: View pending candidates│                │                │
     │<───────────────────│                    │                │
     │                  │                    │                │
     │2: Request AI Match│                    │                │
     │────────────────────────>│                    │                │
     │                  │                    │                │
     │                  │3: Get candidate profile│           │
     │                  │──────────────────────────────────────>│
     │                  │                    │                │
     │                  │                    │                │
     │                  │4: Get available projects│          │
     │                  │──────────────────────────────────────>│
     │                  │                    │                │
     │                  │                    │    │            │
     │                  │                    │    │            │
     │                  │5: ML Matching Algorithm│           │
     │                  │<═════════════════════════════════════│
     │                  │                    │    │            │
     │                  │                    │    │            │
     │                  │6: Return Top 3 Projects/Score│      │
     │                  │<───────────────────────────────────────│
     │                  │                    │                │
     │7: Display recommendations│                │
     │<───────────────────│                    │
```

## 6.3 Sequence 3: Candidate Passes Quiz

```
┌──────────┐      ┌────────────┐      ┌─────────────┐    ┌──────────┐
│Candidate │      │ QuizService│      │ Application│    │   Timer  │
│          │      │            │      │  Service   │    │          │
└────┬─────┘      └─────┬──────┘      └──────┬──────┘    └────┬───┘
     │                  │                    │                │
     │1: Start Quiz    │                    │                │
     │────────────────>│                    │                │
     │                  │                    │                │
     │                  │2: Initialize timer│              │
     │                  │─────────────────>│             │
     │                  │                    │                │
     │                  │3: Return questions│              │
     │                  │<───────────────────│             │
     │                  │                    │                │
     │4: Display quiz │                    │                │
     │<─────────────────│                    │                │
     │                  │                    │                │
     │  ┌─ Timer ──────┐│                    │                │
     │  │ Countdown   ││                    │                │
     │  └────────────┘│                    │                │
     │                  │                    │                │
     │5: Submit answers│                   │                │
     │────────────────>│                    │                │
     │                  │                    │                │
     │                  │6: Auto-grade │                   │                │
     │                  │────────────────────>│            │
     │                  │                    │                │
     │                  │7: Calculate score │              │
     │                  │────────────────────>│            │
     │                  │                    │                │
     │                  │8: Update application status│       │
     │                  │──────────────────────────────>│       │
     │                  │                    │                │
     │9: Return result │                    │
     │<─────────────────│                    │
```

## 6.4 Sequence 4: Admin Receives Notification

```
┌──────────┐      ┌────────────┐      ┌─────────────┐    ┌──────────┐
│  System   │      │ Notification│      │   Email    │    │ Dashboard │
│          │      │  Service   │      │  Service   │    │  Update   │
└────┬─────┘      └─────┬──────┘      └──────┬──────┘    └────┬───┘
     │                  │                    │                │
     │1: CV Submitted │                    │                │
     │───────────────>│                    │                │
     │                  │                    │                │
     │2: Create in-app notification│              │
     │                  │───────────────────>│            │
     │                  │                    │                │
     │3: Send email to Admin│                  │
     │                  │──────────────────────────>│         │
     │                  │                    │                │
     │                  │                    │4: Real-time update│
     │                  │                    │<──────────────────│
     │                  │                    │                │
     │5: Notification created│                │
     │<───────────────────│                    │
```

## 6.5 Sequence 5: Admin Validates Candidate

```
┌──────────┐      ┌────────────┐      ┌─────────────┐    ┌──────────┐
│  Admin    │      │ Application│      │   Email    │    │Candidate │
│          │      │  Service   │      │  Service   │    │ Profile  │
└────┬─────┘      └─────┬──────┘      └──────┬──────┘    └────┬───┘
     │                  │                    │                │
     │1: Review candidate │                   │                │
     │<───────────────────│                    │                │
     │                  │                    │                │
     │2: Approve Application│                 │
     │────────────────>│                    │                │
     │                  │                    │                │
     │                  │3: Validate & Update status│          │
     │                  │────────────────────>│            │
     │                  │                    │                │
     │                  │4: Create notification│           │
     │                  │─────────────────────────>│         │
     │                  │                    │                │
     │                  │5: Send acceptance email│        │
     │                  │───────────────────────────────────>│    │
     │                  │                    │                │
     │                  │6: Update candidate progress│       │
     │                  │<───────────────────│            │
     │                  │                    │                │
     │7: Confirmation    │                    │
     │<─────────────────│                    │
```

---

<div style="page-break-after: always;"></div>

# 7. PRODUCT BACKLOG

## 7.1 Epics Overview

| Epic ID | Epic Name | User Stories | Priority |
|--------|-----------|-------------|-----------|
| EPIC-01 | Authentication | 3 | HIGH |
| EPIC-02 | Admin Dashboard | 15 | HIGH |
| EPIC-03 | Candidate Management | 8 | HIGH |
| EPIC-04 | CV Management | 5 | HIGH |
| EPIC-05 | Quiz System | 7 | HIGH |
| EPIC-06 | AI Matching | 6 | HIGH |
| EPIC-07 | Notifications | 8 | HIGH |
| EPIC-08 | Reports & Analytics | 5 | MEDIUM |
| EPIC-09 | System Settings | 4 | LOW |

## 7.2 User Stories

### EPIC-01: Authentication

| US ID | User Story | Priority | Estimated Points |
|-------|-----------|----------|-----------------|
| US-001 | As an Admin, I want to login with email and password to access the dashboard | HIGH | 3 |
| US-002 | As a Candidate, I want to register an account to start my application | HIGH | 5 |
| US-003 | As a System, I want to manage JWT tokens to ensure secure sessions | HIGH | 3 |

### EPIC-02: Admin Dashboard

| US ID | User Story | Priority | Estimated Points |
|-------|-----------|----------|-----------------|
| US-010 | As an Admin, I want to view all candidates in a data table to manage applications | HIGH | 8 |
| US-011 | As an Admin, I want to search and filter candidates to find specific profiles | HIGH | 5 |
| US-012 | As an Admin, I want to approve or reject candidates to control admissions | HIGH | 5 |
| US-013 | As an Admin, I want to view statistics dashboard to monitor system performance | HIGH | 8 |
| US-014 | As an Admin, I want to export candidate data to CSV/Excel for reporting | MEDIUM | 5 |
| US-015 | As an Admin, I want to manage system settings to configure the application | MEDIUM | 8 |

### EPIC-03: Candidate Management

| US ID | User Story | Priority | Estimated Points |
|-------|-----------|----------|-----------------|
| US-020 | As a Candidate, I want to submit my CV in PDF/DOCX format to apply for positions | HIGH | 8 |
| US-021 | As a Candidate, I want to edit my profile to keep information updated | HIGH | 3 |
| US-022 | As a Candidate, I want to track my application status to know my progress | HIGH | 5 |
| US-023 | As a Candidate, I want to view my quiz results to see my performance | HIGH | 3 |

### EPIC-04: CV Management

| US ID | User Story | Priority | Estimated Points |
|-------|-----------|----------|-----------------|
| US-030 | As a Candidate, I want to upload my CV file to submit my application | HIGH | 5 |
| US-031 | As a System, I want to parse CV files to extract candidate information | HIGH | 8 |
| US-032 | As an Admin, I want to download candidate CVs for review | HIGH | 3 |
| US-033 | As a System, I want to validate CV file formats to ensure compatibility | MEDIUM | 3 |

### EPIC-05: Quiz System

| US ID | User Story | Priority | Estimated Points |
|-------|-----------|----------|-----------------|
| US-040 | As an Admin, I want to create quizzes with questions to assess candidates | HIGH | 8 |
| US-041 | As an Admin, I want to set timer and passing score for quizzes to configure assessments | HIGH | 3 |
| US-042 | As a Candidate, I want to take a timed quiz to demonstrate my skills | HIGH | 8 |
| US-043 | As a System, I want to auto-grade quiz answers to provide instant results | HIGH | 5 |
| US-044 | As an Admin, I want to view quiz results to evaluate candidates | HIGH | 5 |
| US-045 | As a Candidate, I want to see my quiz score and pass/fail status after submission | HIGH | 3 |

### EPIC-06: AI Matching

| US ID | User Story | Priority | Estimated Points |
|-------|-----------|----------|-----------------|
| US-050 | As a System, I want to analyze candidate CVs to extract skills | HIGH | 13 |
| US-051 | As a System, I want to calculate match scores between candidates and projects | HIGH | 13 |
| US-052 | As a System, I want to recommend best supervisors based on expertise | HIGH | 8 |
| US-053 | As an Admin, I want to view AI recommendations to make informed decisions | HIGH | 5 |
| US-054 | As a System, I want to learn from acceptance/rejection patterns to improve matching | MEDIUM | 13 |

### EPIC-07: Notifications

| US ID | User Story | Priority | Estimated Points |
|-------|-----------|----------|-----------------|
| US-060 | As a System, I want to notify Admin when new CV is submitted | HIGH | 3 |
| US-061 | As a System, I want to notify candidate when quiz is ready | HIGH | 3 |
| US-062 | As a System, I want to send email notifications for important events | HIGH | 5 |
| US-063 | As a Candidate, I want to receive notification when accepted/rejected | HIGH | 3 |
| US-064 | As an Admin, I want to view notification history for audit | MEDIUM | 3 |
| US-065 | As a System, I want to mark notifications as read to track engagement | LOW | 2 |

### EPIC-08: Reports & Analytics

| US ID | User Story | Priority | Estimated Points |
|-------|-----------|----------|-----------------|
| US-070 | As an Admin, I want to view candidate count statistics | HIGH | 5 |
| US-071 | As an Admin, I want to view acceptance/rejection ratio charts | HIGH | 5 |
| US-072 | As an Admin, I want to view best performing projects | MEDIUM | 5 |
| US-073 | As an Admin, I want to view quiz performance analytics | MEDIUM | 5 |
| US-074 | As an Admin, I want to export reports for stakeholder meetings | MEDIUM | 5 |

### EPIC-09: System Settings

| US ID | User Story | Priority | Estimated Points |
|-------|-----------|----------|-----------------|
| US-080 | As an Admin, I want to configure email settings to customize notifications | MEDIUM | 3 |
| US-081 | As an Admin, I want to manage user roles and permissions | MEDIUM | 5 |
| US-082 | As an Admin, I want to view audit logs for security | MEDIUM | 5 |
| US-083 | As an Admin, I want to backup/restore system data | LOW | 8 |

## 7.3 Sprint Planning

### Sprint 1: Foundation (2 weeks)

| US ID | Description | Points | Dependencies |
|-------|-------------|--------|--------------|
| US-001 | Admin Login | 3 | - |
| US-002 | Candidate Registration | 5 | US-001 |
| US-003 | JWT Token Management | 3 | US-001 |
| **Total** | | **11** | |

### Sprint 2: Admin Core (2 weeks)

| US ID | Description | Points | Dependencies |
|-------|-------------|--------|--------------|
| US-010 | View All Candidates | 8 | US-001 |
| US-011 | Search/Filter Candidates | 5 | US-010 |
| US-012 | Approve/Reject Candidates | 5 | US-010 |
| **Total** | | **18** | US-010 |

### Sprint 3: CV Management (2 weeks)

| US ID | Description | Points | Dependencies |
|-------|-------------|--------|--------------|
| US-030 | Upload CV | 5 | US-002 |
| US-031 | CV Parsing | 8 | US-030 |
| US-032 | Download CV | 3 | US-030 |
| **Total** | | **16** | US-030 |

### Sprint 4: Quiz System (2 weeks)

| US ID | Description | Points | Dependencies |
|-------|-------------|--------|--------------|
| US-040 | Create Quiz | 8 | US-012 |
| US-041 | Quiz Configuration | 3 | US-040 |
| US-042 | Take Quiz | 8 | US-041 |
| US-043 | Auto-Grading | 5 | US-042 |
| **Total** | | **24** | US-042 |

### Sprint 5: AI Engine (2 weeks)

| US ID | Description | Points | Dependencies |
|-------|-------------|--------|--------------|
| US-050 | CV Analysis | 13 | US-031 |
| US-051 | Project Matching | 13 | US-050 |
| US-052 | Supervisor Matching | 8 | US-050 |
| **Total** | | **34** | US-051 |

### Sprint 6: Notifications (1 week)

| US ID | Description | Points | Dependencies |
|-------|-------------|--------|--------------|
| US-060 | Admin Notifications | 3 | US-012 |
| US-061 | Candidate Notifications | 3 | US-043 |
| US-062 | Email Notifications | 5 | US-060 |
| **Total** | | **11** | US-060 |

### Sprint 7: Analytics (1 week)

| US ID | Description | Points | Dependencies |
|-------|-------------|--------|--------------|
| US-070 | Statistics Dashboard | 5 | US-012 |
| US-071 | Charts/Graphs | 5 | US-070 |
| US-072 | Reports | 5 | US-070 |
| **Total** | | **15** | US-070 |

---

<div style="page-break-after: always;"></div>

# 8. DATABASE DESIGN

## 8.1 Database Schema

### 8.1.1 Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_active (active)
);
```

### 8.1.2 Roles Table
```sql
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    
    INDEX idx_roles_name (name)
);
```

### 8.1.3 User-Roles Junction Table
```sql
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

### 8.1.4 Candidates Table
```sql
CREATE TABLE candidates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    university VARCHAR(300),
    degree VARCHAR(200),
    graduation_year INT,
    skills_tags VARCHAR(1000),
    experience INT DEFAULT 0,
    cv_file_path VARCHAR(500),
    photo_path VARCHAR(500),
    bio TEXT,
    career_interests VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_candidates_user (user_id)
);
```

### 8.1.5 Supervisors Table
```sql
CREATE TABLE supervisors (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department VARCHAR(200),
    expertise_tags VARCHAR(1000),
    max_interns INT DEFAULT 3,
    current_interns INT DEFAULT 0,
    bio TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_supervisors_department (department),
    INDEX idx_supervisors_active (active)
);
```

### 8.1.6 Projects Table
```sql
CREATE TABLE projects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    domain VARCHAR(200),
    technology_tags VARCHAR(1000),
    required_skills VARCHAR(1000),
    submitted_by BIGINT,
    supervisor_id BIGINT,
    status ENUM('DRAFT','SUBMITTED','APPROVED','REJECTED') DEFAULT 'DRAFT',
    ai_score DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (supervisor_id) REFERENCES supervisors(id) ON DELETE SET NULL,
    INDEX idx_projects_status (status),
    INDEX idx_projects_supervisor (supervisor_id)
);
```

### 8.1.7 Applications Table
```sql
CREATE TABLE applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    candidate_id BIGINT NOT NULL,
    project_id BIGINT,
    supervisor_id BIGINT,
    status ENUM('PENDING','UNDER_REVIEW','QUIZ_PENDING','QUIZ_COMPLETED',
               'AI_EVALUATING','MANAGER_REVIEW','ACCEPTED','REJECTED') DEFAULT 'PENDING',
    intake_method ENUM('ONLINE','PHYSICAL') DEFAULT 'ONLINE',
    registered_by BIGINT,
    manager_notes TEXT,
    decision_date TIMESTAMP,
    interview_date TIMESTAMP,
    ai_match_score DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (supervisor_id) REFERENCES supervisors(id) ON DELETE SET NULL,
    FOREIGN KEY (registered_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_applications_candidate (candidate_id),
    INDEX idx_applications_status (status)
);
```

### 8.1.8 Quizzes Table
```sql
CREATE TABLE quizzes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    duration_mins INT DEFAULT 30,
    passing_score INT DEFAULT 60,
    total_marks INT DEFAULT 100,
    active BOOLEAN DEFAULT TRUE,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### 8.1.9 Quiz Questions Table
```sql
CREATE TABLE quiz_questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quiz_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(500),
    option_b VARCHAR(500),
    option_c VARCHAR(500),
    option_d VARCHAR(500),
    correct_option CHAR(1),
    marks INT DEFAULT 5,
    order_index INT DEFAULT 0,
    
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz_questions_quiz (quiz_id)
);
```

### 8.1.10 Quiz Attempts Table
```sql
CREATE TABLE quiz_attempts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quiz_id BIGINT NOT NULL,
    candidate_id BIGINT NOT NULL,
    application_id BIGINT,
    score INT,
    total_marks INT,
    percentage DOUBLE,
    passed BOOLEAN,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
    INDEX idx_quiz_attempts_candidate (candidate_id),
    INDEX idx_quiz_attempts_quiz (quiz_id)
);
```

### 8.1.11 Notifications Table
```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(300) NOT NULL,
    message TEXT,
    type ENUM('INFO','SUCCESS','WARNING','ERROR') DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (is_read)
);
```

### 8.1.12 Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_logs_user (user_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_created (created_at)
);
```

---

<div style="page-break-after: always;"></div>

# 9. TECHNOLOGY STACK RECOMMENDATION

## 9.1 Frontend Technologies

### Recommendation 1: React + TypeScript
| Technology | Version | Justification |
|------------|---------|--------------|
| **React** | 18.x | Industry standard, large ecosystem |
| **TypeScript** | 5.x | Type safety, better maintainability |
| **Vite** | 5.x | Fast build tool |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **React Query** | 5.x | Server state management |
| **Recharts** | 2.x | Charts and graphs |
| **React Hook Form** | 7.x | Form management |
| **Zod** | 3.x | Schema validation |
| **Axios** | 1.x | HTTP client |

### Alternative: Vue.js Stack
| Technology | Version | Justification |
|------------|---------|--------------|
| **Vue.js** | 3.x | Easier learning curve |
| **Nuxt.js** | 3.x | Full framework |
| **Pinia** | 2.x | State management |
| **VueUse** | 10.x | Composables |

## 9.2 Backend Technologies

### Primary Recommendation: Spring Boot
| Technology | Version | Justification |
|------------|---------|--------------|
| **Spring Boot** | 3.2.x | Enterprise Java standard |
| **Spring Security** | 6.x | Security framework |
| **Spring Data JPA** | 3.x | ORM abstraction |
| **Spring Mail** | 3.x | Email support |
| **JWT** | 0.12.x | Token authentication |
| **Lombok** | 1.18.x | Code reduction |

### Alternative: Node.js Stack
| Technology | Version | Justification |
|------------|---------|--------------|
| **Node.js** | 20.x | JavaScript everywhere |
| **Express.js** | 4.x | Lightweight API |
| **NestJS** | 10.x | Enterprise framework |
| **Prisma** | 5.x | Type-safe ORM |
| ** Passport.js** | - | Authentication |

## 9.3 Database Technologies

| Technology | Purpose | Configuration |
|------------|---------|---------------|
| **MySQL 8.0** | Primary Database | Master-Slave replication |
| **Redis** | Caching/Sessions | Sentinel/Cluster |
| **Elasticsearch** | Full-text search | 3-node cluster |
| **S3/MinIO** | File storage | Blob storage |

## 9.4 AI Integration

### Option 1: Local ML (Current)
```java
// TF-IDF + Cosine Similarity
// Lightweight, no external API needed
// Fast inference
```

### Option 2: External AI APIs
| Service | Use Case | Cost |
|---------|----------|------|
| **OpenAI GPT-4** | CV Analysis | Per request |
| **Azure AI** | NLP | Per minute |
| **HuggingFace** | Custom models | Self-hosted |

### Recommended AI Approach
```
┌─────────────────────────────────────────┐
│         HYBRID AI ARCHITECTURE            │
├─────────────────────────────────────────┤
│                                          │
│  Local ML (TF-IDF)                     │
│  └── Quick matching (score > 80%)      │
│  └── No API cost                        │
│                                          │
│  External AI (GPT-4)                  │
│  └── Complex analysis (score < 80%)     │
│  └── Better understanding              │
│                                          │
└─────────────────────────────────────────┘
```

## 9.5 Authentication & Authorization

| Technology | Purpose |
|------------|---------|
| **JWT (JSON Web Tokens)** | Stateless authentication |
| **Spring Security** | Authorization |
| **RBAC** | Role-based access |
| **BCrypt** | Password hashing |

## 9.6 Notification Services

| Service | Channel | Use Case |
|---------|---------|----------|
| **Spring Mail** | Email | Transactional emails |
| **WebSocket** | In-App | Real-time notifications |
| **Firebase** | Push | Mobile notifications |
| **SendGrid** | Email API | Reliable delivery |

## 9.7 Recommended Full Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RECOMMENDED STACK                           │
├──────────────────┬──────────────────────────────────────────┤
│ Component        │ Technology                               │
├──────────────────┼──────────────────────────────────────────┤
│ Frontend         │ React 18 + TypeScript + Vite + Tailwind  │
│ Backend          │ Spring Boot 3.2 + Java 17               │
│ Database         │ MySQL 8.0 + Redis + Elasticsearch         │
│ AI               │ TF-IDF (Local) + OpenAI (Optional)       │
│ Auth             │ JWT + Spring Security                    │
│ File Storage     │ S3 / MinIO                              │
│ Email            │ Spring Mail + SendGrid                   │
│ Monitoring       │ Prometheus + Grafana                   │
└──────────────────┴──────────────────────────────────────────┘
```

---

<div style="page-break-after: always;"></div>

# 10. UI/UX PAGES DESIGN

## 10.1 Admin Dashboard Pages

| Page | Route | Description |
|------|-------|-------------|
| **Login** | `/login` | Admin authentication |
| **Dashboard Home** | `/admin/dashboard` | Statistics overview |
| **Candidates** | `/admin/candidates` | Candidate management |
| **Candidate Detail** | `/admin/candidates/:id` | View/edit candidate |
| **Supervisors** | `/admin/supervisors` | Supervisor management |
| **Projects** | `/admin/projects` | Project management |
| **Applications** | `/admin/applications` | Application workflow |
| **Quizzes** | `/admin/quizzes` | Quiz management |
| **Quiz Results** | `/admin/quizzes/:id/results` | Quiz analytics |
| **Notifications** | `/admin/notifications` | Notification center |
| **Reports** | `/admin/reports` | Analytics & charts |
| **Settings** | `/admin/settings` | System configuration |
| **Audit Logs** | `/admin/audit-logs` | Activity history |

## 10.2 Candidate Portal Pages

| Page | Route | Description |
|------|-------|-------------|
| **Landing** | `/` | Public landing page |
| **Register** | `/register` | Account creation |
| **Login** | `/login` | Authentication |
| **My Dashboard** | `/dashboard` | Candidate overview |
| **My Profile** | `/profile` | Edit profile |
| **Upload CV** | `/cv/upload` | CV submission |
| **My Application** | `/application` | Application status |
| **Take Quiz** | `/quiz/:id` | Quiz interface |
| **Quiz Results** | `/quiz/results` | Score history |
| **Notifications** | `/notifications` | Inbox |

## 10.3 Page Wireframes

### 10.3.1 Admin Dashboard Home
```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR │              MAIN CONTENT                        │
│        │ ┌─────────────────────────────────────────────┐ │
│ □ Home │ │  WELCOME, ADMIN                           │ │
│ □ User │ │                                             │ │
│ □ Sup  │ │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐││
│ □ Proj │ │  │Total   │ │Pending │ │Accepted│ │Rejected│││
│ □ App  │ │  │Cand.   │ │Apply  │ │        │ │        │││
│ □ Quiz │ │  │  245  │ │  89   │ │  123  │ │  33   │││
│ □ Rpt  │ │  └────────┘ └────────┘ └────────┘ └────────┘││
│ □ Set  │ │                                             │ │
│        │ │  ┌────────────────────────────────────────┐    │ │
│        │ │  │     ACCEPTANCE RATE CHART           │    │ │
│        │ │  │     [Line/Bar/Pie Chart]        │    │ │
│        │ │  └────────────────────────────────────────┘    │ │
│        │ │                                             │ │
│        │ │  ┌──────────────────┐ ┌──────────────┐      │ │
│        │ │  │ RECENT ACTIVITY  │ │TOP PROJECTS │      │ │
│        │ │  │ - New CV      │ │Project A  │      │ │
│        │ │  │ - Quiz Taken  │ │Project B  │      │ │
│        │ │  │ - Accepted   │ │Project C  │      │ │
│        │ │  └──────────────────┘ └──────────────┘      │ │
└─────────────────────────────────────────────────────────┘
```

### 10.3.2 Candidate Management Page
```
┌─────────────────────────────────────────────────────────────────┐
│ FILTERS                    │ SEARCH [___________] [+ Add]    │
└─────────────────────────────────────────────────────────┘
┌──────────────────────────────────��─��────────────────────┐
│ # │ NAME      │ EMAIL      │ SKILLS    │ STATUS │ QUIZ │  │
├───┼──────────┼───────────┼───────────┼────────┼─────┼──┤
│ 1 │ John Doe │john@...   │Java,React│ACCEPTED│ 85  │⋮│
│ 2 │ Jane    │jane@...  │Python    │PENDING│ -   │⋮│
│ 3 │ Mike    │mike@...  │Node.js   │REJECTED│ 45  │⋮│
└─────────────────────────────────────────────────────────┘
          Rows per page: [10▼] Showing 1-3 of 245
```

### 10.3.3 AI Matching Page
```
┌─────────────────────────────────────────────────────────────────┐
│ CANDIDATE: John Doe                                    [Profile] │
├─────────────────────────────────────────────────────────────────┤
│ BEST MATCHING PROJECTS                                      │
│ ┌─────────────────────────────────────────┬────────────────────┐ │
│ │ Project A - Match: 92%                 │ [Assign]           │ │
│ │ └ Skills: Java, React, Spring          │                    │ │
│ ├────────────────────────────────────────┼────────────────────┤ │
│ │ Project B - Match: 85%                │ [Assign]           │ │
│ │ └ Skills: React, Node.js               │                    │ │
│ └────────────────────────────────────────┴────────────────────┘ │
│                                                              │
│ BEST MATCHING SUPERVISORS                                       │
│ ┌─────────────────────────────────────────┐ ┌──────────────┐ │
│ │ Dr. Smith - Match: 95%                 │ │ [Assign]    │ │
│ │ Expertise: AI, ML                     │ │              │ │
│ │ Availability: 2/3                  │ │              │ │
│ └───────────────────────────────────────��┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 10.3.4 Quiz Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ QUIZ: Technical Assessment    │ TIME: 14:32    │ 5/20 Qs │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                                                         │
│ Q5 of 20                                               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                         │
│ What is the time complexity of binary search?            │
│                                                         │
│ ○ (A) O(n)                                              │
│ ○ (B) O(log n)                                         │
│ ○ (C) O(n log n)                                        │
│ ○ (D) O(n²)                                            │
│                                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                         │
│     [Previous]    [Mark for Review]    [Next]            │
│                                                         │
│                                              [Submit]   │
└─────────────────────────────────────────────────────────┘
```

---

<div style="page-break-after: always;"></div>

# 11. BUSINESS RULES

## 11.1 Application Workflow Rules

| Rule ID | Description | Enforced By |
|---------|-------------|-------------|
| BR-001 | Application status flow: PENDING → UNDER_REVIEW → QUIZ_PENDING → QUIZ_COMPLETED → AI_EVALUATING → MANAGER_REVIEW → ACCEPTED/REJECTED | ApplicationService |
| BR-002 | Candidate must pass quiz (≥60%) before final decision | QuizService |
| BR-003 | Supervisor cannot exceed maxInterns capacity | SupervisorService |
| BR-004 | CV file must be PDF or DOCX format, max 10MB | FileStorageService |
| BR-005 | AI generates confidence score, not final decision | AiService |
| BR-006 | All status changes trigger email notification | NotificationService |
| BR-007 | Quiz timer must stop auto-submission on expiry | QuizService |
| BR-008 | Only Admin can delete candidates (soft delete) | SecurityConfig |

## 11.2 Data Validation Rules

| Field | Validation | Error Message |
|-------|-------------|---------------|
| Email | Unique, valid format | "Email already registered" |
| Password | Min 8 chars, 1 uppercase, 1 number | "Weak password" |
| CV File | PDF/DOCX only, max 10MB | "Invalid file format or size" |
| Quiz Score | 0-100 range | "Invalid score" |
| Supervisor Capacity | Positive integer, max 10 | "Invalid capacity" |

## 11.3 Security Rules

| Rule | Implementation |
|------|---------------|
| Password Storage | BCrypt hash (cost factor 10) |
| Token Expiry | 24 hours access, 7 days refresh |
| Rate Limiting | 10 requests/minute per IP |
| CSRF Protection | Enabled for all state-changing operations |
| XSS Protection | Input sanitization |
| SQL Injection | Parameterized queries via JPA |

---

<div style="page-break-after: always;"></div>

# 12. CONCLUSIONS AND RECOMMENDATIONS

## 12.1 Project Summary

The **SIPMS V2.0** represents a significant evolution of the internship management system, introducing:

1. **AI-Powered Matching** - Intelligent algorithms for candidate-project-supervisor matching
2. **Comprehensive Admin Controls** - Full administrative dashboard
3. **Automated Workflow** - End-to-end process automation
4. **Real-Time Notifications** - Instant communication
5. **Advanced Analytics** - Data-driven insights

## 12.2 Implementation Roadmap

| Phase | Duration | Deliverables |
|-------|-----------|-------------|
| Phase 1 | 2 weeks | Authentication & Admin Core |
| Phase 2 | 2 weeks | CV Management |
| Phase 3 | 2 weeks | Quiz System |
| Phase 4 | 2 weeks | AI Matching Engine |
| Phase 5 | 1 week | Notifications |
| Phase 6 | 1 week | Analytics & Reports |
| **Total** | **10 weeks** | **Complete System** |

## 12.3 Recommendations

### Technical Recommendations

1. **Start with local ML** - Avoid API costs initially
2. **Use Redis for caching** - Improve performance
3. **Implement WebSocket** - Real-time notifications
4. **Add Elasticsearch** - Better search capabilities
5. **Setup CI/CD** - Automated deployment

### Business Recommendations

1. **MVP First** - Launch with core features
2. **Gather Feedback** - User feedback loop
3. **Iterate** - Continuous improvement
4. **Scale** - Add features as needed

## 12.4 Success Metrics

| Metric | Target |
|--------|--------|
| Application Processing Time | Reduce by 70% |
| Quiz Auto-Grading Time | < 1 second |
| AI Matching Accuracy | > 80% |
| User Satisfaction | > 4.5/5 |
| System Uptime | 99.5% |

---

# APPENDICES

## Appendix A: API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/refresh` | Refresh token |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/candidates` | List candidates |
| PUT | `/api/admin/candidates/{id}` | Update candidate |
| DELETE | `/api/admin/candidates/{id}` | Delete candidate |
| GET | `/api/admin/statistics` | Dashboard stats |

### Quizzes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quiz` | List quizzes |
| POST | `/api/quiz/submit` | Submit quiz attempt |
| GET | `/api/quiz/results` | Quiz results |

### AI Matching
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/match` | Match candidate to project |
| GET | `/api/ai/recommendations/{candidateId}` | Get recommendations |

---

## Appendix B: Glossary

| Term | Definition |
|------|-------------|
| **API** | Application Programming Interface |
| **JWT** | JSON Web Token for authentication |
| **RBAC** | Role-Based Access Control |
| **ML** | Machine Learning |
| **TF-IDF** | Term Frequency-Inverse Document Frequency |
| **OCR** | Optical Character Recognition |
| **AI** | Artificial Intelligence |
| **CRUD** | Create, Read, Update, Delete |

---

**Document Version**: 2.0  
**Last Updated**: May 2026  
**Author**: Ayadi Youssef  
**Supervisor**: Rahma Bouaziz  
**Company**: Clinisys

---

*End of Technical Specification*