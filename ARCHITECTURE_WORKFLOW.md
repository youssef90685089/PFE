# SIPMS Refactoring: Visual Architecture & Workflow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     SIPMS ONBOARDING FLOW                       │
└─────────────────────────────────────────────────────────────────┘

                        STEP 1: PROFILE CREATION
                              (Reception)
                        ─────────────────────────
                                  │
                         ┌─────────▼────────┐
                         │  Create Candidate│
                         │  POST /candidates│
                         └─────────┬────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
            ┌───────▼────────┐          ┌───────▼──────────┐
            │ Candidate Saved│          │   No User Yet    │
            │ (Profile only) │          │  (user_id=NULL)  │
            └───────┬────────┘          └──────────────────┘
                    │
                    │ Internship files can be added
                    │ at any point (before/after)
                    │
        ┌───────────▼─────────────┐
        │  Candidate Status:      │
        │  "pending_approval"     │
        └───────────┬─────────────┘
                    │
                    │
          STEP 2: MANAGER REVIEW & APPROVAL
                  (Manager Dashboard)
          ───────────────────────────────
                    │
        ┌───────────▼─────────────────┐
        │  Manager Views Candidates   │
        │  - Sees "Pending" badge     │
        │  - Can review profile       │
        │  - Can check internship files│
        └───────────┬─────────────────┘
                    │
                    │ Click "Approve & Send Quiz"
                    │
        ┌───────────▼──────────────────────┐
        │ Approve & Send Quiz              │
        │ POST /candidates/{id}/           │
        │        approve-and-send-quiz     │
        └───────────┬──────────────────────┘
                    │
        ┌───────────▼──────────────────────┐
        │ 1. Create User Account           │
        │    - Set temp password           │
        │    - Assign ROLE_CANDIDATE       │
        │    - Set status="pending_quiz"   │
        │                                  │
        │ 2. Link to Candidate             │
        │    - Set candidate.user_id       │
        │                                  │
        │ 3. Send Welcome Email            │
        │    - Include temp password       │
        │    - Include login URL           │
        │    - Include quiz link           │
        └───────────┬──────────────────────┘
                    │
        ┌───────────▼────────────────────┐
        │  Candidate Status Updated:     │
        │  - Status: "pending_quiz"      │
        │  - hasUserAccount: true        │
        │  - Badge changes to "Active ✓" │
        └───────────┬────────────────────┘
                    │
                    │
           STEP 3: CANDIDATE LOGIN & QUIZ
                (Candidate Portal)
           ────────────────────────────
                    │
        ┌───────────▼──────────────────┐
        │  Candidate Receives Email    │
        │  - Click login link          │
        │  - Use temp password         │
        │  - Change password on login  │
        │  - Complete quiz             │
        └──────────────────────────────┘
                    │
                    │
           STEP 4: QUIZ COMPLETION
                  (Assessment)
           ─────────────────────
                    │
        ┌───────────▼──────────────────┐
        │  Quiz Results Recorded       │
        │  - quizScore populated       │
        │  - quizCompletedAt set       │
        │  - candidateStatus ready for │
        │    project assignments       │
        └──────────────────────────────┘
```

---

## Database Schema (Entity Relationship)

```
┌──────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                        │
└──────────────────────────────────────────────────────────────┘

    CANDIDATES TABLE
    ┌────────────────────────────────┐
    │ id (PK)                        │
    │ first_name                     │
    │ last_name                      │
    │ email (UNIQUE)                 │
    │ phone                          │
    │ cin                            │
    │ user_id (FK to users) [NULL]◄──┼───┐
    │ created_at                     │   │
    │ updated_at                     │   │
    └────────────────────────────────┘   │
              │                          │
              │ 1-to-many                │
              │                          │ OneToOne
              │                          │ (created on approval)
              │                          │
    ┌─────────▼─────────────────────┐  │
    │  INTERNSHIP_FILES TABLE       │  │
    ├───────────────────────────────┤  │
    │ id (PK)                       │  │
    │ candidate_id (FK) [NOT NULL]  │  │
    │ year                          │  │
    │ university                    │  │
    │ degree                        │  │
    │ skills_tags                   │  │
    │ created_at                    │  │
    │ updated_at                    │  │
    ├───────────────────────────────┤  │
    │ documents (1-to-many)         │  │
    └───────────────────────────────┘  │
                                       │
    ┌──────────────────────────────────┼───────────┐
    │          USERS TABLE             │           │
    ├──────────────────────────────────┤           │
    │ id (PK)◄──────────────────────────┘           │
    │ first_name                                   │
    │ last_name                                    │
    │ email                                        │
    │ password_hash                                │
    │ phone                                        │
    │ cin                                          │
    │ status = "pending_quiz"                      │
    │ active = true                                │
    │ must_change_password = true                  │
    │ quiz_created_at                              │
    │ quiz_completed_at                            │
    │ quiz_score                                   │
    │ created_at                                   │
    │ updated_at                                   │
    └────────────────────────────────────────────┘
              │
              │ Many-to-many
              │
    ┌─────────▼──────────────┐
    │  USER_ROLES TABLE      │
    ├────────────────────────┤
    │ user_id (FK)           │
    │ role_id (FK) = "5"     │  ◄─ ROLE_CANDIDATE
    └────────────────────────┘
