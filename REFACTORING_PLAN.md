# SIPMS Refactoring Plan: Candidate Profiles & Onboarding Workflow

**Objective:** Separate candidate profiles from annual internship files and implement manual manager-triggered onboarding.

---

## 1. Database Schema & Model Structure

### Current State (Already Correct ✓)
Your models already have the proper relationship structure:

```
Candidate (1) ──── (N) InternshipFile
   └─ OneToOne User (created on approval)
```

### Model Definitions (No Changes Needed to Structure)

#### **Candidate.java** (Entity)
```java
@Entity
@Table(name = "candidates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── CORE PROFILE ──────────────────────────────────────────
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 20)
    private String cin;

    // ── RELATIONSHIPS ─────────────────────────────────────────
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;  // NULL until manager approves

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, 
               orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<InternshipFile> internshipFiles = new ArrayList<>();

    // ── AUDIT ──────────────────────────────────────────────────
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isHasUserAccount() {
        return user != null;
    }
}
```

#### **InternshipFile.java** (Entity)
```java
@Entity
@Table(name = "internship_files")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InternshipFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── RELATIONSHIP ───────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    // ── ANNUAL DATA ────────────────────────────────────────────
    @Column(nullable = false)
    private Integer year;  // Graduation year or internship year

    @Column(length = 300)
    private String university;

    @Column(length = 200)
    private String degree;

    @Column(name = "skills_tags", length = 1000)
    private String skillsTags;

    // ── DOCUMENTS ──────────────────────────────────────────────
    @OneToMany(mappedBy = "internshipFile", cascade = CascadeType.ALL, 
               orphanRemoval = true)
    @Builder.Default
    private List<Document> documents = new ArrayList<>();

    // ── AUDIT ──────────────────────────────────────────────────
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

## 2. Backend Refactoring

### 2.1 DTOs

#### **CreateCandidateRequest.java** (Only accept profile data)
```java
public class CreateCandidateRequest {
    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    @Email
    private String email;

    private String phone;

    private String cin;

    // ✓ NO user/account fields — just raw candidate profile
}
```

#### **ApproveAndSendQuizRequest.java** (Manager approval payload)
```java
public class ApproveAndSendQuizRequest {
    private String quizTitle;  // Optional; defaults to "Internship Quiz"

    // Additional optional fields for future use:
    private String customEmailMessage;
    private Boolean notificationEnabled;
}
```

### 2.2 Service Layer Changes

#### **CandidateService.java** (Refactored)

```java
@Service
@Transactional
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final InternshipFileRepository internshipFileRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuditLogService auditLogService;  // For logging manager actions

    // ── PROFILE-ONLY CREATE (Step 1: Reception) ────────────────

    /**
     * Create a candidate profile WITHOUT creating a user account or sending email.
     * This is for receptionists entering candidate data.
     */
    public CandidateDto createCandidate(CreateCandidateRequest req) {
        if (candidateRepository.existsByEmail(req.getEmail())) {
            throw new BusinessException("Email already registered: " + req.getEmail());
        }

        Candidate candidate = Candidate.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .cin(req.getCin())
                .build();
        // ✓ user is NULL — no account yet

        candidate = candidateRepository.save(candidate);
        
        auditLogService.log("CANDIDATE_CREATED", 
            "Candidate profile created: " + candidate.getEmail(), 
            candidate.getId());

        return toDto(candidate);
    }

    // ── MANUAL APPROVAL (Step 2: Manager) ──────────────────────

    /**
     * Manager triggers: Create user account + send quiz invitation email.
     * This is called when manager clicks "Approve & Send Quiz" button.
     */
    public User approveAndSendQuiz(Long candidateId, ApproveAndSendQuizRequest req) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", candidateId));

        if (candidate.isHasUserAccount()) {
            throw new BusinessException("Candidate already has a user account");
        }

        String quizTitle = req.getQuizTitle() != null ? req.getQuizTitle() : "Internship Quiz";

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
                .roles(Set.of(candidateRole))
                .status("pending_quiz")
                .build();

        user = userRepository.save(user);

        // 3. Link candidate to user account
        candidate.setUser(user);
        candidateRepository.save(candidate);

        // 4. Send welcome email with quiz link
        try {
            emailService.sendCandidateWelcomeEmail(
                    candidate.getEmail(),
                    candidate.getFirstName() + " " + candidate.getLastName(),
                    rawPassword,
                    "http://localhost:5173/login",  // Frontend URL
                    quizTitle
            );
        } catch (Exception e) {
            // Log but don't fail — email issues shouldn't break account creation
            System.err.println("Welcome email failed for " + candidate.getEmail() + ": " + e.getMessage());
        }

        auditLogService.log("CANDIDATE_APPROVED", 
            "Manager approved and sent quiz: " + candidate.getEmail(), 
            candidate.getId());

        return user;
    }

    // ── INTERNSHIP FILES (Can be added at any time) ─────────────

    public InternshipFileDto addInternshipFile(Long candidateId, InternshipFileDto dto) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", candidateId));

        // Can add internship files before OR after account approval
        InternshipFile file = InternshipFile.builder()
                .candidate(candidate)
                .year(dto.getYear())
                .university(dto.getUniversity())
                .degree(dto.getDegree())
                .skillsTags(dto.getSkillsTags())
                .build();

        file = internshipFileRepository.save(file);
        return toFileDto(file);
    }

    public List<InternshipFileDto> getInternshipFiles(Long candidateId) {
        return internshipFileRepository.findByCandidateId(candidateId).stream()
                .map(this::toFileDto)
                .collect(Collectors.toList());
    }

    // ── HELPERS ────────────────────────────────────────────────

    private String generateTempPassword() {
        SecureRandom rnd = new SecureRandom();
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        StringBuilder sb = new StringBuilder(10);
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private CandidateDto toDto(Candidate c) {
        return CandidateDto.builder()
                .id(c.getId())
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .cin(c.getCin())
                .hasUserAccount(c.isHasUserAccount())
                .internshipFiles(c.getInternshipFiles().stream()
                    .map(this::toFileDto)
                    .collect(Collectors.toList()))
                .createdAt(c.getCreatedAt())
                .build();
    }

    private InternshipFileDto toFileDto(InternshipFile f) {
        return InternshipFileDto.builder()
                .id(f.getId())
                .candidateId(f.getCandidate().getId())
                .year(f.getYear())
                .university(f.getUniversity())
                .degree(f.getDegree())
                .skillsTags(f.getSkillsTags())
                .createdAt(f.getCreatedAt())
                .build();
    }
}
```

### 2.3 Controller Layer Changes

#### **CandidateController.java** (New/Refactored)

```java
@RestController
@RequestMapping("/api/candidates")
@Tag(name = "Candidates", description = "Candidate management")
public class CandidateController {

