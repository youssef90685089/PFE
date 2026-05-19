# SIPMS API Documentation
**Version:** 1.0.0  
**Last Updated:** May 3, 2026  
**Base URL:** `http://localhost:8080/api`

---

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [Candidates](#candidates)
4. [Projects](#projects)
5. [Applications](#applications)
6. [Supervisors](#supervisors)
7. [Quizzes](#quizzes)
8. [Notifications](#notifications)
9. [AI Module](#ai-module)
10. [Dashboard](#dashboard)
11. [Error Handling](#error-handling)

---

## Authentication

### POST /auth/login
Authenticate user and obtain JWT access/refresh tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!@"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "userId": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "roles": ["ROLE_CANDIDATE"]
  }
}
```

**Errors:**
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Rate limit exceeded (5 attempts/minute)

---

### POST /auth/register
Register a new candidate account.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!@",
  "phone": "+216 95 XXX XXXX",
  "university": "University of Sfax",
  "degree": "Bachelor in Computer Science",
  "graduationYear": 2024,
  "skillsTags": "Java, Spring Boot, React, MySQL",
  "bio": "Passionate about software development"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 digit (0-9)
- At least 1 special character (@$!%*?&)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "tokenType": "Bearer",
    "userId": 42,
    "email": "john@example.com",
    "fullName": "John Doe",
    "roles": ["ROLE_CANDIDATE"]
  }
}
```

**Errors:**
- `400 Bad Request`: Validation errors (weak password, invalid email, etc.)
- `409 Conflict`: Email already registered

---

### POST /auth/refresh
Refresh expired access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "userId": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "roles": ["ROLE_CANDIDATE"]
  }
}
```

**Errors:**
- `401 Unauthorized`: Invalid or expired refresh token
- `403 Forbidden`: User account inactive

---

### POST /auth/logout
Logout user (client-side primarily, server acknowledges).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Users

### GET /users
Get all users (Admin only).

**Query Parameters:**
- `page` (int): Page number (0-indexed), default: 0
- `size` (int): Page size, default: 20
- `search` (string): Search by email or name

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@sipms.com",
      "phone": "+216...",
      "active": true,
      "roles": ["ROLE_ADMIN"],
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

---

### GET /users/{id}
Get user by ID (Admin or self).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+216...",
    "active": true,
    "roles": ["ROLE_CANDIDATE"],
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-02-20T14:45:00Z"
  }
}
```

---

### PUT /users/{id}
Update user profile.

**Request:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+216 95 XXX XXXX"
}
```

**Response (200 OK):** Returns updated user object

---

## Candidates

### GET /candidates
Get all candidates (Admin/Manager only).

**Query Parameters:**
- `search` (string): Search by name or skills
- `university` (string): Filter by university
- `page` (int): Page number
- `size` (int): Page size

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 42,
      "fullName": "John Doe",
      "university": "University of Sfax",
      "degree": "Bachelor in Computer Science",
      "graduationYear": 2024,
      "skillsTags": "Java, Spring Boot, React",
      "bio": "...",
      "cvFilePath": "/uploads/cv/cv_john_doe.pdf",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

---

### GET /candidates/{id}
Get candidate profile by ID.

**Response (200 OK):** Returns candidate object with full details

---

### POST /candidates/{candidateId}/cv
Upload CV file.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (file): PDF or DOC file (max 10MB)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "CV uploaded successfully",
  "data": {
    "filePath": "/uploads/cv/cv_john_doe_2026.pdf",
    "fileName": "cv_john_doe_2026.pdf"
  }
}
```

---

## Projects

### GET /projects
Get all internship projects.

**Query Parameters:**
- `status` (string): DRAFT, SUBMITTED, APPROVED, REJECTED
- `domain` (string): Filter by domain
- `supervisorId` (long): Filter by supervisor
- `page`, `size`: Pagination

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "AI-Powered Student Recommendation System",
      "description": "Develop a system to match students with internship opportunities",
      "domain": "Machine Learning",
      "technologyTags": "Python, TensorFlow, MySQL",
      "status": "APPROVED",
      "supervisorId": 5,
      "supervisorName": "Dr. Ahmed Mohamed",
      "aiScore": 0.92,
      "createdAt": "2026-01-20T09:00:00Z"
    }
  ]
}
```

---

### POST /projects
Create new project (Candidate or Supervisor).

**Request:**
```json
{
  "title": "Web Application Development",
  "description": "Build a full-stack web application...",
  "domain": "Web Development",
  "technologyTags": "React, Spring Boot, PostgreSQL"
}
```

**Response (201 Created):** Returns created project object

---

### PUT /projects/{id}
Update project (Owner only).

**Request:** Same as POST /projects

**Response (200 OK):** Returns updated project

---

### DELETE /projects/{id}
Delete project (Owner or Admin).

**Response (204 No Content)**

---

## Applications

### GET /applications
Get all applications (Admin/Manager).

**Query Parameters:**
- `candidateId` (long): Filter by candidate
- `projectId` (long): Filter by project
- `status` (string): PENDING, UNDER_REVIEW, etc.
- `page`, `size`: Pagination

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "candidateId": 42,
      "candidateName": "John Doe",
      "projectId": 5,
      "projectTitle": "Web Application Development",
      "supervisorId": 3,
      "supervisorName": "Dr. Ahmed",
      "status": "UNDER_REVIEW",
      "intakeMethod": "ONLINE",
      "aiMatchScore": 0.87,
      "createdAt": "2026-02-01T10:00:00Z",
      "updatedAt": "2026-02-15T14:30:00Z"
    }
  ]
}
```

---

### GET /applications/my
Get candidate's own applications.

**Response (200 OK):** Array of application objects for current user

---

### POST /applications
Create new application (Candidate).

**Request:**
```json
{
  "projectId": 5,
  "supervisorId": 3,
  "intakeMethod": "ONLINE"
}
```

**Response (201 Created):** Returns created application

---

### PUT /applications/{id}/status
Update application status (Manager/Admin).

**Request:**
```json
{
  "status": "ACCEPTED",
  "managerNotes": "Excellent fit for this project"
}
```

**Status Values:**
- `PENDING` → `UNDER_REVIEW`
- `UNDER_REVIEW` → `QUIZ_PENDING`
- `QUIZ_COMPLETED` → `AI_EVALUATING`
- `AI_EVALUATING` → `MANAGER_REVIEW`
- `MANAGER_REVIEW` → `ACCEPTED` or `REJECTED`

**Response (200 OK):** Returns updated application

---

## Supervisors

### GET /supervisors
Get all supervisors (Manager/Admin).

**Query Parameters:**
- `department` (string): Filter by department
- `search` (string): Search by name
- `page`, `size`: Pagination

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fullName": "Dr. Ahmed Mohamed",
      "email": "ahmed.mohamed@univ.tn",
      "department": "Computer Science",
      "expertiseTags": "AI, Machine Learning, Data Science",
      "maxInterns": 5,
      "currentInterns": 2,
      "bio": "Expert in AI and ML",
      "active": true,
      "createdAt": "2026-01-10T08:00:00Z"
    }
  ]
}
```

---

### POST /supervisors
Create supervisor profile (Admin only).

**Request:**
```json
{
  "fullName": "Dr. Fatima Ahmed",
  "email": "fatima.ahmed@univ.tn",
  "department": "Computer Science",
  "expertiseTags": "Web Development, Databases",
  "maxInterns": 4,
  "bio": "Expert in web technologies"
}
```

**Response (201 Created):** Returns created supervisor

---

## Quizzes

### GET /quizzes
Get available quizzes.

**Query Parameters:**
- `active` (boolean): Only active quizzes
- `page`, `size`: Pagination

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Java Fundamentals Assessment",
      "description": "Test basic Java knowledge",
      "durationMins": 30,
      "passingScore": 60,
      "totalMarks": 100,
      "active": true,
      "questionCount": 20,
      "createdAt": "2026-01-01T10:00:00Z"
    }
  ]
}
```

