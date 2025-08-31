import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  RefreshCw
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
      setError(err.response?.data?.detail || 'Failed to fetch data');
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
      // Header
      ['Employee ID', 'Employee Name', 'Check In Time', 'Check Out Time', 'Working Hours', 'Status', 'Device'],
      // Data rows
      ...data.attendance_details.map(att => [
        att.employee_id_number || '',
        att.employee_name,
        att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString() : 'Not Checked In',
        att.check_out_time ? new Date(att.check_out_time).toLocaleTimeString() : 'Not Checked Out',
        att.working_hours ? `${att.working_hours}h` : 'N/A',
        att.status,
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

  // Get status icon and color
  const getStatusInfo = (attendance) => {
    if (!attendance.has_checkin && !attendance.has_checkout) {
      return { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', text: 'Absent' };
    } else if (attendance.has_checkin && !attendance.has_checkout) {
      return { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-100', text: 'Checked In' };
    } else if (attendance.has_checkin && attendance.has_checkout) {
      return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', text: 'Complete' };
    } else {
      return { icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-100', text: 'Unknown' };
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600">Loading check-in/check-out data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-red-400" />
          <span className="ml-2 text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Check-in/Check-out Details</h2>
            <p className="text-sm text-gray-600">
              Detailed attendance information for {data?.date ? new Date(data.date).toLocaleDateString() : 'selected date'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <Button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            
            <Button
              onClick={handleExport}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.total_employees}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{data.summary.present_employees}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Checked In Only</p>
                <p className="text-2xl font-bold text-yellow-600">{data.summary.checked_in_only}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Checked Out</p>
                <p className="text-2xl font-bold text-blue-600">{data.summary.checked_out}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-purple-600">{data.summary.attendance_rate}%</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Employee Attendance Details</h3>
          <p className="text-sm text-gray-600">
            {data?.attendance_details?.length || 0} employees • {data?.date ? new Date(data.date).toLocaleDateString() : 'selected date'}
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
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Working Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.attendance_details?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm">No attendance data found</p>
                    <p className="text-xs">Try selecting a different date</p>
                  </td>
                </tr>
              ) : (
                data?.attendance_details?.map((attendance, index) => {
                  const statusInfo = getStatusInfo(attendance);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {attendance.employee_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attendance.employee_id_number}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatTime(attendance.check_in_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatTime(attendance.check_out_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {attendance.working_hours ? `${attendance.working_hours}h` : '--'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
                            <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                          </div>
                          <span className={`ml-2 text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.device_name || '--'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CheckinCheckoutView;
