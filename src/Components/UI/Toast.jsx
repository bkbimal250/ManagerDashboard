import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ 
  type = 'success', 
  message, 
  duration = 4000, 
  onClose,
  position = 'bottom-center'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Show toast with animation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto hide after duration
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  // Debug log
  useEffect(() => {
    console.log('Toast rendered:', { type, message, position, isVisible, isExiting });
  }, [type, message, position, isVisible, isExiting]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300);
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconBg: 'bg-green-100',
          progressColor: 'bg-green-500'
        };
      case 'error':
        return {
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconBg: 'bg-red-100',
          progressColor: 'bg-red-500'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="h-6 w-6 text-yellow-600" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconBg: 'bg-yellow-100',
          progressColor: 'bg-yellow-500'
        };
      case 'info':
        return {
          icon: <Info className="h-6 w-6 text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconBg: 'bg-blue-100',
          progressColor: 'bg-blue-500'
        };
      default:
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconBg: 'bg-green-100',
          progressColor: 'bg-green-500'
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  const config = getToastConfig();

  if (!isVisible && !isExiting) return null;

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      {/* Backdrop for center position only */}
      {position === 'center' && (
        <div 
          className={`
            absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm rounded-lg
            transition-opacity duration-300
            ${isVisible && !isExiting ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            margin: '-20px',
            zIndex: -1
          }}
        />
      )}
      
      <div
        className={`
          ${config.bgColor} ${config.borderColor} border rounded-lg shadow-2xl
          max-w-sm w-full mx-4 p-4 relative overflow-hidden
          transition-all duration-300 ease-in-out
          ${position === 'center' ? 'backdrop-blur-md' : ''}
          ${isVisible && !isExiting 
            ? 'opacity-100 translate-y-0 scale-100' 
            : position === 'bottom-center' || position === 'bottom-left' || position === 'bottom-right'
            ? 'opacity-0 translate-y-2 scale-95'
            : 'opacity-0 -translate-y-2 scale-95'
          }
        `}
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
          <div 
            className={`h-full ${config.progressColor} transition-all ease-linear`}
            style={{
              width: isExiting ? '0%' : '100%',
              transitionDuration: isExiting ? '300ms' : `${duration}ms`
            }}
          />
        </div>

        {/* Content */}
        <div className="flex items-start">
          {/* Icon */}
          <div className={`flex-shrink-0 p-2 rounded-full ${config.iconBg} mr-3`}>
            {config.icon}
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${config.textColor}`}>
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`flex-shrink-0 ml-3 p-1 rounded-full hover:bg-gray-200 transition-colors ${config.textColor}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Success Animation */}
        {type === 'success' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 right-2">
              <div className="animate-ping">
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toast;
