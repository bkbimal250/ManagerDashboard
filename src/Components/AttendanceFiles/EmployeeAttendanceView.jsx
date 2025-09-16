import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Button, Input, Select } from '../index';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Search, 
  Edit3,
  Check,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto close after 4 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`rounded-lg shadow-lg p-4 flex items-center space-x-3 ${
        type === 'success' 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className={`flex-shrink-0 ${
          type === 'success' ? 'text-green-400' : 'text-red-400'
        }`}>
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${
            type === 'success' 
              ? 'text-green-400 hover:text-green-600' 
              : 'text-red-400 hover:text-red-600'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const EmployeeAttendanceView = ({ selectedEmployee }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [stats, setStats] = useState({
    totalDaysInMonth: 0,
    presentDays: 0,
    absentDays: 0,
    completeDays: 0,
    halfDays: 0,
    lateComingDays: 0,
    attendanceRate: 0
  });
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({
    status: '',
    dayStatus: '',
    notes: ''
  });

  // Calculate current date for the selected month
  const currentDate = useMemo(() => {
    return new Date(currentYear, currentMonth - 1, 1);
  }, [currentYear, currentMonth]);

  // Calculate start and end dates for the month
  const { startDate, endDate } = useMemo(() => {
    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${new Date(currentYear, currentMonth, 0).getDate()}`;
    return { startDate, endDate };
  }, [currentYear, currentMonth]);

  // Fetch employee attendance data
  const fetchEmployeeAttendance = useCallback(async () => {
    if (!selectedEmployee) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null); // Clear any previous success messages

    // console.log('🔍 Fetching attendance for:', {
    //   employeeId: selectedEmployee.id,
    //   selectedEmployee: selectedEmployee,
    //   startDate,
    //   endDate,
    //   year: currentYear,
    //   month: currentMonth
    // });

    try {
      // Check if we have authentication token
      const token = localStorage.getItem('access_token');

      // console.log('🔑 Auth token available:', !!token);
      // console.log('🔑 Token preview:', token ? `${token.substring(0, 20)}...` : 'None');
      
      // Test API connection first
      try {
        const testResponse = await fetch(`https://company.d0s369.co.in/api/attendance/monthly_attendance/?user=${selectedEmployee.id}&year=${currentYear}&month=${currentMonth}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('🧪 Test API response status:', testResponse.status);
        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log('🧪 Test API response data:', testData);
        } else {
          console.error('🧪 Test API failed:', testResponse.status, testResponse.statusText);
          const errorText = await testResponse.text();
          console.error('🧪 Test API error response:', errorText);
        }
      } catch (testError) {
        console.error('🧪 Test API error:', testError);
      }
      
      const response = await api.getEmployeeAttendance(
        selectedEmployee.id,
        startDate,
        endDate
      );

      console.log('✅ Attendance data received:', response);

      // The API returns data directly, not wrapped in success/data structure
      if (response && response.monthly_data) {
        setAttendanceData(response.monthly_data || []);
        
        // Update statistics - remove working days, present days = working days
        const statistics = response.statistics || {};
        setStats({
          totalDaysInMonth: statistics.total_days_in_month || 0,
          presentDays: statistics.present_days || 0,
          absentDays: statistics.absent_days || 0,
          completeDays: statistics.complete_days || 0,
          halfDays: statistics.half_days || 0,
          lateComingDays: statistics.late_coming_days || 0,
          attendanceRate: statistics.attendance_rate || 0
        });
      } else {
        // console.error('❌ API response indicates failure:', response);
        setError('Failed to fetch attendance data');
      }
    } catch (error) {
      console.error('❌ Error fetching attendance:', error);

      // console.error('❌ Error details:', {
      //   message: error.message,
      //   response: error.response?.data,
      //   status: error.response?.status,
      //   statusText: error.response?.statusText
      // });

      setError(`Error fetching attendance data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedEmployee, startDate, endDate, currentYear, currentMonth]);

  // Handle month navigation
  const handleMonthChange = useCallback((direction) => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  }, [currentMonth, currentYear]);

  // Handle status editing
  const handleEditClick = useCallback((row) => {

    // console.log('🔧 Starting edit for row:', row);

    setEditingRow(row);
    setError(null); // Clear any previous errors
    setSuccessMessage(null); // Clear any previous success messages
    setEditForm({
      status: row.status || 'absent',
      dayStatus: row.day_status || 'absent',
      notes: row.notes || ''
    });
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingRow(null);
    setError(null); // Clear any previous errors
    setSuccessMessage(null); // Clear any previous success messages
    setEditForm({
      status: '',
      dayStatus: '',
      notes: ''
    });
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editingRow || !selectedEmployee) return;

    // Validate the form data
    if (!editForm.status || !editForm.dayStatus) {
      setError('Status and Day Status are required');
      return;
    }

    if (!['present', 'absent'].includes(editForm.status)) {
      setError('Invalid status value. Must be "present" or "absent"');
      return;
    }

    if (!['complete_day', 'half_day', 'absent'].includes(editForm.dayStatus)) {
      setError('Invalid day status value. Must be "complete_day", "half_day", or "absent"');
      return;
    }

    // console.log('🔧 Updating attendance status:', {
    //   employeeId: selectedEmployee.id,
    //   date: editingRow.date,
    //   dateType: typeof editingRow.date,
    //   dateValue: editingRow.date,
    //   status: editForm.status,
    //   dayStatus: editForm.dayStatus,
    //   notes: editForm.notes
    // });

    try {
      // Ensure date is in YYYY-MM-DD format
      let formattedDate = editingRow.date;
      if (typeof editingRow.date === 'string') {
        // If it's already a string, make sure it's in the right format
        const dateObj = new Date(editingRow.date);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toISOString().split('T')[0];
        }
      } else if (editingRow.date instanceof Date) {
        formattedDate = editingRow.date.toISOString().split('T')[0];
      }

      console.log('📅 Formatted date:', formattedDate);

      const result = await api.updateAttendanceStatus(
        selectedEmployee.id,
        formattedDate,
        editForm.status,
        editForm.dayStatus,
        editForm.notes
      );

      console.log('✅ Status update result:', result);

      // Handle both direct response and wrapped response formats
      let responseData = result;
      if (result && result.success && result.data) {
        // Wrapped response format: { success: true, data: {...} }
        responseData = result.data;
      }

      if (responseData && (responseData.id || responseData.message)) {
        // Update the local data
        setAttendanceData(prevData => 
          prevData.map(item => 
            item.date === editingRow.date 
              ? { 
                  ...item, 
                  status: editForm.status, 
                  day_status: editForm.dayStatus,
                  notes: editForm.notes,
                  id: responseData.id || item.id
                }
              : item
          )
        );

        // Refresh data to get updated statistics
        await fetchEmployeeAttendance();
        
        // Show success message
        setError(null); // Clear any previous errors
        try {
          const displayDate = new Date(editingRow.date).toLocaleDateString();
          setSuccessMessage(`✅ Attendance status updated successfully for ${displayDate}!`);
        } catch (dateError) {
          // Fallback if date formatting fails
          setSuccessMessage(`✅ Attendance status updated successfully!`);
        }
        
        setEditingRow(null);
        setEditForm({
          status: '',
          dayStatus: '',
          notes: ''
        });
      } else {
        console.error('❌ Invalid response structure:', result);
        setError('Failed to update status - invalid response from server');
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Show more specific error message
      if (error.response?.data?.error) {
        setError(`❌ Server error: ${error.response.data.error}`);
      } else if (error.response?.status === 403) {
        setError('❌ Permission denied. Only managers and admins can update attendance status.');
      } else if (error.response?.status === 400) {
        setError('❌ Invalid data. Please check the status and day status values.');
      } else if (error.response?.status === 404) {
        setError('❌ User not found or inactive.');
      } else {
        setError(`❌ Error updating attendance status: ${error.message}`);
      }
    }
  }, [editingRow, editForm, selectedEmployee, fetchEmployeeAttendance]);

  // Get status badge styling
  const getStatusBadge = useCallback((status) => {
    if (status === 'absent') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-green-100 text-green-800';
  }, []);

  // Get day status badge styling
  const getDayStatusBadge = useCallback((dayStatus) => {
    switch (dayStatus) {
      case 'complete_day':
        return 'bg-blue-100 text-blue-800';
      case 'half_day':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    if (!attendanceData.length) return;

    const monthName = new Date(currentYear, currentMonth - 1, 1).toLocaleString('default', { month: 'long' });
    const filename = `${selectedEmployee.first_name}_${selectedEmployee.last_name}_attendance_${monthName}_${currentYear}.csv`;

    const csvContent = [
      ['Date', 'Status', 'Day Status', 'Check In', 'Check Out', 'Total Hours', 'Late', 'Notes'],
      ...attendanceData.map(attendance => [
        attendance.date,
        attendance.status === 'absent' ? 'Absent' : 'Present',
        attendance.day_status || 'N/A',
        attendance.check_in_time ? new Date(attendance.check_in_time).toLocaleTimeString() : 'N/A',
        attendance.check_out_time ? new Date(attendance.check_out_time).toLocaleTimeString() : 'N/A',
        attendance.total_hours || 'N/A',
        attendance.is_late ? 'Yes' : 'No',
        attendance.notes || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [attendanceData, currentYear, currentMonth, selectedEmployee]);

  // Fetch data when component mounts or parameters change
  useEffect(() => {
    fetchEmployeeAttendance();
  }, [fetchEmployeeAttendance]);

  // Monitor year and month changes
  useEffect(() => {
    fetchEmployeeAttendance();
  }, [currentYear, currentMonth]);

  if (!selectedEmployee) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please select an employee to view attendance</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <Toast 
        message={successMessage} 
        type="success" 
        onClose={() => setSuccessMessage(null)} 
      />
      <Toast 
        message={error} 
        type="error" 
        onClose={() => setError(null)} 
      />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedEmployee.first_name} {selectedEmployee.last_name} - Attendance
          </h2>
          <p className="text-gray-600">
            Employee ID: {selectedEmployee.employee_id} • Department: {selectedEmployee.department_name || 'Not assigned'} • Designation: {selectedEmployee.designation_name || 'Not assigned'}
          </p>
        </div>
        <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <Button
          onClick={() => handleMonthChange('prev')}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <p className="text-sm text-gray-600">
            {stats.totalDaysInMonth} total days • {stats.presentDays} present days • {attendanceData.length} records
          </p>
        </div>
        
        <Button
          onClick={() => handleMonthChange('next')}
          variant="outline"
          size="sm"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="text-center">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-500">Total Days</h4>
            <p className="text-2xl font-bold text-gray-900">{stats.totalDaysInMonth}</p>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-500">Present Days</h4>
            <p className="text-2xl font-bold text-green-600">{stats.presentDays}</p>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-500">Absent Days</h4>
            <p className="text-2xl font-bold text-red-600">{stats.absentDays}</p>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-500">Complete Days</h4>
            <p className="text-2xl font-bold text-blue-600">{stats.completeDays}</p>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-500">Half Days</h4>
            <p className="text-2xl font-bold text-yellow-600">{stats.halfDays}</p>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-500">Attendance Rate</h4>
            <p className="text-2xl font-bold text-indigo-600">{stats.attendanceRate}%</p>
          </div>
        </Card>
      </div>

      

      {/* Detailed Attendance Records */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Detailed Attendance Records
            </h3>
            <p className="text-sm text-gray-600">
              Showing {attendanceData.length} records • Frontend Month: {currentMonth} • Total Days: {stats.totalDaysInMonth}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading attendance data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day Status
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
                      Late
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceData.map((attendance, index) => (
                    <tr key={attendance.id || `absent-${index}`} className="hover:bg-gray-50">
                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         <div>
                           <div className="font-medium">
                             {new Date(attendance.date).toLocaleDateString('en-US', { 
                               weekday: 'short',
                               month: 'short',
                               day: 'numeric'
                             })}
                           </div>
                           <div className="text-xs text-gray-500">
                             {new Date(attendance.date).toLocaleDateString('en-US', { 
                               year: 'numeric'
                             })}
                           </div>
                         </div>
                       </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingRow?.date === attendance.date ? (
                          <Select
                            value={editForm.status}
                            onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                            className="w-24"
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                          </Select>
                        ) : (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(attendance.status)}`}>
                            {attendance.status === 'absent' ? 'ABSENT' : 'PRESENT'}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingRow?.date === attendance.date ? (
                          <Select
                            value={editForm.dayStatus}
                            onChange={(e) => setEditForm(prev => ({ ...prev, dayStatus: e.target.value }))}
                            className="w-32"
                          >
                            <option value="complete_day">Complete Day</option>
                            <option value="half_day">Half Day</option>
                            <option value="absent">Absent</option>
                          </Select>
                        ) : (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDayStatusBadge(attendance.day_status)}`}>
                            {attendance.day_status?.replace('_', ' ').toUpperCase() || 'N/A'}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.check_in_time 
                          ? new Date(attendance.check_in_time).toLocaleTimeString() 
                          : 'N/A'
                        }
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.check_out_time 
                          ? new Date(attendance.check_out_time).toLocaleTimeString() 
                          : 'N/A'
                        }
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.total_hours ? `${attendance.total_hours}h` : 'N/A'}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          attendance.is_late ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {attendance.is_late ? 'Yes' : 'No'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingRow?.date === attendance.date ? (
                          <div className="flex space-x-2">
                            <Button
                              onClick={handleEditSave}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={handleEditCancel}
                              size="sm"
                              variant="outline"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleEditClick(attendance)}
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EmployeeAttendanceView;
