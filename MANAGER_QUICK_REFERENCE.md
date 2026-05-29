# 🎯 Manager Candidate Creation & Quiz - Quick Reference

## 📱 What the Manager Sees

### Before (Old Flow)
```
Candidates Page
├─ Candidates list
└─ [Approve & Send Quiz] button on each pending candidate
   (Must wait for reception to create candidate first)
```

### After (New Flow) ✨
```
Candidates Page
├─ [+ New Candidate & Quiz] button at top RIGHT ← NEW!
│
├─ Candidates list (same as before)
│  ├─ Candidate 1 | ⏳ Pending    | [Approve & Send]
│  ├─ Candidate 2 | ✓ Active     | [Invited]
│  └─ Candidate 3 | ⏳ Pending    | [Approve & Send]
│
└─ Modal Form (NEW!)
   ├─ Step 1: Candidate Profile
   │  ├─ First Name
   │  ├─ Last Name
   │  ├─ Email
   │  ├─ Phone
   │  └─ CIN
   │
   └─ Step 2: Internship File (Optional)
      ├─ Year
      ├─ University
      ├─ Degree
      └─ Skills
```

---

## 🔘 Button Location

```
Page Layout:

┌─────────────────────────────────────────────────────────────┐
│                        Candidates Dashboard                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [Sidebar]  │  Candidates                    [+ New Cand... ]│
│             │  5 registered candidates        ↑              │
│             │  ┌─────────────────────────┐    │              │
│             │  │ List of candidates      │    │ NEW BUTTON! │
│             │  │ (with their status)     │    │              │
│             │  └─────────────────────────┘    │              │
│             │                                  │              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Modal Form Steps

### Step 1: Candidate Profile (Required)
```
┌──────────────────────────────────────────────────┐
│ New Candidate & Quiz                          [X]│
├──────────────────────────────────────────────────┤
│ ███░░░░░░░░░░░  Step 1 of 2                     │
│                                                  │
│ Step 1: Candidate Profile                       │
│ ─────────────────────────────────────────────   │
│                                                  │
│ [First Name    ]  [Last Name        ]           │
│ [Ahmed      ]     [Hassan       ]               │
│                                                  │
│ [Email Address                    ]             │
│ [ahmed.hassan@university.tn    ]               │
│                                                  │
│ [Phone             ]  [CIN          ]           │
│ [+216-98-765-4321 ]  [12345678 ]                │
│                                                  │
│ [Cancel]  [Next →]                             │
└──────────────────────────────────────────────────┘
```

### Step 2: Internship File (Optional)
```
┌──────────────────────────────────────────────────┐
│ New Candidate & Quiz                          [X]│
├──────────────────────────────────────────────────┤
│ ████████░░░░░░░░  Step 2 of 2                   │
│                                                  │
│ Step 2: Internship File (Optional)              │
│ Add details about their internship              │
│ ─────────────────────────────────────────────   │
│                                                  │
│ [Graduation Year            ]                   │
│ [2024                    ]                       │
│                                                  │
│ [University (optional)                    ]     │
│ [University of Sfax                    ]        │
│                                                  │
│ [Degree/Program (optional)                 ]    │
│ [Bachelor in Computer Science            ]      │
│                                                  │
│ [Skills (comma separated, optional)  ]          │
│ ┌─────────────────────────────────────────┐    │
│ │ Java, Spring Boot, REST APIs,           │    │
│ │ MySQL, React                            │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ℹ️ After creation, an account will be created   │
│    and a quiz invitation email will be sent     │
│    automatically.                               │
│                                                  │
│ [← Back] [Skip Files] [Create & Send Quiz 🔄] │
└──────────────────────────────────────────────────┘
```

---

## ⚡ One-Click Action

### Traditional Approach (Multi-Step)
```
1. Reception staff creates candidate profile
   └─ Wait for approval
   
2. Manager logs in
   └─ Views candidates page
   
3. Manager finds pending candidate
   └─ Clicks "Approve & Send Quiz"
   
4. Backend creates account + sends email
   └─ Done (3-4 interactions)
```

### Manager Direct Approach (NEW) ✨
```
1. Manager clicks "+ New Candidate & Quiz"
   └─ Fills form (2 steps)
   
2. Manager clicks "Create & Send Quiz"
   └─ User account created
   └─ Email sent
   └─ Done (1-2 interactions!)
```

---

## 🔄 Action Sequence

### When Manager Clicks "Create & Send Quiz"

```
Frontend                          Backend                        Database
                                   │
Modal Form ──────────────►         │
  ├─ firstName                     │
  ├─ lastName          ┌───────────▼─────────────────┐
  ├─ email            │ 1. Create Candidate         │
  ├─ phone            │    - Save profile           │
  └─ cin              │    - user_id = NULL         │
                      └────────────┬─────────────────┘
                                   │
                       ┌───────────▼─────────────────┐
                       │ 2. Add Internship File      │
                       │    (if provided)            │
                       └────────────┬─────────────────┘
                                   │
                       ┌───────────▼─────────────────┐
                       │ 3. Create User Account      │
                       │    - Generate password      │
                       │    - Encode & save user     │
                       │    - Set status="quiz"      │
                       │    - Link to candidate      │
                       └────────────┬─────────────────┘
                                   │
                       ┌───────────▼─────────────────┐
                       │ 4. Send Welcome Email       │
                       │    - Include temp password  │
                       │    - Include quiz link      │
                       │    - Include login URL      │
                       └────────────┬─────────────────┘
                                   │
