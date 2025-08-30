// API Debug Utility for Frontend
export const debugApiCall = async (endpoint, options = {}) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://company.d0s369.co.in/api';
  
  console.log('🔍 Debugging API Call...');
  console.log('Endpoint:', endpoint);
  console.log('Full URL:', `${API_BASE_URL}/${endpoint}`);
  console.log('Options:', options);
  
  // Get token from localStorage
  const token = localStorage.getItem('access_token');
  console.log('Token from localStorage:', token ? 'Present' : 'Missing');
  
  if (token) {
    console.log('Token preview:', token.substring(0, 50) + '...');
  }
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('Request headers:', headers);
  
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      ...options
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Response data:', responseData);
    } catch (e) {
      console.log('Response is not JSON');
    }
    
    return {
      status: response.status,
      ok: response.ok,
      data: responseData,
      text: responseText
    };
    
  } catch (error) {
    console.error('API call error:', error);
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
};

// Test specific endpoints
export const testApiEndpoints = async () => {
  console.log('🚀 Testing API Endpoints...');
  
  // Test 1: Profile endpoint
  console.log('\n=== Test 1: Profile Endpoint ===');
  const profileResult = await debugApiCall('auth/profile/');
  
  // Test 2: Users endpoint
  console.log('\n=== Test 2: Users Endpoint ===');
  const usersResult = await debugApiCall('users/');
  
  // Test 3: Dashboard stats
  console.log('\n=== Test 3: Dashboard Stats ===');
  const statsResult = await debugApiCall('dashboard/stats/');
  
  // Test 4: Attendance endpoint
  console.log('\n=== Test 4: Attendance Endpoint ===');
  const attendanceResult = await debugApiCall('attendance/');
  
  return {
    profile: profileResult,
    users: usersResult,
    stats: statsResult,
    attendance: attendanceResult
  };
};

// Test authentication flow
export const testAuthFlow = async () => {
  console.log('🔐 Testing Authentication Flow...');
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://company.d0s369.co.in/api';
  
  // Step 1: Login
  console.log('\n=== Step 1: Login ===');
  const loginResponse = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'dineshmaurya',
      password: 'Test@2026',
      dashboard_type: 'manager'
    })
  });
  
  console.log('Login status:', loginResponse.status);
  const loginData = await loginResponse.json();
  console.log('Login response:', loginData);
  
  if (loginResponse.ok) {
    // Step 2: Store token
    localStorage.setItem('access_token', loginData.access);
    localStorage.setItem('refresh_token', loginData.refresh);
    localStorage.setItem('user', JSON.stringify(loginData.user));
    
    console.log('✅ Tokens stored in localStorage');
    
    // Step 3: Test profile with new token
    console.log('\n=== Step 2: Test Profile with New Token ===');
    const profileResult = await debugApiCall('auth/profile/');
    
    return {
      login: { status: loginResponse.status, data: loginData },
      profile: profileResult
    };
  } else {
    console.log('❌ Login failed');
    return {
      login: { status: loginResponse.status, data: loginData },
      profile: null
    };
  }
};

// Add to window for easy access
if (typeof window !== 'undefined') {
  window.debugApiCall = debugApiCall;
  window.testApiEndpoints = testApiEndpoints;
  window.testAuthFlow = testAuthFlow;
}
