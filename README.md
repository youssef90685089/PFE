# SIPMS - Smart Internship & Project Management System

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2.x-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring Boot">
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=java&logoColor=white" alt="Java">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
</p>

## 📋 Overview

SIPMS (Smart Internship & Project Management System) is a comprehensive, enterprise-grade web application designed to digitize and automate the entire internship and project management lifecycle. Built with modern full-stack technologies, it provides AI-powered matching between candidates, projects, and supervisors.

## ✨ Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Four user roles: Admin, Manager, Receptionist, Candidate

### 👨‍💼 Admin Dashboard
- Complete user management
- Candidate tracking and evaluation
- Supervisor allocation
- Project management
- Quiz configuration
- AI insights and analytics
- System settings
- Audit logs

### 📄 Candidate Portal
- User registration and login
- CV upload (PDF/DOCX)
- Application submission
- Project idea submission
- Quiz taking with timer
- Status tracking
- Real-time notifications

### 🤖 AI Matching Engine
- CV analysis and skill extraction
- Project ranking by relevance
- Supervisor-candidate matching
- Score-based recommendations

### 📝 Quiz System
- Timed assessments
- Auto-grading
- Instant results
- Pass/Fail determination
- Quiz history

### 🔔 Notifications
- In-app notifications
- Email notifications
- Real-time alerts
- Status change notifications

### 📊 Analytics
- Dashboard statistics
- Acceptance rate charts
- Application trends
- Quiz performance analytics

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18.x | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| React Router | Navigation |
| Axios | HTTP Client |
| Recharts | Charts & Graphs |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Spring Boot 3.2 | Framework |
| Java 17 | Language |
| Spring Security | Security |
| Spring JPA | ORM |
| MySQL 8.0 | Database |
| JWT | Authentication |
| Lombok | Code Generation |
| Swagger | API Documentation |

## 📁 Project Structure

```
SIPMS/
├── backend/                    # Spring Boot API
│   ├── src/main/java/
│   │   └── com/project/sipms/
│   │       ├── controller/    # REST APIs
│   │       ├── service/      # Business Logic
│   │       ├── repository/   # Data Access
│   │       ├── entity/       # JPA Entities
│   │       ├── dto/          # Data Transfer Objects
│   │       ├── security/     # Security Config
│   │       ├── ai/           # AI Algorithms
│   │       └── common/       # Utilities
│   └── src/main/resources/
│       └── application.properties
│
├── frontend/                  # React Application
│   ├── src/
│   │   ├── pages/          # Page Components
│   │   ├── components/     # Reusable Components
│   │   ├── api/           # API Configuration
│   │   ├── context/       # React Context
│   │   └── layouts/       # Layout Components
│   └── package.json
│
├── database/                 # Database Scripts
│   ├── schema.sql          # Database Schema
│   └── data.sql            # Seed Data
│
├── docs/                    # Documentation
│   ├── Technical Specifications
│   ├── API Documentation
│   └── Deployment Guide
│
└── docker-compose.yml       # Docker Configuration
```

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-repo/sipms.git
cd sipms
```

2. **Setup Database**
```sql
CREATE DATABASE sipms_db;
```

3. **Configure Backend**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Build and Run Backend**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

5. **Run Frontend**
```bash
cd frontend
npm install
npm run dev
```

6. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

### Default Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@sipms.com | Admin@123 | ADMIN |
| manager@sipms.com | Admin@123 | MANAGER |
| receptionist@sipms.com | Admin@123 | RECEPTIONIST |

## 📖 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api-docs

## 🔧 Environment Variables

```env
# Database
DB_URL=jdbc:mysql://localhost:3306/sipms_db
DB_USERNAME=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_256_bit_secret_key
JWT_EXPIRATION_MS=86400000

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📊 Database Schema

The system uses 12 interconnected tables:
- `users` - User accounts
- `roles` - User roles
- `candidates` - Candidate profiles
- `supervisors` - Supervisor/mentor data
- `projects` - Project ideas
- `applications` - Application workflow
- `quizzes` - Quiz definitions
- `quiz_questions` - Quiz questions
- `quiz_attempts` - Quiz results
- `notifications` - Alert system
- `audit_logs` - Activity tracking
- `ai_rankings` - AI matching scores

## 🔐 Security Features

- JWT stateless authentication
- BCrypt password hashing (cost factor 10)
- Role-based endpoint protection
- Rate limiting (10 requests/minute)
- SQL injection prevention
- XSS protection
- CORS configuration
- Complete audit logging

## 🎨 UI Screenshots

The application features:
- Modern, responsive design
- Professional color scheme
- Interactive dashboards
- Real-time updates
- Form validation
- Loading states
- Error handling

## 📝 License

This project is for educational purposes.

## 👤 Author

**Ayadi Youssef**  
- Institution: IIT - Institut International de Technologie Sfax  
- Supervisor: Rahma Bouaziz  
- Company: Clinisys  
- Year: 2026

---

<p align="center">Made with ❤️ for academic excellence</p>