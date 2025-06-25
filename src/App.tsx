import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { InvestmentProvider } from './contexts/InvestmentContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import InvestPage from './pages/InvestPage';
import DepositPage from './pages/DepositPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <InvestmentProvider>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/invest" element={
                <ProtectedRoute>
                  <InvestPage />
                </ProtectedRoute>
              } />
              <Route path="/deposit" element={
                <ProtectedRoute>
                  <DepositPage />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Layout>
          
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </InvestmentProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;