# SIPMS Refactoring: Implementation Checklist

## Phase 1: Backend Service Layer (2-3 hours)

### CandidateService.java
- [x] Existing `createCandidate()` already works (NO user creation) ✓
- [x] Rename `inviteAndSendQuiz()` → `approveAndSendQuiz()` 
- [x] Add new `ApproveAndSendQuizRequest` DTO
- [ ] Add audit logging calls (new code)
- [ ] Update Javadoc to clarify workflow

**Files to modify:**
- `backend/src/main/java/com/project/sipms/service/CandidateService.java`
- `backend/src/main/java/com/project/sipms/dto/ApproveAndSendQuizRequest.java` (NEW)

---

## Phase 2: Controller Layer (1-2 hours)

### CandidateController.java
- [ ] Add new endpoint: `POST /api/candidates/{id}/approve-and-send-quiz`
- [ ] Add `@PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")` to approval endpoint
- [ ] Verify existing endpoints don't auto-approve
- [ ] Add Swagger/OpenAPI docs

**Files to modify:**
- `backend/src/main/java/com/project/sipms/controller/CandidateController.java`

---

## Phase 3: Frontend API Layer (30 mins)

### axios.js
- [ ] Update `candidatesApi.create()` comment to clarify "profile only"
- [ ] Replace `sendQuizAndInvite` with `approveAndSendQuiz`
- [ ] Verify endpoint paths match backend

**Files to modify:**
- `frontend/src/api/axios.js`

---

## Phase 4: Frontend UI (2-3 hours)

### CandidatesPage.jsx
- [ ] Rename button from "Send Quiz & Invite" → "Approve & Send Quiz"
- [ ] Update handler `handleInvite()` → `handleApproveAndSendQuiz()`
- [ ] Update status display logic
- [ ] Change color scheme (yellow → amber for "Pending")
- [ ] Add "+ New Candidate" button (optional)

**Files to modify:**
- `frontend/src/pages/dashboard/CandidatesPage.jsx`

### CandidateCreationModal.jsx (OPTIONAL)
- [ ] Create new modal component for inline creation
- [ ] Add form validation
- [ ] Add toast notifications

**Files to create:**
- `frontend/src/components/CandidateCreationModal.jsx`

---

## Phase 5: Testing (2 hours)

### Manual Testing
- [ ] Create candidate profile via API → No email sent
- [ ] Verify user_id is NULL in database
- [ ] Manager clicks "Approve & Send Quiz" → Email received
- [ ] Verify user account created in database
- [ ] Try to approve twice → Error message shown
- [ ] Add internship file before approval → Works
- [ ] Add internship file after approval → Works

### Endpoint Testing
```bash
# 1. Create candidate (no account)
curl -X POST http://localhost:8080/api/candidates \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "cin": "12345678"
  }'

# Expected: Candidate created, no email sent

# 2. Manager approves
curl -X POST http://localhost:8080/api/candidates/1/approve-and-send-quiz \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quizTitle": "Internship Quiz"
  }'

# Expected: User account created + email sent
```

---

## Phase 6: Deployment & Documentation

- [ ] Update QUICKSTART.md with new workflow
- [ ] Update API_DOCUMENTATION.md with new endpoint
- [ ] Create migration guide for existing users
- [ ] Update admin guidelines
- [ ] Notify stakeholders of workflow change

---

## Estimated Timeline
- **Phase 1 (Backend Service):** 2-3 hours
- **Phase 2 (Controller):** 1-2 hours
- **Phase 3 (API Layer):** 30 mins
- **Phase 4 (Frontend UI):** 2-3 hours
- **Phase 5 (Testing):** 2 hours
- **Phase 6 (Documentation):** 1 hour

**Total: ~10-11 hours (can be done in 1-2 sprints)**

---

## Rollback Plan

If issues arise:
1. Revert `CandidateService.java` to original
2. Keep both old and new endpoints temporarily
3. Use feature flag to toggle behavior
4. No database changes needed (user_id already nullable)
5. Data remains intact

---

## Success Criteria

✓ Candidate profile created without user account  
✓ Manager must approve before account creation  
✓ Quiz email only sent after manager approval  
✓ Internship files can be added at any time  
✓ Audit logs show who approved when  
✓ No auto-actions on candidate creation  
✓ Clear UI feedback on approval status  