    private final CandidateService candidateService;

    // ── STEP 1: Create Candidate Profile Only (Reception Staff) ──

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Create candidate profile (no account)")
    public ResponseEntity<ApiResponse<CandidateDto>> createCandidate(
            @Valid @RequestBody CreateCandidateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Candidate profile created", 
                    candidateService.createCandidate(req)));
    }

    // ── STEP 2: Manager Approves & Sends Quiz (Manager Only) ─────

    @PostMapping("/{candidateId}/approve-and-send-quiz")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Manager approval: create user account & send quiz email")
    public ResponseEntity<ApiResponse<UserDto>> approveAndSendQuiz(
            @PathVariable Long candidateId,
            @RequestBody(required = false) ApproveAndSendQuizRequest req) {
        if (req == null) {
            req = new ApproveAndSendQuizRequest();
        }
        User user = candidateService.approveAndSendQuiz(candidateId, req);
        return ResponseEntity.ok(ApiResponse.ok("Candidate approved & quiz sent", 
            UserDto.fromEntity(user)));
    }

    // ── Standard CRUD ──────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'MANAGER')")
    @Operation(summary = "Get all candidates")
    public ResponseEntity<ApiResponse<List<CandidateDto>>> getAllCandidates() {
        return ResponseEntity.ok(ApiResponse.ok(candidateService.getAllCandidates()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'MANAGER')")
    @Operation(summary = "Get candidate by ID")
    public ResponseEntity<ApiResponse<CandidateDto>> getCandidateById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(candidateService.getCandidateById(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Delete candidate")
    public ResponseEntity<ApiResponse<Void>> deleteCandidate(@PathVariable Long id) {
        candidateService.deleteCandidate(id);
        return ResponseEntity.ok(ApiResponse.ok("Candidate deleted", null));
    }

    // ── Internship Files ──────────────────────────────────────

    @PostMapping("/{candidateId}/internship-files")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'MANAGER', 'CANDIDATE')")
    @Operation(summary = "Add internship file for a candidate")
    public ResponseEntity<ApiResponse<InternshipFileDto>> addInternshipFile(
            @PathVariable Long candidateId,
            @Valid @RequestBody InternshipFileDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Internship file added",
                    candidateService.addInternshipFile(candidateId, dto)));
    }

    @GetMapping("/{candidateId}/internship-files")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'MANAGER', 'CANDIDATE')")
    @Operation(summary = "Get all internship files for a candidate")
    public ResponseEntity<ApiResponse<List<InternshipFileDto>>> getInternshipFiles(
            @PathVariable Long candidateId) {
        return ResponseEntity.ok(ApiResponse.ok(
            candidateService.getInternshipFiles(candidateId)));
    }

    @DeleteMapping("/internship-files/{fileId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Delete internship file")
    public ResponseEntity<ApiResponse<Void>> deleteInternshipFile(@PathVariable Long fileId) {
        candidateService.deleteInternshipFile(fileId);
        return ResponseEntity.ok(ApiResponse.ok("Internship file deleted", null));
    }
}
```

---

## 3. Frontend Implementation

### 3.1 Update API Layer

#### **frontend/src/api/axios.js**
```javascript
// ── Candidates API (Updated) ──────────────────────────────
export const candidatesApi = {
  getAll:              ()          => api.get('/candidates'),
  getById:             (id)        => api.get(`/candidates/${id}`),
  // CHANGED: Now creates profile ONLY (no auto-account creation)
  create:              (data)      => api.post('/candidates', data),
  delete:              (id)        => api.delete(`/candidates/${id}`),
  
  // Internship Files
  addInternshipFile:   (cid, data) => api.post(`/candidates/${cid}/internship-files`, data),
  getInternshipFiles:  (cid)       => api.get(`/candidates/${cid}/internship-files`),
  deleteInternshipFile:(fid)       => api.delete(`/candidates/internship-files/${fid}`),
  
  // NEW: Manager approval endpoint (replaces old sendQuizAndInvite)
  approveAndSendQuiz:  (cid, req)  => api.post(`/candidates/${cid}/approve-and-send-quiz`, 
                                              req || { quizTitle: 'Internship Quiz' }),
};
```

### 3.2 Update CandidatesPage Component

#### **frontend/src/pages/dashboard/CandidatesPage.jsx**

```jsx
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { candidatesApi } from '../../api/axios';
import DataTable from '../../components/ui/DataTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Send, UserCheck, CheckCircle } from 'lucide-react';

