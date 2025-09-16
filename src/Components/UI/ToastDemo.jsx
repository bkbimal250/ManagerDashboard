import React from 'react';
import { showSuccess, showError, showWarning, showInfo, showLoading, updateLoadingToSuccess, updateLoadingToError } from '../../utils/toast';
import { Button } from '../index';

const ToastDemo = () => {
  const handleSuccess = () => {
    showSuccess('Operation completed successfully! 🎉');
  };

  const handleError = () => {
    showError('Something went wrong! Please try again.');
  };

  const handleWarning = () => {
    showWarning('Please review your input before proceeding.');
  };

  const handleInfo = () => {
    showInfo('This is an informational message.');
  };

  const handleLoadingDemo = () => {
    const loadingToastId = showLoading('Processing your request...');
    
    // Simulate API call
    setTimeout(() => {
      updateLoadingToSuccess(loadingToastId, 'Request completed successfully! 🎉');
    }, 3000);
  };

  const handleLoadingErrorDemo = () => {
    const loadingToastId = showLoading('Attempting to save data...');
    
    // Simulate API call that fails
    setTimeout(() => {
      updateLoadingToError(loadingToastId, 'Failed to save data. Please try again.');
    }, 2000);
  };

  const handleMultipleToasts = () => {
    showSuccess('First action completed');
    setTimeout(() => showError('Second action failed'), 500);
    setTimeout(() => showWarning('Third action needs attention'), 1000);
    setTimeout(() => showInfo('Fourth action is informational'), 1500);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold mb-4">React Toastify Demo</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Button onClick={handleSuccess} className="bg-green-600 hover:bg-green-700">
          Show Success
        </Button>
        <Button onClick={handleError} className="bg-red-600 hover:bg-red-700">
          Show Error
        </Button>
        <Button onClick={handleWarning} className="bg-yellow-600 hover:bg-yellow-700">
          Show Warning
        </Button>
        <Button onClick={handleInfo} className="bg-blue-600 hover:bg-blue-700">
          Show Info
        </Button>
        <Button onClick={handleLoadingDemo} className="bg-purple-600 hover:bg-purple-700">
          Loading → Success
        </Button>
        <Button onClick={handleLoadingErrorDemo} className="bg-orange-600 hover:bg-orange-700">
          Loading → Error
        </Button>
        <Button onClick={handleMultipleToasts} className="bg-indigo-600 hover:bg-indigo-700 col-span-2 md:col-span-3">
          Show Multiple Toasts
        </Button>
      </div>
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Features:</strong> Toasts appear at the bottom center with custom styling, loading states, 
          progress bars, and smooth animations. Perfect for employee management operations!
        </p>
      </div>
    </div>
  );
};

export default ToastDemo;