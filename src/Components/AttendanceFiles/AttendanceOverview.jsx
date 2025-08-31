import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '../index';

const AttendanceOverview = ({ 
  onViewEmployee, 
  attendanceData = [], 
  todayAttendance = [], 
  attendanceStats = {},
  filters = {},
  onFilterChange = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Calculate statistics
  const stats = useMemo(() => {
    const total = todayAttendance.length;
    const present = todayAttendance.filter(att => att.status === 'present').length;
    const absent = total - present; // Correct calculation: Total - Present = Absent
    const late = todayAttendance.filter(att => att.status === 'late').length;
    const onLeave = todayAttendance.filter(att => att.status === 'leave').length;
    
    return {
      total,
      present,
      absent,
      late,
      onLeave,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0
    };
  }, [todayAttendance]);

  // Filter attendance data
  const filteredData = useMemo(() => {
    let filtered = attendanceData;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(att => 
        att.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.user?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(att => att.status === statusFilter);
    }

    return filtered;
  }, [attendanceData, searchTerm, statusFilter]);

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'present':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'absent':
        return { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' };
      case 'late':
        return { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      case 'leave':
        return { icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'half_day':
        return { icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-100' };
      default:
        return { icon: User, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '--';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Employees */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Present */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Late */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half_day">Half Day</option>
              <option value="leave">Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Today's Attendance</h3>
          <p className="text-sm text-gray-600">
            {formatDate(new Date().toISOString())} • {filteredData.length} records
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm">No attendance records found</p>
                    <p className="text-xs">Try adjusting your filters or search terms</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((attendance) => {
                  const statusInfo = getStatusInfo(attendance.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {attendance.user?.first_name} {attendance.user?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {attendance.user?.employee_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
                            <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                          </div>
                          <span className={`ml-2 text-sm font-medium capitalize ${statusInfo.color}`}>
                            {attendance.status?.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(attendance.check_in_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(attendance.check_out_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.total_hours ? `${attendance.total_hours}h` : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          onClick={() => onViewEmployee(attendance.user)}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {attendanceData.slice(0, 5).map((attendance) => {
            const statusInfo = getStatusInfo(attendance.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div key={attendance.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
                  <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {attendance.user?.first_name} {attendance.user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(attendance.date)} • {formatTime(attendance.check_in_time)}
                  </p>
                </div>
                <span className={`text-xs font-medium capitalize ${statusInfo.color}`}>
                  {attendance.status?.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AttendanceOverview;