export default function CandidatesPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);

  const isManager = user?.roles?.includes('ROLE_MANAGER') || user?.roles?.includes('MANAGER');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ADMIN');
  const canApprove = isManager || isAdmin;

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const res = await candidatesApi.getAll();
      setCandidates(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load candidates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manager clicks "Approve & Send Quiz" button.
   * This triggers user account creation and quiz email.
   */
  const handleApproveAndSendQuiz = async (candidateId) => {
    setApproving(candidateId);
    try {
      // Optional: can pass custom quiz title or other options here
      const res = await candidatesApi.approveAndSendQuiz(candidateId, {
        quizTitle: 'Internship Qualification Quiz',
      });

      if (res.data?.success) {
        toast.success('✓ Account created & quiz email sent!');
        // Refresh list to update hasUserAccount status
        await loadCandidates();
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

  const columns = [
    {
      header: 'Name',
      accessor: (r) => `${r.firstName || ''} ${r.lastName || ''}`,
      render: (r) => <span className="font-medium text-surface-800">{r.firstName} {r.lastName}</span>,
    },
    { 
      header: 'Email', 
      accessor: 'email' 
    },
    {
      header: 'Phone',
      accessor: (r) => r.phone || '—',
    },
    {
      header: 'CIN',
      accessor: (r) => r.cin || '—',
    },
    {
      header: 'Account Status',
      accessor: 'hasUserAccount',
      render: (r) => r.hasUserAccount ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 border border-green-200">
          <CheckCircle className="h-3.5 w-3.5" /> 
          Active
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
          ⏳ Pending
        </span>
      ),
    },
    {
      header: 'Files',
      accessor: (r) => r.internshipFiles?.length || 0,
      render: (r) => (
        <span className="text-xs text-surface-600 font-medium">
          {r.internshipFiles?.length || 0} file{(r.internshipFiles?.length || 0) !== 1 ? 's' : ''}
        </span>
      ),
    },
    ...(canApprove ? [{
      header: 'Action',
      accessor: 'id',
      render: (r) => (
        !r.hasUserAccount ? (
          <button
            onClick={() => handleApproveAndSendQuiz(r.id)}
            disabled={approving === r.id}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap"
            title="Approve candidate and send quiz invitation"
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
      ),
    }] : []),
  ];

  if (loading) return <LoadingSpinner message="Loading candidates..." />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-surface-900">Candidate Management</h1>
        {/* Optional: Add button to create new candidate profile */}
        {canApprove && (
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-sm">
            + New Candidate
          </button>
        )}
      </div>

      <DataTable 
        data={candidates} 
        columns={columns}
        emptyMessage="No candidates found"
      />
    </div>
  );
}
```

### 3.3 Create Candidate Creation Modal (Optional)

#### **frontend/src/components/CandidateCreationModal.jsx** (New Component)

```jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { candidatesApi } from '../../api/axios';
import { X } from 'lucide-react';

export default function CandidateCreationModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cin: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await candidatesApi.create(formData);
      if (res.data?.success) {
        toast.success('✓ Candidate profile created!');
        onSuccess?.();
        onClose();
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          cin: '',
        });
      } else {
        toast.error(res.data?.message || 'Failed to create candidate');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating candidate');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-surface-900">New Candidate Profile</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="rounded-lg border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="rounded-lg border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className="rounded-lg border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="cin"
              placeholder="CIN"
              value={formData.cin}
              onChange={handleChange}
              className="rounded-lg border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-all"
            >
              {loading ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## 4. Workflow Summary

### **Before (Old Flow) ❌**
```
Receptionist enters candidate data
  ↓
✗ Auto-create User account
✗ Auto-send email
```

### **After (New Flow) ✓**
```
Step 1: Receptionist enters candidate profile only
  └─ POST /api/candidates (NO user account created)
  └─ Candidate status: "pending_approval"

Step 2: Manager reviews in dashboard
  └─ Views "Pending" candidates
  └─ Can see: Name, Email, Phone, CIN, Internship Files

Step 3: Manager clicks "Approve & Send Quiz"
  └─ POST /api/candidates/{id}/approve-and-send-quiz
  └─ Backend creates User account
  └─ Backend sends welcome email with temp password
  └─ Candidate receives email with quiz link
  └─ Candidate status changes to "pending_quiz"

Step 4: Candidate logs in and takes quiz
  └─ User updates password on first login
  └─ Candidate completes quiz
```

---

## 5. API Endpoints Summary

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| `POST` | `/api/candidates` | RECEPTIONIST, ADMIN | Create candidate profile (ONLY) |
| `GET` | `/api/candidates` | RECEPTIONIST, ADMIN, MANAGER | List all candidates |
| `GET` | `/api/candidates/{id}` | RECEPTIONIST, ADMIN, MANAGER | Get candidate details |
| `DELETE` | `/api/candidates/{id}` | RECEPTIONIST, ADMIN | Delete candidate |
| `POST` | `/api/candidates/{id}/approve-and-send-quiz` | **MANAGER, ADMIN** | ⭐ Approve & create account + send email |
| `POST` | `/api/candidates/{id}/internship-files` | RECEPTIONIST, ADMIN, CANDIDATE | Add internship file |
| `GET` | `/api/candidates/{id}/internship-files` | RECEPTIONIST, ADMIN, CANDIDATE | List internship files |
| `DELETE` | `/api/candidates/internship-files/{id}` | RECEPTIONIST, ADMIN | Delete internship file |

---

## 6. Database Migration (SQL)

If you need to reset user relationships:

```sql
-- Clear old data (optional)
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%candidate%');
DELETE FROM users WHERE email LIKE '%candidate%';

-- Ensure candidates table has user_id with NULL default
ALTER TABLE candidates MODIFY COLUMN user_id BIGINT NULL;

-- Create index for faster lookups
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_user_id ON candidates(user_id);
CREATE INDEX idx_internship_files_candidate_id ON internship_files(candidate_id);
```

---

## 7. Testing Checklist

### Backend Tests
- [ ] `POST /api/candidates` does NOT create User account
- [ ] `POST /api/candidates/{id}/approve-and-send-quiz` creates User account
- [ ] `POST /api/candidates/{id}/approve-and-send-quiz` sends email
- [ ] Candidate.hasUserAccount is true only after approval
- [ ] Can add InternshipFiles before account creation
- [ ] Manager can only access approve endpoint (ROLE_MANAGER check)

### Frontend Tests
- [ ] Candidate creation form shows fields: firstName, lastName, email, phone, cin
- [ ] "New Candidate" button creates profile without email
- [ ] "Approve & Send Quiz" button appears only for unapproved candidates
- [ ] Manager sees "Pending" status for unapproved candidates
- [ ] After approval, status changes to "Active" with checkmark
- [ ] Internship file upload works before and after approval

---

## 8. Key Implementation Notes

1. **Separation of Concerns:** 
   - Profile creation ≠ Account creation
   - Reception staff create profiles
   - Managers approve and send invites

2. **No Auto-Actions:**
   - `createCandidate()` only saves profile
   - No User record
   - No email sending
   - User status starts as NULL

3. **Manager Control:**
   - Manager must explicitly click "Approve & Send Quiz"
   - This single action creates account + sends email
   - Provides audit trail

4. **Audit Logging:**
   - Log "CANDIDATE_CREATED" when profile created
   - Log "CANDIDATE_APPROVED" when manager approves
   - Helps track who approved when

---

## 9. Rollback Strategy

If you need to revert:
1. Keep old `inviteAndSendQuiz()` method as `approveAndSendQuiz()`
2. Update endpoints to accept new request format
3. Database: No schema changes needed (user_id already allows NULL)
4. No data loss — just different workflow
