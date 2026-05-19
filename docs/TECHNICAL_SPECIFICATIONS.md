# SIPMS - Technical Specifications & Architecture
**Version:** 1.0.0 | **Date:** May 3, 2026 | **Status:** Final Release

---

## 1. System Architecture Overview

### 1.1 Architecture Pattern
**Microservices-Ready Monolithic Architecture** with clean separation of concerns:
- **Frontend:** React 19 with Vite bundler
- **Backend:** Spring Boot 3.2.5 with Spring Security & JWT
- **Database:** MySQL 8.0 with optimized schema
- **Communication:** RESTful APIs with JSON payloads

### 1.2 Technology Stack

#### Frontend Stack
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 19.2.5 |
| Routing | React Router | 6.30.3 |
| Styling | TailwindCSS | 4.2.4 |
| HTTP Client | Axios | 1.15.2 |
| Icons | Lucide React | 1.12.0 |
| Charts | Recharts | 3.8.1 |
| Build Tool | Vite | 8.0.10 |
| State Management | React Context | Built-in |
| Form Handling | React Hook Form | 7.74.0 |
| Auth Token Parsing | JWT Decode | 4.0.0 |

#### Backend Stack
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Spring Boot | 3.2.5 |
| JDK | Java | 21 LTS |
| Security | Spring Security | Latest |
| JWT | JJWT | 0.12.5 |
| ORM | Spring Data JPA | Latest |
| Database | MySQL | 8.0+ |
| API Docs | SpringDoc OpenAPI | 2.5.0 |
| Validation | Jakarta Validation | Latest |
| DI Container | Spring Core | Latest |

#### Database Schema
- **Engine:** InnoDB
- **Character Set:** UTF-8MB4
- **Collation:** utf8mb4_unicode_ci
- **Tables:** 15 core entities
- **Indexes:** Strategic indexes on foreign keys and query fields
- **Foreign Keys:** Enabled with CASCADE/SET NULL rules

---

## 2. Core Entity Models

### 2.1 Entity Relationships Diagram (Textual)

```
┌─────────────────────────────────────────────────────────────┐
│                    USERS (Central)                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ id (PK), firstName, lastName, email (UNIQUE),          │ │
│  │ passwordHash, phone, avatarUrl, active,                │ │
│  │ createdAt, updatedAt                                   │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────┬──────────────────────────────────────────────┘
               │
          ┌────┴────────────────┬────────────────┐
          │                     │                │
     ┌────▼────┐         ┌─────▼──────┐    ┌────▼────────┐
     │ ROLES   │         │ CANDIDATES │    │ SUPERVISORS │
     └────┬────┘         └─────┬──────┘    └────┬────────┘
          │               (1:1) │              (1:Many)
    ┌─────▼─────────────────────┼──────────────────┐
    │ USER_ROLES (M:M Join)     │                  │
    │                           │                  │
    │         PROJECTS ◄────────┴──────────────────┤
    │         ▲                                     │
    │         │ submittedBy                        │
    │         │ supervisorId                       │
    │         │                    APPLICATIONS ◄──┤
    │         │                    ▲               │
    │         └────────────────────┼───────────────┘
    │                           projectId
    │                           supervisorId
    │
    └─ DOCUMENTS (Files for Applications)
       QUIZZES
       ├─ QUIZ_QUESTIONS
       ├─ QUIZ_ATTEMPTS
       └─ QUIZ_ANSWERS
       NOTIFICATIONS
       AUDIT_LOG
       AI_RANKINGS
```

### 2.2 Key Entities

#### USERS
- Primary authentication entity
- Stores credentials (hashed passwords)
- Linked to CANDIDATES and SUPERVISORS

#### CANDIDATES
- Extended profile for candidate users
- Stores CV path, skills, university, graduation year
- 1:1 relationship with USERS

#### SUPERVISORS
- Faculty/mentor profiles
- Maximum interns capacity tracking
- Expertise tags for matching

#### PROJECTS
- Internship project proposals
- States: DRAFT, SUBMITTED, APPROVED, REJECTED
- AI score for ranking

#### APPLICATIONS
- Lifecycle: PENDING → UNDER_REVIEW → QUIZ_PENDING → QUIZ_COMPLETED → AI_EVALUATING → MANAGER_REVIEW → ACCEPTED/REJECTED
- Tracks AI match score and manager notes

