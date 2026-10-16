import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/common/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Courses from './pages/Courses';
import Attendance from './pages/Attendance';
import Marks from './pages/Marks';
import Analytics from './pages/Analytics';
import ProjectInfo from './pages/ProjectInfo';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<StudentDetails />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/marks" element={<Marks />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/project-info" element={<ProjectInfo />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ToastProvider>
  );
}
