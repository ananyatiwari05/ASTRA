import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import Profile from './pages/Profile';
import Sheets from './pages/Sheets';
import A2ZSheet from './pages/A2ZSheet';
import ContestRadar from './pages/ContestRadar';
import OAuthSuccess from './pages/OAuthSuccess';
import Analytics from './pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contest-radar" element={<ContestRadar />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sheets" element={<Sheets />} />
        <Route path="/sheets/a2z" element={<A2ZSheet />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
