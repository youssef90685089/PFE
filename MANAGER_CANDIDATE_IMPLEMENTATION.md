# Manager Candidate Creation & Quiz Implementation - Summary

## 📋 What Was Implemented

The manager now has a **"New Candidate & Quiz"** button in the Candidates page that allows creating a candidate and immediately sending the quiz in one workflow.

### Features
✅ Create candidate profile directly from manager interface  
✅ Optionally add internship file details (year, university, degree, skills)  
✅ Automatically create user account and send quiz email  
✅ 2-step modal form with clear progress  
✅ Toast notifications for success/error  
✅ Auto-refresh candidate list after creation  

---

## 🔧 Files Modified/Created

### Backend
- ✅ **NEW:** `ApproveAndSendQuizRequest.java` - DTO for manager approval request
- ✅ **UPDATED:** `CandidateController.java` - Added `/approve-and-send-quiz` endpoint
- ✅ **UPDATED:** `CandidateService.java` - Added `approveAndSendQuiz()` method

### Frontend
- ✅ **NEW:** `ManagerCreateCandidateModal.jsx` - Modal component for candidate creation
- ✅ **UPDATED:** `CandidatesPage.jsx` - Integrated modal and new button
- ✅ **UPDATED:** `axios.js` - Added `approveAndSendQuiz` API call

---

## 🎯 Workflow (Manager Interface)

```
Step 1: Click "+ New Candidate & Quiz" button
   ↓
Step 2: Enter Candidate Profile
   - First Name*
   - Last Name*
   - Email*
   - Phone (optional)
   - CIN (optional)
   ↓
Step 3: (Optional) Add Internship File
   - Graduation Year
   - University
   - Degree/Program
   - Skills (comma-separated)
   ↓
Step 4: Click "Create & Send Quiz"
   - Profile created in database
   - Internship file added (if provided)
   - User account created
   - Quiz email sent
   ↓
Step 5: Candidate receives email
   - Can login with temp password
   - Must change password on first login
   - Can access and complete quiz

Result: Candidate appears in list with "Active ✓" badge
```

---

## ✨ UI Components

### Candidates Page
```
┌─────────────────────────────────────────────────────────┐
│  Candidates                                    [+ New... ]  │
│  5 registered candidates                                │
├─────────────────────────────────────────────────────────┤
│ Name      │ Email        │ Phone   │ Status  │ Action  │
├───────────┼──────────────┼─────────┼─────────┼─────────┤
│ Ahmed     │ ahmed@...    │ 555-123 │ ⏳ Pend │ Approve │
│ Fatma     │ fatma@...    │ 555-456 │ ✓ Active│ Invited │
│ ...       │ ...          │ ...     │ ...     │ ...     │
└─────────────────────────────────────────────────────────┘
```

### Modal Form
```
┌──────────────────────────────────────────────┐
│  New Candidate & Quiz                     [X] │
├──────────────────────────────────────────────┤
│  ███░░░░░░  Progress                        │
│                                              │
│  Step 1: Candidate Profile                  │
│  ┌──────────────────────────────────────┐   │
│  │ First Name        │ Last Name        │   │
│  │ [Ahmed        ]   │ [Hassan      ]   │   │
│  │                                      │   │
│  │ Email Address                        │   │
│  │ [ahmed@student.uni.tn            ]   │   │
│  │                                      │   │
│  │ Phone             │ CIN              │   │
│  │ [+216-98-765...] │ [12345678    ]   │   │
│  └──────────────────────────────────────┘   │
│  [Cancel]  [Next →]                         │
└──────────────────────────────────────────────┘
```

---

## 🧪 Testing Instructions

### 1. Test Backend Compilation
```bash
cd backend
mvn clean compile
# Should show: BUILD SUCCESS
```

### 2. Test Endpoint (curl)
```bash
# Create candidate
curl -X POST http://localhost:8080/api/candidates \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Candidate",
    "email": "test@example.com",
    "phone": "555-1234",
    "cin": "12345678"
  }'

# Response:
# {
#   "success": true,
#   "message": "Candidate created",
#   "data": {
#     "id": 99,
#     "firstName": "Test",
#     "lastName": "Candidate",
#     "email": "test@example.com",
#     "hasUserAccount": false
#   }
# }

# Approve and send quiz
curl -X POST http://localhost:8080/api/candidates/99/approve-and-send-quiz \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quizTitle": "SIPMS Assessment"
  }'

# Response:
# {
#   "success": true,
#   "message": "Candidate approved and quiz invitation sent successfully",
#   "data": {
#     "id": 99,
#     "firstName": "Test",
#     "lastName": "Candidate",
#     "email": "test@example.com",
#     "active": true,
#     "status": "pending_quiz"
#   }
# }
```

### 3. Test Frontend (Manual)

1. **Login as Manager**
   - Go to http://localhost:5173/login
   - Use manager credentials

2. **Navigate to Candidates Page**
   - Click "Candidates" in sidebar
   - Should see existing candidates list