---

### POST /quizzes/{quizId}/attempt
Start a quiz attempt (Candidate).

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "attemptId": 1,
    "quizId": 1,
    "questions": [
      {
        "id": 1,
        "text": "What is polymorphism?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "marks": 5
      }
    ],
    "durationMins": 30,
    "startedAt": "2026-03-01T10:00:00Z"
  }
}
```

---

### POST /quizzes/attempt/{attemptId}/submit
Submit quiz attempt with answers.

**Request:**
```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedOption": "A"
    },
    {
      "questionId": 2,
      "selectedOption": "C"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "attemptId": 1,
    "score": 85,
    "totalMarks": 100,
    "percentage": 85.0,
    "passed": true,
    "completedAt": "2026-03-01T10:30:00Z"
  }
}
```

---

## Notifications

### GET /notifications
Get user's notifications (Candidate/All Users).

**Query Parameters:**
- `unread` (boolean): Only unread notifications
- `type` (string): INFO, SUCCESS, WARNING, ERROR
- `page`, `size`: Pagination

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Application Status Update",
      "message": "Your application has been moved to quiz stage",
      "type": "INFO",
      "isRead": false,
      "link": "/dashboard/applications/42",
      "createdAt": "2026-02-28T15:30:00Z"
    }
  ]
}
```

