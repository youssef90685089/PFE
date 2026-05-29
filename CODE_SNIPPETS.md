# SIPMS Refactoring: Ready-to-Use Code Snippets

Copy these directly into your project to implement the refactoring.

---

## 1. NEW DTO: ApproveAndSendQuizRequest.java

**Location:** `backend/src/main/java/com/project/sipms/dto/ApproveAndSendQuizRequest.java`

```java
package com.project.sipms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload when a manager approves a candidate and sends quiz.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveAndSendQuizRequest {
    
    /**
     * Optional quiz title. Defaults to "Internship Quiz" if not provided.
     */
    private String quizTitle;

    /**
     * Optional custom email message to include in the invitation.
     */
    private String customEmailMessage;

    /**
     * Whether to send notification to other managers (optional feature).
     */
    private Boolean notificationEnabled;
}
```

---

## 2. UPDATE: CandidateService.java - Key Method Changes

**Location:** `backend/src/main/java/com/project/sipms/service/CandidateService.java`

### Step 1: Update the method name and logic

```java
// ── OLD METHOD (DELETE THIS) ──────────────────────────────────
// @Transactional
// public User inviteAndSendQuiz(Long candidateId, String quizTitle) { ... }

// ── NEW METHOD (ADD THIS) ─────────────────────────────────────

/**
 * Manager approves candidate and sends quiz invitation.
 * This creates the user account and sends the welcome email.
 * 
 * @param candidateId The candidate to approve
 * @param req Request with optional quizTitle
 * @return The created User account
 * @throws BusinessException if candidate already has account
 */
@Transactional
public User approveAndSendQuiz(Long candidateId, ApproveAndSendQuizRequest req) {
    Candidate candidate = candidateRepository.findById(candidateId)
            .orElseThrow(() -> new ResourceNotFoundException("Candidate", candidateId));

    if (candidate.isHasUserAccount()) {
        throw new BusinessException("Candidate already has a user account");
    }

    String quizTitle = (req != null && req.getQuizTitle() != null) 
        ? req.getQuizTitle() 
        : "Internship Quiz";

    // 1. Generate temporary password
    String rawPassword = generateTempPassword();

    // 2. Create User account
    Role candidateRole = roleRepository.findByName("ROLE_CANDIDATE")
            .orElseThrow(() -> new BusinessException("Role ROLE_CANDIDATE not found"));

    User user = User.builder()
            .firstName(candidate.getFirstName())
            .lastName(candidate.getLastName())
            .email(candidate.getEmail())
            .phone(candidate.getPhone())
            .cin(candidate.getCin())
            .passwordHash(passwordEncoder.encode(rawPassword))
            .active(true)
            .mustChangePassword(true)
            .roles(java.util.Set.of(candidateRole))
            .status("pending_quiz")
            .build();

    user = userRepository.save(user);

    // 3. Link candidate to user account
    candidate.setUser(user);
    candidateRepository.save(candidate);

    // 4. Send welcome email
    try {
        emailService.sendCandidateWelcomeEmail(
                candidate.getEmail(),
                candidate.getFirstName() + " " + candidate.getLastName(),
                rawPassword,
                "http://localhost:5173/login",
                quizTitle
        );
    } catch (Exception e) {
        System.err.println("Welcome email failed for " + candidate.getEmail() 
            + ": " + e.getMessage());
    }

    return user;
}
```

---

## 3. UPDATE: CandidateController.java - Add New Endpoint

**Location:** `backend/src/main/java/com/project/sipms/controller/CandidateController.java`

### Add this new method to the controller:

```java
import com.project.sipms.dto.ApproveAndSendQuizRequest;
import com.project.sipms.entity.User;

// ... existing code ...

/**
 * Manager approval endpoint: Create user account and send quiz email.
 * Only accessible to MANAGER and ADMIN roles.
 */
@PostMapping("/{candidateId}/approve-and-send-quiz")
@PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
@Operation(summary = "Manager approval: create user account & send quiz email",
           description = "Creates a user account for the candidate and sends quiz invitation email. " +
                        "Only callable by Manager or Admin roles.")
public ResponseEntity<ApiResponse<UserDto>> approveAndSendQuiz(
        @PathVariable Long candidateId,
        @RequestBody(required = false) ApproveAndSendQuizRequest req) {
    
    if (req == null) {
        req = new ApproveAndSendQuizRequest();
    }
    
    User user = candidateService.approveAndSendQuiz(candidateId, req);
    UserDto userDto = UserDto.fromEntity(user);
    
    return ResponseEntity.ok(
        ApiResponse.ok("Candidate approved and quiz invitation sent successfully", userDto)
    );
}
```

**Also update the existing `/candidates` POST endpoint comments:**

```java
/**
 * Create a new candidate profile ONLY (no user account or email).
 * Receptionists use this to register new candidates.
 */
@PostMapping
@PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
@Operation(summary = "Create candidate profile (no account)",
           description = "Creates a candidate profile without creating a user account or sending email. " +
                        "Manager must later approve using the /approve-and-send-quiz endpoint.")
public ResponseEntity<ApiResponse<CandidateDto>> createCandidate(
        @Valid @RequestBody CreateCandidateRequest req) {
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Candidate profile created successfully", 
                candidateService.createCandidate(req)));
}
```

