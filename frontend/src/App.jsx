import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import OverviewPage from './pages/dashboard/OverviewPage';
import ApplicationsPage from './pages/dashboard/ApplicationsPage';
import CandidatesPage from './pages/dashboard/CandidatesPage';
import ProjectsPage from './pages/dashboard/ProjectsPage';
import SupervisorsPage from './pages/dashboard/SupervisorsPage';
import QuizPage from './pages/dashboard/QuizPage';
import AiInsightsPage from './pages/dashboard/AiInsightsPage';
import UsersPage from './pages/dashboard/UsersPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import MyApplicationsPage from './pages/dashboard/MyApplicationsPage';
import MyProjectsPage from './pages/dashboard/MyProjectsPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import SettingsPage from './pages/dashboard/SettingsPage';
import CVUploadPage from './pages/dashboard/CVUploadPage';
import ReceptionPanel from './pages/dashboard/ReceptionPanel';
import QuizInterface from './pages/dashboard/QuizInterface';
import InterviewPage from './pages/dashboard/InterviewPage';
import ProjectAssignmentPage from './pages/dashboard/ProjectAssignmentPage';
import ActivityLogPage from './pages/dashboard/ActivityLogPage';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Mandatory password change — shown right after first login */}
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            } />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<RoleBasedRedirect><OverviewPage /></RoleBasedRedirect>} />

              {/* Admin / Manager / Receptionist */}
              <Route path="applications" element={
                <ProtectedRoute roles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
                  <ApplicationsPage />
                </ProtectedRoute>
              } />
              <Route path="candidates" element={
                <ProtectedRoute roles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
                  <CandidatesPage />
                </ProtectedRoute>
              } />
              <Route path="projects" element={
                <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
                  <ProjectsPage />
                </ProtectedRoute>
              } />
              <Route path="supervisors" element={
                <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
                  <SupervisorsPage />
                </ProtectedRoute>
              } />
              <Route path="quizzes" element={
                <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
                  <QuizPage />
                </ProtectedRoute>
              } />
              <Route path="ai-insights" element={
                <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
                  <AiInsightsPage />
                </ProtectedRoute>
              } />
              <Route path="users" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              } />

              {/* Candidate-only Routes */}
              <Route path="my-applications" element={
                <ProtectedRoute roles={['CANDIDATE']}>
                  <MyApplicationsPage />
                </ProtectedRoute>
              } />
              <Route path="my-projects" element={
                <ProtectedRoute roles={['CANDIDATE']}>
                  <MyProjectsPage />
                </ProtectedRoute>
              } />
              <Route path="cv-upload" element={
                <ProtectedRoute roles={['CANDIDATE']}>
                  <CVUploadPage />
                </ProtectedRoute>
              } />
              <Route path="quiz" element={
                <ProtectedRoute roles={['CANDIDATE']}>
                  <QuizPage />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute roles={['CANDIDATE']}>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              {/* Shared */}
              <Route path="notifications" element={<NotificationsPage />} />

              {/* Reception Panel — Admin + Receptionist */}
              <Route path="reception-panel" element={
                <ProtectedRoute roles={['ADMIN', 'RECEPTIONIST']}>
                  <ReceptionPanel />
                </ProtectedRoute>
              } />

              {/* Quiz Interface — Candidates only */}
              <Route path="quiz-interface" element={
                <ProtectedRoute roles={['CANDIDATE']}>
                  <QuizInterface />
                </ProtectedRoute>
              } />

              {/* Interview Management */}
              <Route path="interviews" element={
                <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
                  <InterviewPage />
                </ProtectedRoute>
              } />

              {/* Project Assignment & AI Roadmap */}
              <Route path="project-assignment" element={
                <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
                  <ProjectAssignmentPage />
                </ProtectedRoute>
              } />

              {/* Activity Log */}
              <Route path="activity-log" element={
                <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
                  <ActivityLogPage />
                </ProtectedRoute>
              } />

              <Route path="settings" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <SettingsPage />
                </ProtectedRoute>
              } />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}