---

### PUT /notifications/{id}/read
Mark notification as read.

**Response (200 OK):** Returns updated notification

---

### PUT /notifications/mark-all-read
Mark all notifications as read.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## AI Module

### POST /ai/rank-projects
Rank all submitted projects using AI scoring (Manager/Admin).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Projects ranked successfully",
  "data": [
    {
      "id": 1,
      "rankingType": "PROJECT_RANK",
      "projectId": 5,
      "projectTitle": "AI System",
      "score": 0.92,
      "reasoning": "Excellent project with clear objectives and modern tech stack",
      "createdAt": "2026-03-01T10:00:00Z"
    }
  ]
}
```

---

### POST /ai/match-candidates/{supervisorId}
Match candidates to supervisor (Manager/Admin).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Candidates matched successfully",
  "data": [
    {
      "id": 2,
      "rankingType": "CANDIDATE_MATCH",
      "candidateId": 42,
      "candidateName": "John Doe",
      "supervisorId": 3,
      "score": 0.87,
      "reasoning": "Strong skills match with supervisor expertise in ML",
      "createdAt": "2026-03-01T10:15:00Z"
    }
  ]
}
```

---

### GET /ai/rankings/projects
Get historical project rankings.

**Response (200 OK):** Array of ranking objects

---

### GET /ai/rankings/candidates/{supervisorId}
Get historical candidate matchings for supervisor.

**Response (200 OK):** Array of ranking objects

---

## Dashboard

### GET /dashboard/stats
Get dashboard statistics (Manager/Admin).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalCandidates": 150,
    "totalApplications": 320,
    "totalProjects": 45,
    "totalSupervisors": 12,
    "applicationsAccepted": 85,
    "applicationsRejected": 40,
    "applicationsByStatus": {
      "PENDING": 50,
      "UNDER_REVIEW": 80,
      "QUIZ_PENDING": 60,
      "ACCEPTED": 85
    },
    "applicationsByMonth": {
      "2026-01": 45,
      "2026-02": 120,
      "2026-03": 155
    }
  }
}
```

---

## Error Handling

### Error Response Format
All errors follow this standard format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "timestamp": "2026-03-01T10:00:00Z"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK - Request successful |
| `201` | Created - Resource created successfully |
| `204` | No Content - Successful, no response body |
| `400` | Bad Request - Invalid parameters or validation error |
| `401` | Unauthorized - Missing or invalid authentication |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource not found |
| `409` | Conflict - Resource conflict (e.g., duplicate email) |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error - Server error |

### Common Error Codes

- `INVALID_CREDENTIALS`: Email/password incorrect
- `EMAIL_ALREADY_EXISTS`: Email already registered
- `WEAK_PASSWORD`: Password doesn't meet requirements
- `UNAUTHORIZED`: Authentication token missing/invalid
- `FORBIDDEN`: User doesn't have required role
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests from this IP

---

## Authentication Headers

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

### Token Format
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Rate Limiting

- **Auth endpoints** (login/register): 5 requests per minute per IP
- **Other endpoints**: 100 requests per minute per user

---

## Pagination

Query parameters for list endpoints:
- `page` (int): 0-indexed page number, default: 0
- `size` (int): Items per page, default: 20, max: 100

**Response includes:**
```json
{
  "content": [...],
  "totalElements": 150,
  "totalPages": 8,
  "currentPage": 0,
  "size": 20
}
```

---

**API Version:** 1.0.0  
**Last Updated:** May 3, 2026  
**For questions or issues:** contact support@sipms.example.com
