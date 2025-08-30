import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Debug user state changes
  useEffect(() => {
    console.log('🔄 AuthContext: User state changed:', user);
    if (user === null) {
      console.log('🚨 AuthContext: User state set to null - this might cause redirect to login');
      // Check if this is happening after initial load
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      console.log('🔍 AuthContext: Current localStorage state when user is null:');
      console.log('  - Token exists:', !!token);
      console.log('  - User data exists:', !!storedUser);
    }
  }, [user]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔍 AuthContext: Starting authentication check...');
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      
      console.log('🔍 AuthContext: Stored data check:');
      console.log('  - Token exists:', !!token);
      console.log('  - User data exists:', !!storedUser);
      
      if (token && storedUser) {
        // Check if we should skip profile fetch (for testing)
        const skipProfileFetch = localStorage.getItem('skip_profile_fetch') === 'true';
        
        if (skipProfileFetch) {
          console.log('🔍 AuthContext: Skipping profile fetch (test mode)');
          const parsedUser = JSON.parse(storedUser);
          console.log('🔄 AuthContext: Using stored user data directly:', parsedUser);
          setUser(parsedUser);
        } else {
          console.log('🔍 AuthContext: Found stored authentication data, fetching profile...');
          try {
            const userData = await api.getProfile();
            console.log('✅ AuthContext: Profile fetched successfully:', userData);
            setUser(userData);
          } catch (profileError) {
            console.error('⚠️ AuthContext: Profile fetch failed:', profileError);
            
            // Handle specific profile fetch errors
            if (profileError.message === 'PROFILE_FETCH_401') {
              console.log('🔄 AuthContext: Profile fetch returned 401, using stored user data');
              const parsedUser = JSON.parse(storedUser);
              console.log('🔄 AuthContext: Using stored user data:', parsedUser);
              setUser(parsedUser);
            } else if (profileError.response?.status === 404) {
              console.log('🔄 AuthContext: Profile endpoint not found, using stored user data');
              const parsedUser = JSON.parse(storedUser);
              console.log('🔄 AuthContext: Using stored user data:', parsedUser);
              setUser(parsedUser);
            } else {
              // For other errors, still try to use stored user data
              console.log('🔄 AuthContext: Using stored user data due to profile fetch error');
              const parsedUser = JSON.parse(storedUser);
              console.log('🔄 AuthContext: Using stored user data:', parsedUser);
              setUser(parsedUser);
            }
          }
        }
      } else {
        console.log('❌ AuthContext: No stored authentication data found');
      }
    } catch (error) {
      console.error('💥 AuthContext: Auth check failed:', error);
      // Only clear auth data if it's a critical error
      if (error.message !== 'PROFILE_FETCH_401') {
        console.error('💥 AuthContext: Clearing authentication data due to critical error');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    } finally {
      console.log('🏁 AuthContext: Authentication check completed, setting loading to false');
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 AuthContext: Login attempt with credentials:', credentials);
      const response = await api.login(credentials);
      console.log('🔐 AuthContext: Login response received:', response);
      
      // Store tokens in localStorage
      console.log('💾 AuthContext: Storing tokens in localStorage...');
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Verify tokens were stored
      const storedAccessToken = localStorage.getItem('access_token');
      const storedRefreshToken = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem('user');
      
      console.log('🔍 AuthContext: Token storage verification:');
      console.log('  - Access Token stored:', !!storedAccessToken);
      console.log('  - Refresh Token stored:', !!storedRefreshToken);
      console.log('  - User data stored:', !!storedUser);
      
      // Set user in state immediately
      setUser(response.user);
      console.log('👤 AuthContext: User set in state:', response.user);
      console.log('👤 AuthContext: User role:', response.user.role);
      
      // Clear any test flags
      localStorage.removeItem('skip_profile_fetch');
      
      // Additional verification after state update
      setTimeout(() => {
        console.log('🔍 AuthContext: Post-login state verification:');
        console.log('  - Current user state:', user);
        console.log('  - localStorage tokens still present:', !!localStorage.getItem('access_token'));
      }, 100);
      
      return { success: true };
    } catch (error) {
      console.error('💥 AuthContext: Login error:', error);
      const errorData = api.handleError(error);
      return { success: false, error: errorData.message };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const result = await api.updateProfile(profileData);
      if (result.success) {
        setUser(result.data);
        localStorage.setItem('user', JSON.stringify(result.data));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorData = api.handleError(error);
      return { success: false, error: errorData.message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const result = await api.changePassword(passwordData);
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorData = api.handleError(error);
      return { success: false, error: errorData.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
