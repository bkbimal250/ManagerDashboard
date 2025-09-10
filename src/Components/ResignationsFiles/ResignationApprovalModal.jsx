import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Calendar, User } from 'lucide-react';

const ResignationApprovalModal = ({ 
  resignation, 
  isOpen, 
  onClose, 
  onConfirm, 
  loading = false 
}) => {
  const [handoverNotes, setHandoverNotes] = useState('');

  if (!isOpen || !resignation) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleConfirm = () => {
    onConfirm(resignation.id, { handover_notes: handoverNotes.trim() });
  };

  const handleClose = () => {
    setHandoverNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Approve Resignation</h2>
              <p className="text-sm text-gray-500">Confirm approval of resignation request</p>
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
              Resignation Timeline
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
                <span className="text-gray-500">Last Working Date:</span>
                <p className="font-medium text-red-600">{formatDate(resignation.last_working_date)}</p>
              </div>
            </div>
          </div>

          {/* Handover Notes */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Handover Notes (Optional)
            </label>
            <textarea
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              placeholder="Add any notes about the handover process or important information..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={4}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              These notes will be visible to the employee and HR team.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Important Notice</p>
                <p className="text-yellow-700 mt-1">
                  Once approved, this resignation cannot be undone. The employee's last working date will be set to{' '}
                  <span className="font-semibold">{formatDate(resignation.last_working_date)}</span>.
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Approving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Approve Resignation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResignationApprovalModal;
