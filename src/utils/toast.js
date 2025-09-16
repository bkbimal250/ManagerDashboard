import { toast } from 'react-toastify';

// Custom toast configurations
const toastConfig = {
  position: "bottom-center",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

// Success toast with custom styling
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    ...toastConfig,
    ...options,
    style: {
      backgroundColor: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    progressStyle: {
      background: 'linear-gradient(to right, #22c55e, #16a34a)',
    },
  });
};

// Error toast with custom styling
export const showError = (message, options = {}) => {
  return toast.error(message, {
    ...toastConfig,
    autoClose: 5000, // Longer duration for errors
    ...options,
    style: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    progressStyle: {
      background: 'linear-gradient(to right, #ef4444, #dc2626)',
    },
  });
};

// Warning toast with custom styling
export const showWarning = (message, options = {}) => {
  return toast.warning(message, {
    ...toastConfig,
    ...options,
    style: {
      backgroundColor: '#fffbeb',
      color: '#d97706',
      border: '1px solid #fed7aa',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    progressStyle: {
      background: 'linear-gradient(to right, #f59e0b, #d97706)',
    },
  });
};

// Info toast with custom styling
export const showInfo = (message, options = {}) => {
  return toast.info(message, {
    ...toastConfig,
    ...options,
    style: {
      backgroundColor: '#eff6ff',
      color: '#2563eb',
      border: '1px solid #bfdbfe',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    progressStyle: {
      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
    },
  });
};

// Loading toast
export const showLoading = (message = 'Loading...', options = {}) => {
  return toast.loading(message, {
    ...toastConfig,
    autoClose: false, // Don't auto close loading
    closeOnClick: false, // Don't close on click
    ...options,
    style: {
      backgroundColor: '#f8fafc',
      color: '#475569',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
  });
};

// Update loading toast to success
export const updateLoadingToSuccess = (toastId, message, options = {}) => {
  toast.update(toastId, {
    render: message,
    type: "success",
    ...toastConfig,
    autoClose: 4000,
    closeOnClick: true,
    ...options,
    style: {
      backgroundColor: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    progressStyle: {
      background: 'linear-gradient(to right, #22c55e, #16a34a)',
    },
  });
};

// Update loading toast to error
export const updateLoadingToError = (toastId, message, options = {}) => {
  toast.update(toastId, {
    render: message,
    type: "error",
    ...toastConfig,
    autoClose: 5000,
    closeOnClick: true,
    ...options,
    style: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    progressStyle: {
      background: 'linear-gradient(to right, #ef4444, #dc2626)',
    },
  });
};

// Dismiss toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  updateLoadingToSuccess,
  updateLoadingToError,
  dismissToast,
  dismissAllToasts,
};
