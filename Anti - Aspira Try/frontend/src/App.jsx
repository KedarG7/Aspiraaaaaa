import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import FindJobs from './pages/FindJobs';
import JobDetails from './pages/JobDetails';
import ApplyJob from './pages/ApplyJob';
import TrackStatus from './pages/TrackStatus';
import EmployerDashboard from './pages/EmployerDashboard';
import PostJob from './pages/PostJob';
import EditJob from './pages/EditJob';
import ScheduleInterview from './pages/ScheduleInterview';
import ApplicationDetail from './pages/ApplicationDetail';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/jobs" element={<FindJobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />

            {/* Candidate Routes */}
            <Route
              path="/jobs/:id/apply"
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <ApplyJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <TrackStatus />
                </ProtectedRoute>
              }
            />

            {/* Employer Routes */}
            <Route
              path="/employer"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/post-job"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/edit-job/:id"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <EditJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/schedule-interview/:id"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <ScheduleInterview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/application/:id"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <ApplicationDetail />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["candidate","employer"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
