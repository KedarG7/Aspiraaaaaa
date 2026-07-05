import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import FindJobs from './pages/FindJobs';
import JobDetails from './pages/JobDetails';
import ApplyJob from './pages/ApplyJob';
import TrackStatus from './pages/TrackStatus';
import EmployerDashboard from './pages/EmployerDashboard';
import PostJob from './pages/PostJob';
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

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