Response ◄────────────────────────┤
  ├─ "✓ Candidate created"        │
  ├─ "✓ Internship file added"    │
  └─ "✓ Quiz email sent!"         │
                                   │
Modal closes                       │
List refreshes                     │
New candidate shows               ✓ Active badge
```

---

## 🎨 UI Changes

### Candidates List - Status Badges

**Before Manager Approval:**
```
┌──────────────────────────────────────────────────┐
│ Name        │ Email            │ Status         │
├──────────────────────────────────────────────────┤
│ Ahmed       │ ahmed@uni.tn     │ ⏳ Pending      │
└──────────────────────────────────────────────────┘
```

**After Manager Approval:**
```
┌──────────────────────────────────────────────────┐
│ Name        │ Email            │ Status         │
├──────────────────────────────────────────────────┤
│ Ahmed       │ ahmed@uni.tn     │ ✓ Active       │
└──────────────────────────────────────────────────┘
```

### Action Column

**Pending (Manager can approve):**
```
[Approve & Send Quiz] ← Green button
```

**Already Approved:**
```
Approved ✓ ← Gray text
```

---

## 📊 Data Flow Diagram

```
Manager Interface
    │
    ├─ View: Candidates List
    │  ├─ See all candidates
    │  ├─ See their status (⏳ Pending / ✓ Active)
    │  ├─ Can approve pending ones with button
    │  └─ Can create new ones with "+ New Candidate & Quiz"
    │
    └─ Action: "+ New Candidate & Quiz"
       ├─ Open Modal
       ├─ Fill Candidate Profile (Required)
       │  ├─ firstName
       │  ├─ lastName
       │  ├─ email
       │  ├─ phone (optional)
       │  └─ cin (optional)
       │
       ├─ Fill Internship File (Optional)
       │  ├─ year
       │  ├─ university
       │  ├─ degree
       │  └─ skillsTags
       │
       └─ Submit "Create & Send Quiz"
          │
          ├─ POST /candidates (Create profile)
          │  └─ Response: {id: 5, hasUserAccount: false}
          │
          ├─ POST /candidates/5/internship-files (Optional)
          │  └─ Response: {id: 1, candidateId: 5}
          │
          ├─ POST /candidates/5/approve-and-send-quiz
          │  └─ Response: {id: 5, status: "pending_quiz", active: true}
          │     └─ User account created
          │     └─ Email sent to candidate
          │
          └─ Toast Notifications
             ├─ "✓ Candidate profile created"
             ├─ "✓ Internship file added"
             └─ "✓ Account created & quiz email sent!"
```

---

## 🎯 Use Cases

### Use Case 1: Quick Candidate Registration
```
Scenario: Manager attends a recruitment event and meets 10 candidates
Action: For each candidate, manager:
  1. Clicks "+ New Candidate & Quiz"
  2. Fills: name, email, phone
  3. Clicks "Create & Send Quiz"
Result: All 10 candidates get immediate quiz access
Time: ~30 seconds per candidate
```

### Use Case 2: Bulk Import + Approval
```
Scenario: Reception creates 5 candidate profiles, manager reviews
Action: Manager:
  1. Reviews each candidate profile in list
  2. For each: Clicks "Approve & Send Quiz" button
  3. OR: Creates new ones directly via modal
Result: Candidates receive quiz emails on approval
```

### Use Case 3: Direct Manager Onboarding
```
Scenario: Referral candidate walks in, wants to join program
Action: Manager:
  1. Clicks "+ New Candidate & Quiz"
  2. Fills complete profile + internship details
  3. Clicks "Create & Send Quiz"
Result: Candidate has account and quiz access immediately
```

---

## 🔐 Permission Model

```
Who Can See?
├─ Manager Role: ✅ Can see button + create candidates
├─ Admin Role: ✅ Can see button + create candidates
├─ Receptionist: ❌ Cannot see button (list-only view)
└─ Candidate: ❌ Cannot access manager interface

What Can They Do?
├─ MANAGER/ADMIN:
│  ├─ Click "+ New Candidate & Quiz"
│  ├─ Create new candidate profiles
│  ├─ Add internship files
│  ├─ Send quiz invitations
│  └─ Approve pending candidates
│
└─ RECEPTIONIST:
   ├─ Create candidates via separate form (old workflow)
   ├─ Add internship files
   └─ View candidate list only
```

---

## ✅ Implementation Complete!

All components are now in place:

✅ Backend:
  - ApproveAndSendQuizRequest DTO
  - CandidateService.approveAndSendQuiz() method
  - CandidateController endpoint

✅ Frontend:
  - ManagerCreateCandidateModal component
  - "+ New Candidate & Quiz" button
  - Integrated with CandidatesPage
  - API calls configured

✅ Database:
  - No schema changes needed
  - User account created on approval
  - Internship files linked to candidate

Ready for testing! 🚀
