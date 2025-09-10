import React, { useState } from 'react';
import { X, XCircle, AlertTriangle, Calendar, User } from 'lucide-react';

const ResignationRejectionModal = ({ 
  resignation, 
  isOpen, 
  onClose, 
  onConfirm, 
  loading = false 
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [errors, setErrors] = useState({});

  if (!isOpen || !resignation) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!rejectionReason.trim()) {
      newErrors.rejectionReason = 'Rejection reason is required';
    } else if (rejectionReason.trim().length < 10) {
      newErrors.rejectionReason = 'Rejection reason must be at least 10 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm(resignation.id, { rejection_reason: rejectionReason.trim() });
    }
  };

  const handleClose = () => {
    setRejectionReason('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Reject Resignation</h2>
              <p className="text-sm text-gray-500">Provide reason for rejection</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            disabled={loading}
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Employee Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {resignation.user_name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{resignation.user_name}</h3>
                <p className="text-sm text-gray-500">{resignation.user_employee_id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Department:</span>
                <p className="font-medium">{resignation.user_department || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Designation:</span>
                <p className="font-medium">{resignation.user_designation || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Resignation Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              Resignation Request Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Submission Date:</span>
                <p className="font-medium">{formatDate(resignation.resignation_date)}</p>
              </div>
              <div>
                <span className="text-gray-500">Notice Period:</span>
                <p className="font-medium">{resignation.notice_period_days} days</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Reason for Resignation:</span>
                <p className="font-medium text-gray-700 mt-1">{resignation.reason || 'No reason provided'}</p>
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (errors.rejectionReason) {
                  setErrors(prev => ({ ...prev, rejectionReason: '' }));
                }
              }}
              placeholder="Please provide a clear and constructive reason for rejecting this resignation request..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none ${
                errors.rejectionReason ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={4}
              disabled={loading}
            />
            {errors.rejectionReason && (
              <p className="text-sm text-red-600">{errors.rejectionReason}</p>
            )}
            <p className="text-xs text-gray-500">
              This reason will be shared with the employee and should be professional and constructive.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800">Important Notice</p>
                <p className="text-red-700 mt-1">
                  Rejecting a resignation request should only be done in exceptional circumstances. 
                  Consider discussing alternatives with the employee before rejection.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Rejecting...</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                <span>Reject Resignation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResignationRejectionModal;
