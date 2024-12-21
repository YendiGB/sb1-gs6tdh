import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { isFirebaseInitialized } from './lib/firebase';
import Layout from './components/Layout';
import Home from './pages/Home';
import Read from './pages/Read';
import Challenges from './pages/Challenges';
import ChallengeDetail from './pages/ChallengeDetail';
import Videos from './pages/Videos';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import More from './pages/More';
import SignIn from './pages/SignIn';
import Dashboard from './pages/admin/Dashboard';
import Books from './pages/admin/Books';
import AdminChallenges from './pages/admin/Challenges';
import Affirmations from './pages/admin/Affirmations';
import Users from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';
import Overview from './pages/admin/Overview';
import StorageDebug from './pages/admin/StorageDebug';

const App: React.FC = () => {
  const { initialize, userData } = useAuthStore();

  useEffect(() => {
    if (isFirebaseInitialized) {
      initialize();
    }
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/signin" element={<SignIn />} />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            userData?.role === 'admin' ? (
              <Dashboard />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        >
          <Route index element={<Overview />} />
          <Route path="books" element={<Books />} />
          <Route path="challenges" element={<AdminChallenges />} />
          <Route path="affirmations" element={<Affirmations />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="storage-debug" element={<StorageDebug />} />
        </Route>

        {/* User Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="read" element={<Read />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="challenges/:id" element={<ChallengeDetail />} />
          <Route path="videos" element={<Videos />} />
          <Route path="community" element={<Community />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="more" element={<More />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;