```

---

## API Call Sequence Diagram

```
┌──────────────┐      ┌─────────────┐      ┌──────────┐
│  Reception   │      │   Manager   │      │ Candidate│
└──────┬───────┘      └──────┬──────┘      └────┬─────┘
       │                     │                   │
       │  1. POST /candidates                    │
       │  (firstName, lastName, email, phone)    │
       ├────────────────────────────────────────►│
       │                                         │
       │  Response: {id: 5, hasUserAccount: false}
       │◄────────────────────────────────────────┤
       │                                         │
       │  2. POST /candidates/5/internship-files │
       │  (year, university, degree, skills)     │
       ├────────────────────────────────────────►│
       │                                         │
       │  Response: {id: 1, candidateId: 5}      │
       │◄────────────────────────────────────────┤
       │                                         │
       │                     3. GET /candidates   │
       │                     (review list)        │
       │                ├───────────────────────►│
       │                │                        │
       │                │ Response: [...]        │
       │                │◄───────────────────────┤
       │                │                        │
       │                │ 4. POST /candidates/5/ │
       │                │    approve-and-send-quiz│
       │                ├───────────────────────►│
       │                │                        │
       │                │ - Create User          │
       │                │ - Send Email           │
       │                │ - Link Candidate       │
       │                │                        │
       │                │ Response: {id: 42,     │
       │                │            status:    │
       │                │   "pending_quiz"}      │
       │                │◄───────────────────────┤
       │                │                        │
       │                │                        │  5. Email received
       │                │                        │     Click link
       │                │                        │     ├────────────►│
       │                │                        │     │              │
       │                │                        │     │  6. POST     │
       │                │                        │     │   /auth/login│
       │                │                        │     ├─────────────►│
       │                │                        │     │              │
       │                │                        │     │ Token issued │
       │                │                        │     │◄─────────────┤
       │                │                        │     │              │
       │                │                        │     │ 7. POST      │
       │                │                        │     │  /quizzes/   │
       │                │                        │     │  submit      │
       │                │                        │     ├─────────────►│
       │                │                        │     │              │
       │                │                        │     │ Quiz stored  │
       │                │                        │     │◄─────────────┤
       │                │                        │     │              │

Timeline:
[T+0min]   Reception creates profile
[T+0min]   Adds internship file  
[T+5min]   Manager reviews candidates
[T+10min]  Manager approves & sends quiz
[T+10min]  Candidate receives email
[T+20min]  Candidate logs in
[T+30min]  Candidate completes quiz
```

---

## State Diagram: Candidate Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│          CANDIDATE STATUS LIFECYCLE                      │
└─────────────────────────────────────────────────────────┘

            ┌──────────────────────────────────┐
            │   BEFORE MANAGER APPROVAL        │
            │  ═══════════════════════════════  │
            │  Status: pending_approval         │
            │  user_id: NULL                    │
            │  hasUserAccount: false            │
            │  UI Badge: "⏳ Pending"            │
            └───────────┬──────────────────────┘
                        │
                        │ Manager clicks:
                        │ "Approve & Send Quiz"
                        │
            ┌───────────▼──────────────────────┐
            │   AFTER MANAGER APPROVAL         │
            │  ═══════════════════════════════  │
            │  Status: pending_quiz             │
            │  user_id: (set)                   │
            │  hasUserAccount: true             │
            │  Email: Sent                      │
            │  UI Badge: "✓ Active"             │
            └───────────┬──────────────────────┘
                        │
                        │ Candidate logs in +
                        │ changes password
                        │
            ┌───────────▼──────────────────────┐
            │   QUIZ IN PROGRESS                │
            │  ═══════════════════════════════  │
            │  Status: quiz_started             │
            │  quizCreatedAt: (set)             │
            │  UI: Shows quiz form              │
            └───────────┬──────────────────────┘
                        │
                        │ Candidate submits answers
                        │ Quiz scored
                        │
            ┌───────────▼──────────────────────┐
            │   QUIZ COMPLETED                  │
            │  ═══════════════════════════════  │
            │  Status: quiz_completed           │
            │  quizScore: (set)                 │
            │  quizCompletedAt: (set)           │
            │  Ready for: Project Assignment    │
            │  UI: Results displayed            │
            └───────────────────────────────────┘
```

