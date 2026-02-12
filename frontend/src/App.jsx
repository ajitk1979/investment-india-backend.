import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from './config';

// Bypass Ngrok warning page
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

import MainDashboard from './components/MainDashboard';
import TransactionList from './components/TransactionList';
import { AuthProvider, useAuth } from './context/AuthContext';
import RegisterForm from './components/RegisterForm';
import OtpVerification from './components/OtpVerification';
import BankDetails from './components/BankDetails';
import PlanSelection from './components/PlanSelection';
import Summary from './components/Summary';
import PaymentUI from './components/PaymentUI';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import MpinSetup from './components/MpinSetup';
import MpinLogin from './components/MpinLogin';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/" />;
};

const ADMIN_MODE = import.meta.env.VITE_APP_MODE === 'ADMIN';

function App() {
  useEffect(() => {
    // App initialized
  }, []);

  if (ADMIN_MODE) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    )
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<RegisterForm initialMode="login" />} />
          <Route path="/register" element={<RegisterForm initialMode="register" />} />

          <Route path="/otp" element={<OtpVerification />} />
          <Route path="/mpin-setup" element={<MpinSetup />} />
          <Route path="/mpin-login" element={<MpinLogin />} />

          {/* Protected Routes */}
          <Route path="/bank" element={<ProtectedRoute><BankDetails /></ProtectedRoute>} />
          <Route path="/plan" element={<ProtectedRoute><PlanSelection /></ProtectedRoute>} />
          <Route path="/summary" element={<ProtectedRoute><Summary /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><PaymentUI /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/home" element={<ProtectedRoute><MainDashboard /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionList /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
