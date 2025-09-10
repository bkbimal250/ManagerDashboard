import React from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Building,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const ResignationDetails = ({ resignation, onClose }) => {
  if (!resignation) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
              {resignation.user_name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Resignation Details</h2>
              <p className="text-sm text-gray-500">{resignation.user_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(resignation.status)}
              <span className="text-lg font-medium text-gray-900">Status</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(resignation.status)}`}>
              {resignation.status.charAt(0).toUpperCase() + resignation.status.slice(1)}
            </span>
          </div>

          {/* Employee Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Employee Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900">{resignation.user_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Employee ID</label>
                  <p className="text-gray-900">{resignation.user_employee_id || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900">{resignation.user_department || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Designation</label>
                  <p className="text-gray-900">{resignation.user_designation || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Office</label>
                  <div className="flex items-center text-gray-900">
                    <Building className="h-4 w-4 mr-2 text-gray-400" />
                    {resignation.user_office_name || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-500" />
                Resignation Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Submission Date</label>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(resignation.resignation_date)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Notice Period</label>
                  <div className="flex items-center text-gray-900">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {resignation.notice_period_days} days
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Working Date</label>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(resignation.last_working_date)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Applied Date</label>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDateTime(resignation.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-500" />
              Resignation Reason
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">
                {resignation.reason || 'No reason provided'}
              </p>
            </div>
          </div>

          {/* Approval Information */}
          {(resignation.status === 'approved' || resignation.status === 'rejected') && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                {resignation.status === 'approved' ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2 text-red-500" />
                )}
                {resignation.status === 'approved' ? 'Approval' : 'Rejection'} Information
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {resignation.status === 'approved' ? 'Approved' : 'Rejected'} By
                  </label>
                  <p className="text-gray-900">{resignation.approved_by_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {resignation.status === 'approved' ? 'Approved' : 'Rejected'} At
                  </label>
                  <p className="text-gray-900">{formatDateTime(resignation.approved_at)}</p>
                </div>
                {resignation.status === 'rejected' && resignation.rejection_reason && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{resignation.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Handover Notes */}
          {resignation.handover_notes && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-orange-500" />
                Handover Notes
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{resignation.handover_notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResignationDetails;
