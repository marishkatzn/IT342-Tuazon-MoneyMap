import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public Pages
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Success from './features/payments/Success';

// Protected Pages
import Dashboard from './features/dashboard/Dashboard';
import Income from './features/income/Income';
import Goals from './features/goals/Goals';
import Contributions from './features/contributions/Contributions';
import Notifications from './features/notifications/Notifications';
import Profile from './features/account/Profile';
import SignOut from './features/auth/SignOut';

// Layouts and Guards
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Navigate to="/register" replace />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route path="/success" element={<Success />} />
          
          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/income" element={<Income />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/contributions" element={<Contributions />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/signout" element={<SignOut />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
