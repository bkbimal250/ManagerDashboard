// API URL Test Utility
export const testApiUrl = () => {
  console.log('🔍 === API URL TEST ===');
  
  // Check environment variables
  console.log('Environment variables:');
  console.log('  - VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('  - NODE_ENV:', import.meta.env.NODE_ENV);
  
  // Check API service URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://company.d0s369.co.in/api';
  console.log('  - Final API_BASE_URL:', API_BASE_URL);
  
  // Test if localhost is accessible
  fetch('https://company.d0s369.co.in/health/')
    .then(response => {
      console.log('✅ Localhost backend is accessible:', response.status);
    })
    .catch(error => {
      console.log('❌ Localhost backend is not accessible:', error.message);
    });
  
  // Test if production URL is accessible
  fetch('https://company.d0s369.co.in/health/')
    .then(response => {
      console.log('✅ Production backend is accessible:', response.status);
    })
    .catch(error => {
      console.log('❌ Production backend is not accessible:', error.message);
    });
  
  console.log('🔍 === API URL TEST COMPLETE ===');
};

// Add to window for easy access
if (typeof window !== 'undefined') {
  window.testApiUrl = testApiUrl;
}
