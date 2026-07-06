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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/revision" element={<Revision />} />
        <Route path="/contest-radar" element={<ContestRadar />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sheets" element={<Sheets />} />
        <Route path="/sheets/a2z" element={<A2ZSheet />} />
        <Route path="/sheets/tle31" element={<TLE31Sheet />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
