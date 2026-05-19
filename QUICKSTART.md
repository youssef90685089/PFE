# SIPMS – Quick Start Guide

## Prerequisites

| Tool | Version |
|------|---------|
| JDK | 17+ |
| Node.js | 18+ |
| MySQL | 8.0+ |
| Maven | 3.8+ |

## Installation

### 1. Clone & Configure

```bash
git clone https://github.com/ayadiyoussef/sipms.git
cd sipms
cp backend/.env.example backend/.env  # Edit with your values
```

### 2. Database Setup

```sql
CREATE DATABASE sipms_db;
mysql -u root -p sipms_db < database/schema.sql
mysql -u root -p sipms_db < database/data.sql
```

### 3. Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sipms.com | Admin@123 |
| Manager | manager@sipms.com | Admin@123 |
| Receptionist | receptionist@sipms.com | Admin@123 |
| Candidate | Register via UI | — |

## Access Points

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html

## Docker Deployment

```bash
docker-compose up --build
```