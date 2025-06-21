import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './hooks/reduxHooks';
import { checkAuth } from './features/auth/authSlice';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import SetlistsPage from './pages/setlists/SetlistsPage';
import SetlistDetailPage from './pages/setlists/SetlistDetailPage';
import SetlistEditorPage from './pages/setlists/SetlistEditorPage';
import SongsPage from './pages/songs/SongsPage';
import BandsPage from './pages/bands/BandsPage';
import BandDetailPage from './pages/bands/BandDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import NotFoundPage from './pages/errors/NotFoundPage';
import { initializeSocket } from './services/socketService';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      initializeSocket(user.id);
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        
        <Route path="dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="setlists" element={
          <ProtectedRoute>
            <SetlistsPage />
          </ProtectedRoute>
        } />
        
        <Route path="setlists/:id" element={
          <ProtectedRoute>
            <SetlistDetailPage />
          </ProtectedRoute>
        } />
        
        <Route path="setlists/:id/edit" element={
          <ProtectedRoute>
            <SetlistEditorPage />
          </ProtectedRoute>
        } />
        
        <Route path="songs" element={
          <ProtectedRoute>
            <SongsPage />
          </ProtectedRoute>
        } />
        
        <Route path="bands" element={
          <ProtectedRoute>
            <BandsPage />
          </ProtectedRoute>
        } />
        
        <Route path="bands/:id" element={
          <ProtectedRoute>
            <BandDetailPage />
          </ProtectedRoute>
        } />
        
        <Route path="profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;