---

## Request/Response Examples

### Request 1: Create Candidate (Reception Staff)
```http
POST /api/candidates HTTP/1.1
Host: localhost:8080
Authorization: Bearer RECEPTION_TOKEN
Content-Type: application/json

{
  "firstName": "Ahmed",
  "lastName": "Hassan",
  "email": "ahmed.hassan@student.uni.tn",
  "phone": "+216-98-765-4321",
  "cin": "12345678"
}
```

**Response 201 Created:**
```json
{
  "success": true,
  "message": "Candidate profile created successfully",
  "data": {
    "id": 42,
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "email": "ahmed.hassan@student.uni.tn",
    "phone": "+216-98-765-4321",
    "cin": "12345678",
    "hasUserAccount": false,
    "internshipFiles": [],
    "createdAt": "2024-12-15T14:30:00Z"
  }
}
```

### Request 2: Add Internship File (Same day, before approval)
```http
POST /api/candidates/42/internship-files HTTP/1.1
Host: localhost:8080
Authorization: Bearer RECEPTION_TOKEN
Content-Type: application/json

{
  "year": 2024,
  "university": "University of Sfax",
  "degree": "Bachelor in Computer Science",
  "skillsTags": "Java, Spring Boot, REST APIs, MySQL, React"
}
```

**Response 201 Created:**
```json
{
  "success": true,
  "message": "Internship file added",
  "data": {
    "id": 101,
    "candidateId": 42,
    "year": 2024,
    "university": "University of Sfax",
    "degree": "Bachelor in Computer Science",
    "skillsTags": "Java, Spring Boot, REST APIs, MySQL, React",
    "createdAt": "2024-12-15T14:35:00Z"
  }
}
```

### Request 3: Manager Approves & Sends Quiz (Next day)
```http
POST /api/candidates/42/approve-and-send-quiz HTTP/1.1
Host: localhost:8080
Authorization: Bearer MANAGER_TOKEN
Content-Type: application/json

{
  "quizTitle": "SIPMS Internship Technical Assessment",
  "customEmailMessage": "Welcome! We're excited to have you join our internship program."
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Candidate approved and quiz invitation sent successfully",
  "data": {
    "id": 42,
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "email": "ahmed.hassan@student.uni.tn",
    "phone": "+216-98-765-4321",
    "cin": "12345678",
    "active": true,
    "status": "pending_quiz",
    "mustChangePassword": true,
    "createdAt": "2024-12-15T10:00:00Z",
    "updatedAt": "2024-12-16T09:15:00Z"
  }
}
```

---

## Error Handling

### Error 1: Candidate Already Has Account
```http
POST /api/candidates/42/approve-and-send-quiz HTTP/1.1
...
```

**Response 400 Bad Request:**
```json
{
  "success": false,
  "message": "Candidate already has a user account",
  "errorCode": "ALREADY_APPROVED"
}
```

### Error 2: Insufficient Permissions
```http
POST /api/candidates/42/approve-and-send-quiz HTTP/1.1
Authorization: Bearer RECEPTIONIST_TOKEN  ◄─ Wrong role
...
```

**Response 403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied: only MANAGER and ADMIN roles can approve",
  "errorCode": "INSUFFICIENT_PERMISSIONS"
}
```

### Error 3: Candidate Not Found
```http
POST /api/candidates/9999/approve-and-send-quiz HTTP/1.1
...
```

**Response 404 Not Found:**
```json
{
  "success": false,
  "message": "Candidate not found: 9999",
  "errorCode": "RESOURCE_NOT_FOUND"
}
```

---

## Summary Table

| Aspect | Before Refactoring | After Refactoring |
|--------|-------------------|-------------------|
| **Profile Creation** | Auto-creates User | Profile only, no User |
| **Email Sending** | Auto-sent on create | Sent on manager approval |
| **Trigger** | Automatic | Manual button click |
| **Who Creates Account** | System | Manager (explicit) |
| **User Status** | Active immediately | Pending until approval |
| **Audit Trail** | Limited | Manager action logged |
| **Flexibility** | None | Can add files, review before approving |
| **Role Required** | Receptionist | Receptionist (create) + Manager (approve) |
| **Endpoint** | `POST /candidates` + `POST /candidates/{id}/invite` | `POST /candidates` (profile only) + `POST /candidates/{id}/approve-and-send-quiz` (manager approval) |
