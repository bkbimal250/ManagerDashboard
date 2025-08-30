import api from '../services/api';

export const debugAuth = async () => {
  console.log('🔍 === AUTH DEBUG START ===');
  
  // Check localStorage
  const token = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const user = localStorage.getItem('user');
  
  console.log('📦 localStorage contents:');
  console.log('  - access_token:', token ? 'EXISTS' : 'MISSING');
  console.log('  - refresh_token:', refreshToken ? 'EXISTS' : 'MISSING');
  console.log('  - user:', user ? 'EXISTS' : 'MISSING');
  
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      console.log('  - user data:', parsedUser);
    } catch (e) {
      console.log('  - user data: INVALID JSON');
    }
  }
  
  // Test API connection
  console.log('🌐 Testing API connection...');
  const connectionTest = await api.testConnection();
  console.log('  - Connection test:', connectionTest);
  
  // Test profile endpoint if we have a token
  if (token) {
    console.log('👤 Testing profile endpoint...');
    try {
      const profile = await api.getProfile();
      console.log('  - Profile fetch: SUCCESS', profile);
    } catch (error) {
      console.log('  - Profile fetch: FAILED', error.message);
    }
  }
  
  console.log('🔍 === AUTH DEBUG END ===');
};

export const clearAuthData = () => {
  console.log('🧹 Clearing all auth data...');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('skip_profile_fetch');
  console.log('✅ Auth data cleared');
};

export const setTestMode = (enabled = true) => {
  if (enabled) {
    localStorage.setItem('skip_profile_fetch', 'true');
    console.log('🧪 Test mode enabled - will skip profile fetch');
  } else {
    localStorage.removeItem('skip_profile_fetch');
    console.log('🧪 Test mode disabled');
  }
};

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
  window.clearAuth = clearAuthData;
  window.setTestMode = setTestMode;
}