---

## 4. UPDATE: Frontend axios.js

**Location:** `frontend/src/api/axios.js`

Replace the `candidatesApi` section:

```javascript
// ── Candidates API (UPDATED) ──────────────────────────────
export const candidatesApi = {
  // Create candidate profile ONLY (no user account)
  create: (data) => api.post('/candidates', data),
  
  // Get candidates
  getAll: () => api.get('/candidates'),
  getById: (id) => api.get(`/candidates/${id}`),
  delete: (id) => api.delete(`/candidates/${id}`),
  
  // Internship Files
  addInternshipFile: (cid, data) => api.post(`/candidates/${cid}/internship-files`, data),
  getInternshipFiles: (cid) => api.get(`/candidates/${cid}/internship-files`),
  deleteInternshipFile: (fid) => api.delete(`/candidates/internship-files/${fid}`),
  
  // ✓ NEW: Manager approval endpoint
  approveAndSendQuiz: (cid, req) => api.post(
    `/candidates/${cid}/approve-and-send-quiz`,
    req || { quizTitle: 'Internship Quiz' }
  ),
};
```

---

## 5. UPDATE: CandidatesPage.jsx - Core Changes

**Location:** `frontend/src/pages/dashboard/CandidatesPage.jsx`

### Replace the handleInvite function:

```jsx
// DELETE the old function:
// const handleInvite = async (candidateId) => { ... }

// ADD the new function:
const handleApproveAndSendQuiz = async (candidateId) => {
  setApproving(candidateId);
  try {
    const res = await candidatesApi.approveAndSendQuiz(candidateId, {
      quizTitle: 'Internship Qualification Quiz',
    });

    if (res.data?.success) {
      toast.success('✓ Account created & quiz email sent!');
      // Refresh the list
      const r = await candidatesApi.getAll();
      setCandidates(r.data?.data || []);
    } else {
      toast.error(res.data?.message || 'Failed to approve candidate');
    }
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || 'Failed to approve candidate';
    toast.error(errorMsg);
    console.error('Approval error:', err);
  } finally {
    setApproving(null);
  }
};
```

### Update the action column render:

```jsx
// OLD code in columns array:
// render: (r) => (
//   !r.hasUserAccount ? (
//     <button onClick={() => handleInvite(r.id)} ...>
//       Send Quiz & Invite
//     </button>
//   ) : (...)
// )

// NEW code:
render: (r) => (
  !r.hasUserAccount ? (
    <button
      onClick={() => handleApproveAndSendQuiz(r.id)}
      disabled={approving === r.id}
      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap"
      title="Manager approval: create account & send quiz"
    >
      {approving === r.id ? (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        <Send className="h-3.5 w-3.5" />
      )}
      Approve & Send Quiz
    </button>
  ) : (
    <span className="text-xs text-surface-400 italic">Approved ✓</span>
  )
)
```

---

## 6. OPTIONAL: Import Statement Update

Make sure your CandidateService has:

```java
import com.project.sipms.dto.ApproveAndSendQuizRequest;
// ... other imports ...
```

And CandidateController has:

```java
import com.project.sipms.dto.ApproveAndSendQuizRequest;
import com.project.sipms.entity.User;
import com.project.sipms.dto.UserDto;
// ... other imports ...
```

---

## Testing Commands

### 1. Create Candidate (No Email)
```bash
curl -X POST http://localhost:8080/api/candidates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phone": "555-0123",
    "cin": "87654321"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Candidate profile created successfully",
  "data": {
    "id": 5,
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "hasUserAccount": false,
    "internshipFiles": []
  }
}
```

### 2. Manager Approves (Creates Account + Sends Email)
```bash
curl -X POST http://localhost:8080/api/candidates/5/approve-and-send-quiz \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quizTitle": "Internship Qualification Quiz"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Candidate approved and quiz invitation sent successfully",
  "data": {
    "id": 5,
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "active": true,
    "status": "pending_quiz"
  }
}
```

### 3. Check Database
```sql
-- Verify candidate doesn't have user until approved
SELECT c.id, c.email, c.user_id, u.id as user_account_id
FROM candidates c
LEFT JOIN users u ON c.user_id = u.id
WHERE c.email = 'jane.smith@example.com';
```

---

## Validation Checklist

- [ ] `POST /api/candidates` - Candidate created, `user_id` is NULL
- [ ] `POST /api/candidates/{id}/approve-and-send-quiz` - User created, `user_id` populated
- [ ] Email sent to candidate after approval
- [ ] Unapproved candidates show "Pending" badge
- [ ] Approved candidates show "Active ✓" status
- [ ] Button disabled while request in progress
- [ ] Toast notifications appear on success/error
- [ ] Role-based access control works (Receptionists can't approve)
