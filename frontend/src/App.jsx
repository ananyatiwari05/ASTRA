import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import Profile from './pages/Profile';
import Sheets from './pages/Sheets';
import SheetDetail from './pages/SheetDetail';
import Analytics from './pages/Analytics';
import Revision from './pages/Revision';
import ContestRadar from './pages/ContestRadar';
import OAuthSuccess from './pages/OAuthSuccess';
import A2ZSheet from './pages/A2ZSheet';
import TLE31Sheet from './pages/TLE31Sheet';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/revision" element={<ProtectedRoute><Revision /></ProtectedRoute>} />
        <Route path="/contest-radar" element={<ProtectedRoute><ContestRadar /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/sheets" element={<ProtectedRoute><Sheets /></ProtectedRoute>} />
        <Route path="/sheets/a2z" element={<ProtectedRoute><A2ZSheet /></ProtectedRoute>} />
        <Route path="/sheets/tle31" element={<ProtectedRoute><TLE31Sheet /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