3. **Test "New Candidate & Quiz" Button**
   - Click blue "+ New Candidate & Quiz" button
   - Modal should open

4. **Fill Step 1 (Candidate Profile)**
   - Enter: FirstName = "John", LastName = "Doe", Email = "john@example.com"
   - Click "Next →"

5. **Fill Step 2 (Internship File - Optional)**
   - Enter: Year = 2024, University = "Sfax University", Degree = "CS"
   - Skills = "Java, Spring Boot, React"
   - Click "Create & Send Quiz"

6. **Verify Results**
   - Should see toast: "✓ Candidate profile created"
   - Should see toast: "✓ Internship file added"
   - Should see toast: "✓ Account created & quiz email sent!"
   - Modal closes
   - New candidate appears in list with "Active ✓" badge
   - Email received at john@example.com with quiz link

### 4. Permission Testing
- ✅ Manager can create candidates + send quiz
- ✅ Admin can create candidates + send quiz
- ❌ Receptionist cannot see the button (no "New Candidate & Quiz" button)
- ❌ Candidate cannot access manager interface

---

## 🔄 API Endpoints

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| POST | `/api/candidates` | MANAGER, ADMIN | Create candidate (from modal) |
| POST | `/candidates/{id}/internship-files` | MANAGER, ADMIN | Add internship file |
| POST | `/candidates/{id}/approve-and-send-quiz` | MANAGER, ADMIN | **NEW: Approve & send quiz** |

---

## 📧 Email Flow

When manager clicks "Create & Send Quiz":

1. **Request received:** POST `/candidates/{id}/approve-and-send-quiz`
2. **Backend:**
   - Fetches candidate profile
   - Generates temp password
   - Creates User account (status="pending_quiz")
   - Links candidate.user_id to new user
   - Calls emailService.sendCandidateWelcomeEmail()

3. **Email sent to candidate:**
   ```
   Subject: SIPMS Internship Assessment - Quiz Invitation
   
   Dear [First Name] [Last Name],
   
   Welcome to the SIPMS system!
   
   Your login credentials:
   Email: [email]
   Temporary Password: [AUTO_GENERATED]
   
   Please log in here: http://localhost:5173/login
   
   You will be prompted to change your password on first login.
   
   After changing your password, you can access your quiz:
   SIPMS Internship Assessment
   
   Best regards,
   SIPMS Team
   ```

4. **Frontend:** Shows success toast and refreshes candidate list

---

## 🛠️ Troubleshooting

### Issue: "Candidate already has a user account"
**Cause:** Trying to approve a candidate that was already approved  
**Solution:** Reload page or check if candidate status is "Active ✓"

### Issue: "Role ROLE_CANDIDATE not found"
**Cause:** Database missing ROLE_CANDIDATE role  
**Solution:** Check if roles table has: `INSERT INTO roles (name) VALUES ('ROLE_CANDIDATE');`

### Issue: Email not received
**Cause:** Email service configuration issue  
**Solution:** 
- Check backend logs for email errors
- Verify SMTP settings in application.properties
- Check if email goes to spam folder

### Issue: Modal not showing
**Cause:** Component not imported or manager role not recognized  
**Solution:**
- Verify you're logged in as manager (check console: user.roles)
- Clear browser cache and reload
- Check browser console for JavaScript errors

---

## 📝 Database Verification

To check if candidate was created correctly:

```sql
-- Check candidate was created
SELECT id, first_name, last_name, email, user_id FROM candidates 
WHERE email = 'test@example.com';

-- Check user account was created
SELECT id, email, status, active FROM users 
WHERE email = 'test@example.com';

-- Check internship file
SELECT id, year, university, degree FROM internship_files 
WHERE candidate_id = (SELECT id FROM candidates WHERE email = 'test@example.com');

-- Check user roles
SELECT u.id, u.email, r.name 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id 
WHERE u.email = 'test@example.com';
```

Expected result: User should have `ROLE_CANDIDATE` role

---

## ✅ Checklist Before Production

- [ ] Backend compiles without errors: `mvn clean compile`
- [ ] ApproveAndSendQuizRequest DTO exists
- [ ] CandidateService.approveAndSendQuiz() method exists
- [ ] CandidateController has `/approve-and-send-quiz` endpoint
- [ ] Frontend modal component created
- [ ] CandidatesPage integrates modal
- [ ] axios.js has `approveAndSendQuiz` API call
- [ ] Manager can see "+ New Candidate & Quiz" button
- [ ] Email is sent after approval
- [ ] Candidate appears in list with correct status
- [ ] Database records created correctly
- [ ] No console errors in browser
- [ ] Permission checks working (only MANAGER/ADMIN can access)

---

## 🎉 Summary

The manager can now create a candidate and immediately trigger the quiz workflow with a single button click, providing a streamlined onboarding experience directly from the manager dashboard.

**Flow:** Click button → Fill form → User account created → Quiz email sent → Done!
