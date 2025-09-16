import React, { useState } from 'react';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileX,
  Calendar,
  User,
  Building
} from 'lucide-react';

const ResignationTable = ({ 
  resignations, 
  loading, 
  onView, 
  onApprove, 
  onReject,
  currentUser 
}) => {

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <FileX className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canTakeAction = (resignation) => {
    return resignation.status === 'pending' && 
           (currentUser?.is_superuser || 
            currentUser?.role === 'admin' || 
            currentUser?.role === 'manager');
  };

  const handleApprove = (resignation) => {
    onApprove(resignation);
  };

  const handleReject = (resignation) => {
    onReject(resignation);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-3">
          <div className="animate-pulse space-y-3">
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-3 py-2 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">Resignation Requests</h3>
        <p className="text-xs text-gray-500">
          Manage employee resignation requests from your office
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Office
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submission Date
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notice Period
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Working Date
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied Date
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {resignations.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-3 py-8 text-center">
                  <div className="flex flex-col items-center">
                    <FileX className="h-8 w-8 text-gray-400 mb-2" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No Resignation Requests</h3>
                    <p className="text-xs text-gray-500">No resignation requests have been submitted yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              resignations.map((resignation) => (
                <tr key={resignation.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                        {resignation.user_name?.charAt(0) || 'U'}
                      </div>
                      <div className="ml-2">
                        <div className="text-xs font-medium text-gray-900">
                          {resignation.user_name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {resignation.user_employee_id || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center text-xs text-gray-900">
                      <Building className="h-3 w-3 text-gray-400 mr-1" />
                      {resignation.user_office_name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center text-xs text-gray-900">
                      <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                      {formatDate(resignation.resignation_date)}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                    {resignation.notice_period_days} days
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center text-xs text-gray-900">
                      <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                      {formatDate(resignation.last_working_date)}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(resignation.status)}`}>
                      {getStatusIcon(resignation.status)}
                      <span className="ml-1 capitalize">{resignation.status}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">
                    {formatDate(resignation.created_at)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs font-medium">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onView(resignation)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors duration-200"
                        title="View Details"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      
                      {canTakeAction(resignation) && (
                        <>
                          <button
                            onClick={() => handleApprove(resignation)}
                            className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors duration-200"
                            title="Approve"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleReject(resignation)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors duration-200"
                            title="Reject"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResignationTable;
