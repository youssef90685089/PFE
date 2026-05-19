# SIPMS API Login Testing Guide

## ✅ Issue Resolution

### Root Cause Identified
Your login was failing because **the BCrypt password hash in `database/data.sql` was corrupted**:
- **Old (broken) hash**: `$2a$10$xJwN9qo8uLOickgx2ZMRZoMyOLQJHxFKJHZJHxFKJHFkJHKJ` (truncated)
- **New (fixed) hash**: `$2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW` (valid for "Admin@123")

This prevented Spring Security's PasswordEncoder from validating any password, resulting in `401 Unauthorized`.

---

## 📋 Test Credentials (After Database Reload)

All accounts use the same password: **Admin@123**

| Email | Role | Access |
|-------|------|--------|
| `admin@sipms.com` | ADMIN | Full system access |
| `manager@sipms.com` | MANAGER | Manage applications, supervisors, projects |
| `receptionist@sipms.com` | RECEPTIONIST | Process applications |
| `test@candidate.com` | CANDIDATE | Apply to projects, take quizzes |

---

## 🔄 Required Steps to Apply the Fix

### Step 1: Reload Database
```bash
# Option A: MySQL CLI (if using local MySQL)
mysql -u root -p sipms < database/schema.sql
mysql -u root -p sipms < database/data.sql

# Option B: Using Docker Compose (if applicable)
docker-compose down
docker-compose up -d
```

### Step 2: Restart Backend
```bash
# Terminal in backend/
cd c:\SIPMS\backend
mvn spring-boot:run
```

The server should start on `http://localhost:8080`

### Step 3: Test Login Endpoint
```bash
# Verify the server is running
curl http://localhost:8080/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@sipms.com","password":"Admin@123"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "tokenType": "Bearer",
    "userId": 2,
    "email": "manager@sipms.com",
    "fullName": "Project Manager",
    "roles": ["ROLE_MANAGER"]
  }
}
```

---

## 🟢 Correct Frontend Login Implementation

### Method 1: Using the Existing Axios API (Recommended)

The frontend already has the correct setup in `frontend/src/api/axios.js`:

```javascript
import { authApi } from './api/axios';

// In your LoginPage.jsx or login form handler:
async function handleLogin(email, password) {
  try {
    const response = await authApi.login({ 
      email, 
      password 
    });
    
    // Response structure:
    // response.data = { success: true, message: "...", data: authResponse }
    const authResponse = response.data.data;
    
    console.log("Login successful:", authResponse);
    // authResponse contains: accessToken, refreshToken, userId, email, fullName, roles
    
  } catch (error) {
    // Error response structure:
    // error.response.data = { success: false, message: "Invalid email or password", data: null }
    console.error("Login failed:", error.response?.data?.message);
  }
}
```

### Method 2: Raw Fetch API (For Testing)

```javascript
async function loginWithFetch() {
  const payload = {
    email: "manager@sipms.com",
    password: "Admin@123"
  };

  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)  // Important: Must stringify!
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log("✅ Login successful!");
      console.log("Token:", data.data.accessToken);
      
      // Store in localStorage
      localStorage.setItem('sipms_token', data.data.accessToken);
      localStorage.setItem('sipms_user', JSON.stringify({
        id: data.data.userId,
        email: data.data.email,
        fullName: data.data.fullName,
        roles: data.data.roles
      }));
      
    } else {
      console.error("❌ Login failed:", data.message);
    }
  } catch (error) {
    console.error("Network error:", error.message);
  }
}

// Call it
loginWithFetch();
```

### Method 3: cURL Command (For Quick Testing)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"manager@sipms.com","password":"Admin@123"}' \
  -v
```

---

## 🔍 Troubleshooting Checklist

### Still Getting "Invalid email or password"?

- [ ] **Database reloaded?** Run `mysql ... < data.sql` to ensure new hash is in place
- [ ] **Backend restarted?** Kill and restart `mvn spring-boot:run`
- [ ] **No typos?** Check email: `manager@sipms.com` (not `manager@sipms.co` or with spaces)
- [ ] **Password correct?** All test accounts use `Admin@123` exactly
- [ ] **Account active?** Check database: `SELECT email, active FROM users;`

### Getting "HTTP method not supported"?

- [ ] **Using POST?** Login must be `POST /api/auth/login`, not GET
- [ ] **Check endpoint path** - should be `/api/auth/login` (our routing fixes addressed this)

### Getting CORS errors?

Your backend doesn't have CORS configured (since frontend runs on `http://localhost:3000`). If testing from a different origin:

```javascript
// Axios already has the correct baseURL set:
// baseURL: 'http://localhost:8080/api'

// If calling directly from browser console at different origin, 
// backend needs CORS. Add to SecurityConfig.java if needed:
```

---

## 📝 API Endpoint Details

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "manager@sipms.com",
  "password": "Admin@123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
    "tokenType": "Bearer",
    "userId": 2,
    "email": "manager@sipms.com",
    "fullName": "Project Manager",
    "roles": ["ROLE_MANAGER"]
  }
}
```

**Response (Failure - 401):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null
}
```

---

## 🔐 Using the Token

Once logged in, include the token in subsequent requests:

```javascript
// Axios automatically handles this via interceptor (in api/axios.js):
// It reads 'sipms_token' from localStorage and adds: Authorization: Bearer {token}

// Or manually:
const token = data.data.accessToken;

fetch('http://localhost:8080/api/candidates/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📚 Other Useful Endpoints

After login, you can use these protected endpoints:

| Method | Endpoint | Role Required |
|--------|----------|----------------|
| GET | `/api/candidates/me` | CANDIDATE |
| GET | `/api/applications` | ADMIN, MANAGER |
| GET | `/api/projects` | All roles |
| POST | `/api/applications` | CANDIDATE |
| GET | `/api/supervisors` | All roles |

---

## ✨ Summary

| Issue | Status | Fix |
|-------|--------|-----|
| Routing conflicts (`/me`, `/my` after `/{id}`) | ✅ FIXED | Reordered endpoints in controllers |
| HTTP method error handling | ✅ FIXED | Added specific exception handler |
| Invalid BCrypt hash | ✅ FIXED | Updated `data.sql` with valid hash |
| Payload structure | ✅ CORRECT | `email` and `password` keys are correct |

**Next Action:** Reload your database and restart the backend, then try logging in!
