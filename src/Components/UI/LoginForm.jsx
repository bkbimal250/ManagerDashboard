import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showError, showSuccess, showLoading, updateLoadingToSuccess, updateLoadingToError } from '../../utils/toast';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Show loading toast
    const loadingToastId = showLoading('Signing you in...');

    try {
      const result = await login(formData);
      
      if (result.success) {
        updateLoadingToSuccess(loadingToastId, 'Login successful! Welcome back! 🎉');
        setTimeout(() => {
          navigate('/');
        }, 1000); // Give time to see success message
      } else {
        console.error('❌ Login failed:', result.error);
        updateLoadingToError(loadingToastId, result.error || 'Login failed');
      }
    } catch (err) {
      console.error('💥 Login error:', err);
      
      // Handle specific error cases
      let errorMessage = 'Login failed';
      
      if (err.response?.status === 400) {
        errorMessage = 'Invalid username or password. Please check your credentials.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please check your credentials.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please contact your administrator.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      updateLoadingToError(loadingToastId, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
          Username
        </label>
        <div className="relative">
          <input
            id="username"
            name="username"
            type="text"
            required
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            autoComplete="username"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 touch-manipulation"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 touch-manipulation"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200 touch-manipulation p-1"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl touch-manipulation min-h-[44px] sm:min-h-[48px] flex items-center justify-center"
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2 sm:mr-3"></div>
            <span className="text-sm sm:text-base">Signing in...</span>
          </div>
        ) : (
          <div className="flex items-center">
            <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="text-sm sm:text-base">Sign In</span>
          </div>
        )}
      </button>
    </form>
  );
};

export default LoginForm;