#### QUIZZES & QUIZ_QUESTIONS
- Assessment templates
- Multiple choice questions (A, B, C, D)
- Automatic grading

#### NOTIFICATIONS
- Real-time updates for all users
- Types: INFO, SUCCESS, WARNING, ERROR

#### AUDIT_LOG
- Comprehensive activity tracking
- Stores JSON details of changes
- IP address logging

#### AI_RANKINGS
- Project and candidate ranking scores
- AI reasoning/explanation stored

---

## 3. Security Architecture

### 3.1 Authentication Flow

```
1. User submits credentials (email + password)
                   ↓
2. AuthService.login() authenticates via AuthenticationManager
                   ↓
3. UserDetailsImpl loads user roles from database
                   ↓
4. JwtTokenProvider generates:
   - Access Token (24-hour expiration)
   - Refresh Token (7-day expiration)
                   ↓
5. Tokens returned to client and stored in localStorage
                   ↓
6. Client includes Access Token in Authorization header:
   "Authorization: Bearer <token>"
```

### 3.2 Authorization (RBAC)

**Role Hierarchy:**
- `ROLE_ADMIN`: Full system access
- `ROLE_MANAGER`: Can review applications, trigger AI ranking
- `ROLE_RECEPTIONIST`: Can register candidates (physical intake)
- `ROLE_CANDIDATE`: Can apply, submit projects, take quizzes
- `ROLE_SUPERVISOR`: Can supervise projects (optional)

**Route Protection:**
```java
/api/auth/**              → PUBLIC
/api/users/**             → ROLE_ADMIN
/api/admin/**             → ROLE_ADMIN
/api/ai/**                → ROLE_ADMIN, ROLE_MANAGER
/api/reception/**         → ROLE_ADMIN, ROLE_RECEPTIONIST
/api/candidates/**        → ROLE_ADMIN, ROLE_MANAGER
/api/applications/**      → Authenticated users
/api/dashboard/**         → Authenticated users (role-based views)
```

### 3.3 Security Features Implemented

✅ **Password Security:**
- Strong password requirements (8+ chars, uppercase, lowercase, digit, special char)
- BCrypt hashing (strength 12)
- No plaintext storage

✅ **JWT Security:**
- HS256 signing algorithm
- Expiration times enforced
- Refresh token rotation support
- Claims include: id, email, name, roles

✅ **Rate Limiting:**
- 5 login/register attempts per minute per IP
- Prevents brute force attacks

✅ **Input Validation:**
- @NotBlank, @Email, @Size, @Pattern annotations
- Custom @StrongPassword validation
- SQL injection prevention via parameterized queries

✅ **CORS Configuration:**
- Allowed origins configurable via environment
- Credentials allowed for cross-origin requests
- Preflight requests handled

✅ **CSRF Protection:**
- Disabled for stateless JWT API (standard practice)

✅ **Audit Logging:**
- All critical operations logged
- IP addresses tracked
- Change details stored as JSON

### 3.4 Secrets Management

**Environment Variables (Production):**
```bash
DB_URL=jdbc:mysql://prod-db:3306/sipms_db
DB_USERNAME=***
DB_PASSWORD=***
JWT_SECRET=<64-char-minimum-key>
JWT_EXPIRATION_MS=86400000
JWT_REFRESH_EXPIRATION_MS=604800000
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=***
MAIL_PASSWORD=***
CORS_ALLOWED_ORIGINS=https://app.example.com
```

---

## 4. API Architecture

### 4.1 Request/Response Format

**All endpoints use standardized wrapper:**

```json
{
  "success": true/false,
  "message": "Descriptive message",
  "data": { /* Response payload */ },
  "error": "ERROR_CODE (if failed)",
  "timestamp": "ISO-8601 timestamp"
}
```

### 4.2 Pagination

**Query Parameters:**
```
GET /api/users?page=0&size=20&search=john
```

