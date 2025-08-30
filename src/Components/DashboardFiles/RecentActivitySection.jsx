import React from 'react';
import { Card } from '../../Components';
import { Activity, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const RecentActivitySection = ({ recentAttendance, pendingLeaves }) => {
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
      {/* Recent Attendance */}
      <Card className="shadow-lg border-2 border-gray-100">
        <div className="card-header">
          <h2 className="text-xl font-bold text-gray-900">Recent Attendance</h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {recentAttendance.length > 0 ? (
              recentAttendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl ${getStatusBadge(record.status)}`}>
                      {getStatusIcon(record.status)}
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">
                        {record.user?.first_name} {record.user?.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{record.date}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusBadge(record.status)}`}>
                    {record.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent attendance records</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Pending Leave Requests */}
      <Card className="shadow-lg border-2 border-gray-100">
        <div className="card-header">
          <h2 className="text-xl font-bold text-gray-900">Pending Leave Requests</h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {pendingLeaves.length > 0 ? (
              pendingLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl ${getStatusBadge(leave.status)}`}>
                      {getStatusIcon(leave.status)}
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">
                        {leave.user?.first_name} {leave.user?.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {leave.start_date} - {leave.end_date}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusBadge(leave.status)}`}>
                    {leave.leave_type}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending leave requests</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RecentActivitySection;
