import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input } from '../Components';
import { Shield, Eye, EyeOff, AlertCircle, Building2 } from 'lucide-react';
// import { testTokenStorage, setManagerTestData, setManagerTestDataNoProfile } from '../utils/tokenTest';
import { debugAuth, clearAuthData, setTestMode } from '../utils/authDebug';
import { debugApiCall, testApiEndpoints, testAuthFlow } from '../utils/apiDebug';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Debug authentication state on component mount
  useEffect(() => {
    console.log('🔍 Debugging authentication state...');
    debugAuth();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🚀 Login attempt started...');
    console.log('Form data:', formData);

    try {
      const result = await login(formData);
      console.log('📋 Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful, navigating to dashboard...');
        // Test token storage after successful login (commented out to prevent interference)
        // setTimeout(() => {
        //   console.log('🔍 Testing token storage after login...');
        //   testTokenStorage();
        // }, 100);
        // Add a small delay to ensure state is properly set
        setTimeout(() => {
          navigate('/');
        }, 200);
      } else {
        console.error('❌ Login failed:', result.error);
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('💥 Login error:', err);
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center shadow-2xl border-2 border-green-200">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-4xl font-bold text-gray-900">
            Manager Dashboard
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Sign in to access your office management panel
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl border-2 border-gray-100">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="flex items-center p-4 text-sm text-red-800 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl shadow-sm">
                  <AlertCircle className="h-5 w-5 mr-3 text-red-600" />
                  {error}
                </div>
              )}

              {/* Username Field */}
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="w-full"
                />
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Debug Buttons - Only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <Button
                    type="button"
                    onClick={() => {
                      console.log('🔍 Debugging authentication state...');
                      debugAuth();
                    }}
                    className="w-full btn btn-secondary mt-2"
                  >
                    🔍 Debug Auth State
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      console.log('🧹 Clearing authentication data...');
                      clearAuthData();
                      // Refresh the page to test
                      setTimeout(() => {
                        window.location.reload();
                      }, 500);
                    }}
                    className="w-full btn btn-warning mt-2"
                  >
                    🧹 Clear Auth Data
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      console.log('🧪 Setting test mode...');
                      setTestMode(true);
                      // Refresh the page to test authentication
                      setTimeout(() => {
                        window.location.reload();
                      }, 500);
                    }}
                    className="w-full btn btn-info mt-2"
                  >
                    🧪 Enable Test Mode
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      console.log('🔧 Testing API endpoints...');
                      testApiEndpoints();
                    }}
                    className="w-full btn btn-success mt-2"
                  >
                    🔧 Test API Endpoints
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      console.log('🔐 Testing authentication flow...');
                      testAuthFlow();
                    }}
                    className="w-full btn btn-primary mt-2"
                  >
                    🔐 Test Auth Flow
                  </Button>
                </>
              )}
            </form>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                This dashboard is for office managers only
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
