import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InvestmentPlans from './pages/InvestmentPlans';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/terms" element={<TermsPage />} />
              
              {/* Protected User Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              <Route path="/invest" element={
                <ProtectedRoute>
                  <InvestmentPlans />
                </ProtectedRoute>
              } />
              <Route path="/deposit" element={
                <ProtectedRoute>
                  <DepositPage />
                </ProtectedRoute>
              } />
              <Route path="/withdraw" element={
                <ProtectedRoute>
                  <WithdrawPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              {/* Protected Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;