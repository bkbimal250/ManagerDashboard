import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  RefreshCw,
  AlertTriangle,
  Timer,
  CalendarDays
} from 'lucide-react';
import { Button } from '../index';
import api from '../../services/api';

const CheckinCheckoutView = ({ officeId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch check-in/check-out data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getCheckinCheckoutData({
        office: officeId,
        date: selectedDate
      });
      
      setData(response);
    } catch (err) {
      console.error('Error fetching check-in/check-out data:', err);
      
      // Better error handling
      let errorMessage = 'Failed to fetch data';
      if (err.response?.status === 500) {
        errorMessage = 'Server error - please try again or contact administrator';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and date change
  useEffect(() => {
    fetchData();
  }, [selectedDate, officeId]);

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Export data to CSV
  const handleExport = () => {
    if (!data) return;
    
    const csvContent = [
      // Enhanced header with new fields
      ['Employee ID', 'Employee Name', 'Check In Time', 'Check Out Time', 'Working Hours', 'Status', 'Day Status', 'Late Coming', 'Late Minutes', 'Device'],
      // Data rows
      ...data.attendance_details.map(att => [
        att.employee_id_number || '',
        att.employee_name,
        att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString() : 'Not Checked In',
        att.check_out_time ? new Date(att.check_out_time).toLocaleTimeString() : 'Not Checked Out',
        att.working_hours ? `${att.working_hours}h` : 'N/A',
        att.status,
        att.day_status ? att.day_status.replace('_', ' ').toUpperCase() : 'N/A',
        att.is_late ? 'Yes' : 'No',
        att.late_minutes > 0 ? `${att.late_minutes} min` : 'N/A',
        att.device_name || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checkin_checkout_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get status icon and color from backend status
  const getStatusInfoFromBackend = (status) => {
    switch (status) {
      case 'present':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', text: 'Present' };
      case 'absent':
        return { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', text: 'Absent' };
      case 'checked_in_only':
        return { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-100', text: 'Checked In Only' };
      case 'late':
        return { icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-100', text: 'Late' };
      case 'half_day':
        return { icon: Timer, color: 'text-yellow-600', bgColor: 'bg-yellow-100', text: 'Half Day' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600', bgColor: 'bg-gray-100', text: status || 'Unknown' };
    }
  };

  // Get day status badge
  const getDayStatusBadge = (dayStatus) => {
    switch (dayStatus) {
      case 'complete_day':
        return 'bg-green-100 text-green-800';
      case 'half_day':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get late status badge
  const getLateStatusBadge = (isLate) => {
    return isLate ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">Loading check-in/check-out data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-red-400 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data || !data.attendance_details) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No check-in/check-out data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Check-in/Check-out Records</h2>
          <p className="text-gray-600">Monitor daily attendance patterns and working hours</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <label htmlFor="date-select" className="text-sm font-medium text-gray-700">
              Select Date:
            </label>
          </div>
          <input
            id="date-select"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{data.total_employees || 0}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present Today</p>
              <p className="text-2xl font-bold text-green-600">
                {data.attendance_details.filter(att => att.status === 'present').length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Complete Days</p>
              <p className="text-2xl font-bold text-green-600">
                {data.attendance_details.filter(att => att.day_status === 'complete_day').length}
              </p>
              <p className="text-xs text-gray-500">≥ 5 hours</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CalendarDays className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Late Coming</p>
              <p className="text-2xl font-bold text-orange-600">
                {data.attendance_details.filter(att => att.is_late === true).length}
              </p>
              <p className="text-xs text-gray-500">After 11:30 AM</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Attendance Details</h3>
          <p className="text-sm text-gray-500">
            {selectedDate} • {data.attendance_details.length} records
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Working Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late Coming</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.attendance_details.map((att, index) => {
                const statusInfo = getStatusInfoFromBackend(att.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {att.employee_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {att.employee_id_number || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.check_in_time ? (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-green-500" />
                          {new Date(att.check_in_time).toLocaleTimeString()}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not checked in</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.check_out_time ? (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-red-500" />
                          {new Date(att.check_out_time).toLocaleTimeString()}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not checked out</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.working_hours ? (
                        <div className="flex items-center">
                          <Timer className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">{att.working_hours}h</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon className={`h-4 w-4 mr-2 ${statusInfo.color}`} />
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDayStatusBadge(att.day_status)}`}>
                        {att.day_status ? att.day_status.replace('_', ' ').toUpperCase() : 'N/A'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          att.is_late ? 'bg-orange-100' : 'bg-gray-100'
                        }`}>
                          {att.is_late ? (
                            <AlertTriangle className="w-3 h-3 text-orange-600" />
                          ) : (
                            <CheckCircle className="w-3 h-3 text-gray-600" />
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLateStatusBadge(att.is_late)}`}>
                          {att.is_late ? 'Late' : 'On Time'}
                        </span>
                        {att.is_late && att.late_minutes && (
                          <div className="text-xs text-orange-600">
                            {att.late_minutes} min
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.device_name || 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* No Data State */}
      {data.attendance_details.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No attendance records found for {selectedDate}</p>
        </div>
      )}
    </div>
  );
};

export default CheckinCheckoutView;
