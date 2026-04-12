import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Success from './pages/Success';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Goals from './pages/Goals';
import Allocation from './pages/Allocation';
import Contributions from './pages/Contributions';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import SignOut from './pages/SignOut';

// Layouts and Guards
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/success" element={<Success />} />
          
          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/income" element={<Income />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/allocation" element={<Allocation />} />
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
