import axios from 'axios';

/**
 * Axios instance - connect to backend API.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request Interceptor: Attach JWT token ──────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sipms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle 401 ──────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sipms_token');
      localStorage.removeItem('sipms_user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Helpers ──────────────────────────────────────────────
export const generateSecurePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  return password;
};

// ── Auth API ──────────────────────────────────────────────
export const authApi = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/public/register', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};


// ── Users API ─────────────────────────────────────────────
// All calls go to the real Spring Boot backend (/api/users).
// The admin-only endpoints are guarded by Spring Security (@PreAuthorize).
export const usersApi = {
  getAll:         ()         => api.get('/users'),
  // Optimised: single JOIN FETCH query — ROLE_CANDIDATE only, accessible by Receptionist
  getCandidates:  ()         => api.get('/users/candidates'),
  getById:        (id)       => api.get(`/users/${id}`),
  create:         (data)     => api.post('/users', data),
  update:         (id, data) => api.put(`/users/${id}`, data),
  delete:         (id)       => api.delete(`/users/${id}`),
  toggleActive:   (id)       => api.patch(`/users/${id}/toggle-active`),
};


// ── Candidates API (standalone, no User account) ──────────
export const candidatesApi = {
  getAll:              ()          => api.get('/candidates'),
  getById:             (id)        => api.get(`/candidates/${id}`),
  create:              (data)      => api.post('/candidates', data),
  delete:              (id)        => api.delete(`/candidates/${id}`),
  // Internship Files
  addInternshipFile:   (cid, data) => api.post(`/candidates/${cid}/internship-files`, data),
  addInternshipFileWithDocument: (cid, formData) => api.post(`/candidates/${cid}/internship-files/with-document`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getInternshipFiles:  (cid)       => api.get(`/candidates/${cid}/internship-files`),
  deleteInternshipFile:(fid)       => api.delete(`/candidates/internship-files/${fid}`),
  // Manager action: approve and send quiz (NEW)
  approveAndSendQuiz:  (cid, req)  => api.post(`/candidates/${cid}/approve-and-send-quiz`, req || {}),
  // Manager action: legacy endpoint for backward compatibility
  sendQuizAndInvite:   (cid)       => api.post(`/candidates/${cid}/invite`),
};

// ── Applications API ──────────────────────────────────────
export const applicationsApi = {
  getAll: () => api.get('/applications'),
  getById: (id) => api.get(`/applications/${id}`),
  getMy: () => api.get('/applications/my'),
  getByStatus: (status) => api.get(`/applications/status/${status}`),
  create: (data) => api.post('/applications', data),
  createPhysical: (data) => api.post('/applications/physical', data),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  assignSupervisor: (id, data) => api.patch(`/applications/${id}/assign-supervisor`, data),
};

// ── Projects API ──────────────────────────────────────────
export const projectsApi = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  getMy: () => api.get('/projects/my'),
  create: (data) => api.post('/projects', data),
  updateStatus: (id, status) => api.patch(`/projects/${id}/status`, { status }),
  assignSupervisor: (id, supervisorId) => api.patch(`/projects/${id}/assign-supervisor`, { supervisorId }),
};

// ── Supervisors API ───────────────────────────────────────
export const supervisorsApi = {
  getAll: () => api.get('/supervisors'),
  getActive: () => api.get('/supervisors/active'),
  getById: (id) => api.get(`/supervisors/${id}`),
  create: (data) => api.post('/supervisors', data),
  update: (id, data) => api.put(`/supervisors/${id}`, data),
  delete: (id) => api.delete(`/supervisors/${id}`),
};

// ── Quizzes API ───────────────────────────────────────────
export const quizzesApi = {
  getAll:            ()               => api.get('/quizzes'),
  getActive:         ()               => api.get('/quizzes/active'),
  getForCandidate:   (id)             => api.get(`/quizzes/${id}`),
  getFull:           (id)             => api.get(`/quizzes/${id}/full`),
  submit:            (data)           => api.post('/quizzes/submit', data),
  getMyResults:      ()               => api.get('/quizzes/my-results'),
  getBySpecialty:    (specialty)      => api.get('/quizzes/by-specialty', { params: { specialty } }),
  create:            (data)           => api.post('/quizzes', data),
  // Assign an existing quiz to a candidate (best-effort — 404 gracefully ignored in UI)
  assignToCandidate: (quizId, userId) => api.post(`/quizzes/${quizId}/assign/${userId}`),
};

// ── Notifications API ─────────────────────────────────────
export const notificationsApi = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { success: true, data: [] } });
      }, 200);
    });
  },
  getUnread: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { success: true, data: [] } });
      }, 200);
    });
  },
  getUnreadCount: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { success: true, data: 0 } });
      }, 200);
    });
  },
  markAsRead: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { success: true, id } });
      }, 200);
    });
  },
  markAllAsRead: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { success: true } });
      }, 200);
    });
  },
};

// ── Dashboard API ─────────────────────────────────────────
export const dashboardApi = {
  getManagerStats: () => api.get('/dashboard/manager/stats'),
};

// ── Interviews API ─────────────────────────────────────────
export const interviewsApi = {
  getAll:         ()                          => api.get('/interviews'),
  getByStatus:    (status)                    => api.get(`/interviews/by-status/${status}`),
  getByCandidate: (candidateId)               => api.get(`/interviews/by-candidate/${candidateId}`),
  schedule:       (data)                      => api.post('/interviews', data),
  updateResult:   (id, data)                  => api.put(`/interviews/${id}/result`, data),
  delete:         (id)                        => api.delete(`/interviews/${id}`),
};

// ── Audit Logs API ─────────────────────────────────────────
export const auditLogsApi = {
  getAll: () => api.get('/audit-logs'),
};

// ── AI API ────────────────────────────────────────────────
export const aiApi = {
  rankProjects: () => api.post('/ai/rank-projects'),
  matchCandidates: (supervisorId) => api.post(`/ai/match-candidates/${supervisorId}`),
  getProjectRankings: () => api.get('/ai/rankings/projects'),
  getCandidateMatchings: (supervisorId) => api.get(`/ai/rankings/candidates/${supervisorId}`),
};
