import api from '../services/api';

export const testTokenAuthentication = async () => {
  console.log('🧪 === TOKEN AUTHENTICATION TEST ===');
  
  // Test 1: Check if backend is accessible
  console.log('1️⃣ Testing backend connectivity...');
  try {
    const healthCheck = await api.testConnection();
    console.log('✅ Backend is accessible:', healthCheck);
  } catch (error) {
    console.log('❌ Backend connectivity failed:', error.message);
  }
  
  // Test 2: Check current tokens
  console.log('2️⃣ Checking current tokens...');
  const token = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const user = localStorage.getItem('user');
  
  console.log('   - Access Token:', token ? 'EXISTS' : 'MISSING');
  console.log('   - Refresh Token:', refreshToken ? 'EXISTS' : 'MISSING');
  console.log('   - User Data:', user ? 'EXISTS' : 'MISSING');
  
  if (token) {
    console.log('   - Token preview:', token.substring(0, 20) + '...');
  }
  
  // Test 3: Test profile endpoint if token exists
  if (token) {
    console.log('3️⃣ Testing profile endpoint...');
    try {
      const profile = await api.getProfile();
      console.log('✅ Profile fetch successful:', profile);
    } catch (error) {
      console.log('❌ Profile fetch failed:', error.message);
      
      // Test 4: Try token refresh if profile fails
      if (error.response?.status === 401 && refreshToken) {
        console.log('4️⃣ Attempting token refresh...');
        try {
          const response = await fetch('https://company.d0s369.co.in/api/token/refresh/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Token refresh successful:', data);
            localStorage.setItem('access_token', data.access);
            console.log('✅ New token stored');
          } else {
            console.log('❌ Token refresh failed:', response.status, response.statusText);
          }
        } catch (refreshError) {
          console.log('❌ Token refresh error:', refreshError.message);
        }
      }
    }
  }
  
  console.log('🧪 === TEST COMPLETE ===');
};

export const testLoginFlow = async (username, password) => {
  console.log('🔐 === LOGIN FLOW TEST ===');
  
  try {
    console.log('Attempting login with:', { username, password: '***' });
    const response = await api.login({ username, password });
    console.log('✅ Login successful:', response);
    
    // Verify tokens were stored
    const storedToken = localStorage.getItem('access_token');
    const storedRefreshToken = localStorage.getItem('refresh_token');
    const storedUser = localStorage.getItem('user');
    
    console.log('Token storage verification:');
    console.log('  - Access Token stored:', !!storedToken);
    console.log('  - Refresh Token stored:', !!storedRefreshToken);
    console.log('  - User data stored:', !!storedUser);
    
    return { success: true, data: response };
  } catch (error) {
    console.log('❌ Login failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  window.testTokenAuth = testTokenAuthentication;
  window.testLogin = testLoginFlow;
}
