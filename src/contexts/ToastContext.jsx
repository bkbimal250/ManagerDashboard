import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../Components/UI/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      ...toast,
      onClose: () => removeToast(id)
    };
    console.log('Adding toast:', newToast);
    setToasts(prev => {
      const updated = [...prev, newToast];
      console.log('Updated toasts array:', updated);
      return updated;
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, options = {}) => {
    addToast({
      type: 'success',
      message,
      duration: 4000,
      position: 'bottom-center',
      ...options
    });
  }, [addToast]);

  const showError = useCallback((message, options = {}) => {
    addToast({
      type: 'error',
      message,
      duration: 5000,
      position: 'bottom-center',
      ...options
    });
  }, [addToast]);

  const showWarning = useCallback((message, options = {}) => {
    addToast({
      type: 'warning',
      message,
      duration: 4000,
      position: 'bottom-center',
      ...options
    });
  }, [addToast]);

  const showInfo = useCallback((message, options = {}) => {
    addToast({
      type: 'info',
      message,
      duration: 4000,
      position: 'bottom-center',
      ...options
    });
  }, [addToast]);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    addToast,
    removeToast,
    clearAllToasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Render all toasts */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="pointer-events-auto"
            style={{
              transform: toast.position === 'center' 
                ? `translateY(${index * 20}px)` 
                : toast.position === 'bottom-center' || toast.position === 'bottom-left' || toast.position === 'bottom-right'
                ? `translateY(-${index * 80}px)`
                : `translateY(${index * 80}px)`
            }}
          >
            <Toast {...toast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
