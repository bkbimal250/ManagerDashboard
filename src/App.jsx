import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import Layout from './Components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Resignations from './pages/Resignations';
import Documents from './pages/Documents';
import Generator from './pages/Generator';
import Reports from './pages/Reports';
import Devices from './pages/Devices';
import Profile from './pages/Profile';

// Private Route Component for Manager role
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // console.log('🛡️ PrivateRoute - Authentication check:');
  // console.log('  - User:', user);
  // console.log('  - Loading:', loading);
  // console.log('  - User role:', user?.role);
  // console.log('  - User ID:', user?.id);
  // console.log('  - User username:', user?.username);
  
  if (loading) {
    // console.log('⏳ PrivateRoute: Still loading...');
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    // console.log('❌ PrivateRoute: No user found, redirecting to login');
    // Check localStorage for debugging
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('access_token');
    // console.log('🔍 PrivateRoute: localStorage check:');
    // console.log('  - Stored user:', storedUser);
    // console.log('  - Stored token:', storedToken);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // console.log('🔍 PrivateRoute: Parsed stored user:', parsedUser);
        // console.log('🔍 PrivateRoute: User role from stored data:', parsedUser.role);
        
        // If we have stored user data but no user state, there might be a race condition
        // Let's wait a bit longer before redirecting
        if (loading) {
          // console.log('⏳ PrivateRoute: Still loading, waiting...');
          return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
        }
      } catch (error) {
        // console.error('❌ PrivateRoute: Failed to parse stored user:', error);
      }
    }
    
    return <Navigate to="/login" />;
  }
  
  // Check if user is manager
  if (user.role !== 'manager') {
    // console.log('❌ PrivateRoute: User role is not manager:', user.role);
    // console.log('❌ PrivateRoute: Expected role: manager, got:', user.role);
    return <Navigate to="/login" />;
  }
  
  // console.log('✅ PrivateRoute: User authenticated as manager, rendering children');
  return children;
};

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="employees" element={<Employees />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="leaves" element={<Leaves />} />
                <Route path="resignations" element={<Resignations />} />
                <Route path="documents" element={<Documents />} />
                <Route path="generator" element={<Generator />} />
                <Route path="reports" element={<Reports />} />
                <Route path="devices" element={<Devices />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
