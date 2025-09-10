import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  User,
  Search,
  Filter,
  AlertTriangle,
  Timer,
  CalendarDays,
  Eye
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
  const [dayStatusFilter, setDayStatusFilter] = useState('');
  const [lateFilter, setLateFilter] = useState('');

  // Calculate enhanced statistics
  const stats = useMemo(() => {
    const total = todayAttendance.length;
    const present = todayAttendance.filter(att => att.status === 'present').length;
    const absent = total - present; // Correct calculation: Total - Present = Absent
    
    // New statistics for enhanced attendance system
    const completeDays = todayAttendance.filter(att => att.day_status === 'complete_day').length;
    const halfDays = todayAttendance.filter(att => att.day_status === 'half_day').length;
    const lateComing = todayAttendance.filter(att => att.is_late === true).length;
    
    return {
      total,
      present,
      absent,
      completeDays,
      halfDays,
      lateComing,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0
    };
  }, [todayAttendance]);

  // Enhanced filtering
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

    // Apply day status filter
    if (dayStatusFilter) {
      filtered = filtered.filter(att => att.day_status === dayStatusFilter);
    }

    // Apply late filter
    if (lateFilter !== '') {
      const isLate = lateFilter === 'true';
      filtered = filtered.filter(att => att.is_late === isLate);
    }

    return filtered;
  }, [attendanceData, searchTerm, statusFilter, dayStatusFilter, lateFilter]);

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'present':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'absent':
        return { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' };
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

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDayStatusFilter('');
    setLateFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Complete Days */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Complete Days</p>
              <p className="text-2xl font-bold text-green-600">{stats.completeDays}</p>
              <p className="text-xs text-gray-500">≥ 5 hours</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CalendarDays className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Half Days */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Half Days</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.halfDays}</p>
              <p className="text-xs text-gray-500">≥ 5 hours</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Timer className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

      </div>

      {/* Additional Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Late Coming */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Late Coming</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lateComing}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
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

      {/* Enhanced Filters and Search */}
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
            </select>
          </div>

          {/* Day Status Filter */}
          <div className="md:w-48">
            <select
              value={dayStatusFilter}
              onChange={(e) => setDayStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Day Status</option>
              <option value="complete_day">Complete Day</option>
              <option value="half_day">Half Day</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          {/* Late Coming Filter */}
          <div className="md:w-48">
            <select
              value={lateFilter}
              onChange={(e) => setLateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="true">Late</option>
              <option value="false">On Time</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="md:w-auto">
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="w-full md:w-auto"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Today's Attendance Records</h3>
          <p className="text-sm text-gray-500">
            Showing {filteredData.length} of {todayAttendance.length} records
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late Coming</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((record) => {
                const statusInfo = getStatusInfo(record.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.user?.first_name} {record.user?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {record.user?.employee_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.check_in_time ? (
                        <span className="text-green-600 font-medium">{formatTime(record.check_in_time)}</span>
                      ) : (
                        <span className="text-red-500">Not checked in</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.check_out_time ? (
                        <span className="text-blue-600 font-medium">{formatTime(record.check_out_time)}</span>
                      ) : (
                        <span className="text-gray-500">Not checked out</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon className={`h-4 w-4 mr-2 ${statusInfo.color}`} />
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        record.day_status === 'complete_day' ? 'bg-green-100 text-green-800' :
                        record.day_status === 'half_day' ? 'bg-yellow-100 text-yellow-800' :
                        record.day_status === 'absent' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {record.day_status ? record.day_status.replace('_', ' ').toUpperCase() : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          record.is_late ? 'bg-orange-100' : 'bg-gray-100'
                        }`}>
                          {record.is_late ? (
                            <AlertTriangle className="w-3 h-3 text-orange-600" />
                          ) : (
                            <CheckCircle className="w-3 h-3 text-gray-600" />
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          record.is_late ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {record.is_late ? 'Late' : 'On Time'}
                        </span>
                        {record.is_late && record.late_minutes && (
                          <div className="text-xs text-orange-600">
                            {record.late_minutes} min
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        onClick={() => onViewEmployee(record.user)}
                        size="sm"
                        variant="outline"
                        className="flex items-center"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No attendance records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceOverview;