**Response:**
```json
{
  "success": true,
  "data": [
    { /* items */ }
  ],
  "pagination": {
    "totalElements": 150,
    "totalPages": 8,
    "currentPage": 0,
    "size": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### 4.3 Error Handling

**Global Exception Handler:**
- `ValidationException` → 400 Bad Request
- `BusinessException` → 400/409 (contextual)
- `ResourceNotFoundException` → 404 Not Found
- `AuthenticationException` → 401 Unauthorized
- `AccessDeniedException` → 403 Forbidden
- `Exception` (generic) → 500 Internal Server Error

---

## 5. Database Performance Optimization

### 5.1 Indexing Strategy

**Primary Indexes:**
```sql
-- Foreign keys (already indexed)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_candidates_user ON candidates(user_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_project ON applications(project_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_supervisor ON projects(supervisor_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);
CREATE INDEX idx_quiz_attempts_candidate ON quiz_attempts(candidate_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
```

### 5.2 N+1 Query Prevention

**JPA Entity Graph Example:**
```java
@Query(value = """
  SELECT a FROM Application a
  LEFT JOIN FETCH a.candidate
  LEFT JOIN FETCH a.project
  LEFT JOIN FETCH a.supervisor
  WHERE a.id = :id
""")
Application findByIdWithDetails(@Param("id") Long id);
```

### 5.3 Query Optimization

- Use projection DTOs instead of full entities
- Implement pagination for large result sets
- Cache dashboard statistics (30-minute TTL)
- Use database-level filtering before application logic

### 5.4 Soft Delete Implementation (Recommended)

```sql
ALTER TABLE applications ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE projects ADD COLUMN deleted_at TIMESTAMP NULL;

-- Queries automatically filter deleted records
WHERE deleted_at IS NULL
```

---

## 6. Frontend Architecture

### 6.1 Component Structure

```
src/
├── App.jsx (Main route manager)
├── main.jsx (Entry point)
├── api/
│   └── axios.js (HTTP client + interceptors)
├── components/
│   ├── ErrorBoundary.jsx (Error handling)
│   ├── ProtectedRoute.jsx (Route guards)
│   ├── Navbar.jsx (Header)
│   ├── Sidebar.jsx (Navigation)
│   └── ui/
│       ├── DataTable.jsx (Reusable table)
│       ├── LoadingSpinner.jsx (Loading state)
│       ├── StatCard.jsx (Dashboard KPI)
│       └── Badge.jsx (Status badges)
├── context/
│   └── AuthContext.jsx (Global auth state)
├── layouts/
│   └── DashboardLayout.jsx (Dashboard wrapper)
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── dashboard/
│       ├── OverviewPage.jsx
│       ├── ApplicationsPage.jsx
│       ├── CandidatesPage.jsx
│       ├── ProjectsPage.jsx
│       ├── SupervisorsPage.jsx
│       ├── QuizPage.jsx
│       ├── AiInsightsPage.jsx
│       ├── UsersPage.jsx
│       ├── NotificationsPage.jsx
│       ├── MyApplicationsPage.jsx
│       ├── MyProjectsPage.jsx
│       ├── ProfilePage.jsx
│       ├── CVUploadPage.jsx
│       └── SettingsPage.jsx
└── styles/
    ├── App.css
    ├── index.css
    └── tailwind.config.js (TailwindCSS)
```

### 6.2 State Management

**useContext + useReducer Pattern:**
```javascript
// AuthContext manages:
- Current user (id, email, roles)
- Access token
- Authentication status
- Helper methods: login(), logout(), hasRole()
```

### 6.3 HTTP Interceptors

**Request Interceptor:**
- Attaches JWT token to Authorization header
- Handles token refresh

**Response Interceptor:**
- Handles 401 responses → redirect to login
- Cleans up localStorage on token expiry

### 6.4 Error Handling

**Error Boundary:**
- Catches rendering errors
- Shows fallback UI
- Development error details in console

**API Error Handler:**
- Standardized error messages
- Toast notifications (if implemented)
- Form validation errors

---

## 7. Performance Metrics

### 7.1 Target Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Page Load Time | < 2s | 🟡 Needs optimization |
| API Response Time | < 200ms | 🟢 Achievable |
| Time to Interactive | < 3s | 🟡 Frontend optimization needed |
| Lighthouse Score | > 90 | 🔴 Current: ~65 |
| Core Web Vitals | All Green | 🟡 Partial |

### 7.2 Optimization Roadmap

- [ ] Code splitting with React.lazy()
- [ ] Image optimization (WebP, lazy loading)
- [ ] CSS/JS minification
- [ ] Redis caching for dashboard stats
- [ ] Database connection pooling (HikariCP)
- [ ] CDN for static assets
- [ ] Compression (gzip/brotli)

---

## 8. Deployment Architecture

### 8.1 Development Environment
```
localhost:5173 (Frontend - Vite dev server)
localhost:8080 (Backend - Spring Boot)
localhost:3306 (MySQL database)
```

### 8.2 Production Architecture
```
┌──────────────────┐
│   Client (Web)   │
└────────┬─────────┘
         │ HTTPS
    ┌────▼──────┐
    │   CDN     │ (Static assets)
    └────┬──────┘
         │
    ┌────▼──────────────────────┐
    │ Load Balancer / Reverse   │
    │ Proxy (Nginx)             │
    └────┬──────────────────────┘
         │ Internal Network
    ┌────▼──────────────────────┐
    │  Spring Boot Container(s) │ (x3 for HA)
    │  - Port 8080              │
    │  - Health checks          │
    │  - Metrics endpoint       │
    └────┬──────────────────────┘
         │
    ┌────▼──────────────────────┐
    │ MySQL Database Cluster    │
    │ - Primary + Replicas      │
    │ - Automated backups       │
    │ - Connection pooling      │
    └───────────────────────────┘
```

### 8.3 Docker Deployment

**Docker Compose Example:**
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secure_password
      MYSQL_DATABASE: sipms_db
    volumes:
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/data.sql:/docker-entrypoint-initdb.d/02-data.sql
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - DB_URL=jdbc:mysql://mysql:3306/sipms_db
      - DB_USERNAME=root
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

---

## 9. Monitoring & Logging

### 9.1 Logging Strategy

**Levels:**
- `ERROR`: Failures, exceptions
- `WARN`: Potential issues
- `INFO`: Important events (login, creation)
- `DEBUG`: Detailed flow (development only)

**Log Aggregation (Optional):**
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- CloudWatch (AWS)

### 9.2 Metrics (Spring Actuator)

**Endpoints:**
- `/actuator/health` - Health check
- `/actuator/metrics` - JVM metrics
- `/actuator/prometheus` - Prometheus format

### 9.3 Alerts

- Database connection pool exhaustion
- API response time > 500ms
- Error rate > 5%
- Disk space < 10%

---

## 10. Scalability Considerations

### 10.1 Horizontal Scaling

- **Stateless API:** Can run multiple backend instances
- **Load Balancing:** Distribute traffic via Nginx/HAProxy
- **Session Storage:** Consider Redis for distributed sessions
- **Database:** Read replicas for query scaling

### 10.2 Vertical Scaling

- **Backend:** Increase JVM heap size
- **Database:** Upgrade to larger instance
- **Cache:** Implement Redis caching layer

### 10.3 Database Scaling

- Partitioning by application status/date
- Archive old audit logs
- Connection pooling (HikariCP: 20 connections default)

---

## 11. Backup & Disaster Recovery

### 11.1 Backup Strategy

- **Daily Full Backups:** MySQL
- **Hourly Incremental:** Transaction logs
- **Retention:** 30 days minimum
- **Location:** Offsite cloud storage (AWS S3, Azure Blob)

### 11.2 Recovery Procedures

**RTO (Recovery Time Objective):** 4 hours
**RPO (Recovery Point Objective):** 1 hour

```bash
# Restore database from backup
mysql -u root -p sipms_db < backup_2026_03_01.sql

# Verify data integrity
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM applications;
```

---

## 12. Compliance & Governance

### 12.1 Data Protection

- Passwords: BCrypt hashing
- Personal data: Encrypted at rest (AES-256)
- GDPR: Right to be forgotten via soft deletes
- Audit trail: 2-year retention

### 12.2 Access Control

- Role-based access control (RBAC)
- IP whitelisting (optional for admin)
- Session timeout: 24 hours
- Account lockout: After 5 failed attempts

---

**Document Version:** 1.0  
**Last Updated:** May 3, 2026  
**Status:** Production Ready
