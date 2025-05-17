
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage'; // Import RegisterPage
import DashboardPage from '@/pages/DashboardPage';
import PatotaPage from '@/pages/PatotaPage';
import CreatePatotaPage from '@/pages/CreatePatotaPage';
import JoinPatotaPage from '@/pages/JoinPatotaPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { Toaster } from '@/components/ui/toaster';
import { MotionConfig } from 'framer-motion';

function App() {
  return (
    <MotionConfig transition={{ duration: 0.2, type: 'tween' }}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} /> {/* Add route for RegisterPage */}
            <Route 
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/patota/:patotaId" element={<PatotaPage />} />
                      <Route path="/patotas/create" element={<CreatePatotaPage />} />
                      <Route path="/patotas/join" element={<JoinPatotaPage />} />
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </MotionConfig>
  );
}

export default App;
