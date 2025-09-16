import React from 'react';
import { Card, Button } from '../../Components';
import { Calendar, CheckCircle, AlertCircle, Clock, ArrowRight, Eye } from 'lucide-react';

const RecentActivitySection = ({ pendingLeaves, onViewLeaves }) => {
  const getStatusBadge = (status) => {
    const badges = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      present: <CheckCircle className="h-4 w-4" />,
      absent: <AlertCircle className="h-4 w-4" />,
      late: <Clock className="h-4 w-4" />,
      approved: <CheckCircle className="h-4 w-4" />,
      pending: <Clock className="h-4 w-4" />,
      rejected: <AlertCircle className="h-4 w-4" />
    };
    return icons[status] || <Activity className="h-4 w-4" />;
  };

  return (
    <div className="content-grid">
      {/* Pending Leave Requests */}
      <Card className="shadow-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Pending Leave Requests</h2>
            <Button
              onClick={onViewLeaves}
              size="sm"
              variant="outline"
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <Eye className="h-4 w-4 mr-1" />
              View All
            </Button>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {pendingLeaves.length > 0 ? (
              pendingLeaves.map((leave) => (
                <div 
                  key={leave.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                  onClick={() => onViewLeaves(leave)}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${getStatusBadge(leave.status)}`}>
                      {getStatusIcon(leave.status)}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900 text-sm">
                        {leave.user?.first_name} {leave.user?.last_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {leave.start_date} - {leave.end_date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(leave.status)}`}>
                      {leave.leave_type}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No pending leave requests</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RecentActivitySection;
