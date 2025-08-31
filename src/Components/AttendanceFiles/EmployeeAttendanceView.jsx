import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../Components';
import { 
  Calendar, 
  Clock, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Filter
} from 'lucide-react';
import api from '../../services/api';
import { formatDateWithDay, formatTime, getMonthName } from '../../utils/dateUtils';

const EmployeeAttendanceView = ({ employee, onBack }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('monthly'); // monthly, previous
  const [statusFilter, setStatusFilter] = useState('all'); // all, present, absent
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    total: 0
  });

  useEffect(() => {
    if (employee) {
      fetchEmployeeAttendance();
    }
  }, [employee, currentMonth, currentYear, viewMode]);

  // Ensure stats are updated when month/year changes
  useEffect(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    setStats(prevStats => ({
      ...prevStats,
      total: daysInMonth
    }));
  }, [currentMonth, currentYear]);

  const fetchEmployeeAttendance = async () => {
    try {
      setLoading(true);
      let response;
      
      if (viewMode === 'monthly') {
        response = await api.getMonthlyAttendance(currentMonth + 1, currentYear, {
          user: employee.id
        });
        
                 // Handle monthly response structure
         if (response.attendance_records) {
           setAttendance(response.attendance_records);
           // Ensure we have the correct total days calculation
           const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
           setStats({
             present: response.statistics?.present_days || 0,
             absent: response.statistics?.absent_days || (daysInMonth - (response.statistics?.present_days || 0)),
             total: response.statistics?.total_days_in_month || daysInMonth
           });
         } else {
           setAttendance(response.results || response);
           calculateStats(response.results || response);
         }
      } else {
        // For previous months, get last 3 months
        const endDate = new Date(currentYear, currentMonth + 1, 0);
        const startDate = new Date(currentYear, currentMonth - 2, 1);
        
        response = await api.getAttendanceReport(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          { user: employee.id }
        );
        
        setAttendance(response.results || response);
        calculateStats(response.results || response);
      }
    } catch (error) {
      console.error('Failed to fetch employee attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (attendanceData) => {
    // Calculate total days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const present = attendanceData.filter(a => a.status === 'present').length;
    const absent = daysInMonth - present; // Correct calculation: Total Days - Present Days = Absent Days
    
    console.log('calculateStats:', {
      currentYear,
      currentMonth,
      daysInMonth,
      present,
      absent,
      attendanceDataLength: attendanceData.length
    });
    
    setStats({ 
      present, 
      absent, 
      total: daysInMonth // Total days in month
    });
  };

  const changeMonth = (direction) => {
    if (direction === 'next') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      half_day: 'bg-orange-100 text-orange-800',
      leave: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getFilteredAttendance = () => {
    if (statusFilter === 'all') {
      return attendance;
    }
    return attendance.filter(record => record.status === statusFilter);
  };

  // Generate complete month view with all days (present and absent)
  const generateCompleteMonthView = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const completeMonth = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentYear, currentMonth, day);
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Find if there's an attendance record for this day
      const attendanceRecord = attendance.find(record => {
        const recordDate = new Date(record.date);
        return recordDate.getDate() === day && 
               recordDate.getMonth() === currentMonth && 
               recordDate.getFullYear() === currentYear;
      });
      
      if (attendanceRecord) {
        // Present day - use actual attendance record
        completeMonth.push({
          ...attendanceRecord,
          isPresent: true,
          displayDate: currentDate
        });
      } else {
        // Absent day - create a placeholder record
        completeMonth.push({
          id: `absent-${day}`,
          date: dateString,
          check_in_time: null,
          check_out_time: null,
          total_hours: 0,
          status: 'absent',
          notes: 'No attendance record',
          isPresent: false,
          displayDate: currentDate
        });
      }
    }
    
    return completeMonth;
  };



  const exportEmployeeAttendance = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const csvContent = [
      ['Employee', 'Date', 'Check In', 'Check Out', 'Status', 'Total Hours', 'Notes'],
      ...attendance.map(record => [
        `${employee.first_name} ${employee.last_name}`,
        record.date,
        formatTime(record.check_in_time),
        formatTime(record.check_out_time),
        record.status,
        record.total_hours || 'N/A',
        record.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const monthDisplay = getMonthName(currentMonth);
    a.download = `${employee.first_name}_${employee.last_name}_attendance_${monthDisplay}_${currentYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {employee.first_name} {employee.last_name}
            </h2>
            <p className="text-sm text-gray-600">
              Employee ID: {employee.employee_id || 'Not assigned'}
            </p>
          </div>
        </div>
        <Button onClick={exportEmployeeAttendance} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center space-x-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly View
          </button>
          <button
            onClick={() => setViewMode('previous')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'previous'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Previous Months
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button onClick={() => changeMonth('prev')} variant="outline" size="sm">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <h3 className="text-lg font-medium text-gray-900">
          {getMonthName(currentMonth)} {currentYear}
        </h3>
        <Button onClick={() => changeMonth('next')} variant="outline" size="sm">
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>


      {/* Simple Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {stats.total || new Date(currentYear, currentMonth + 1, 0).getDate()}
            </div>
            <div className="text-lg text-gray-600">Total Days in Month</div>
            <div className="text-sm text-gray-500 mt-1">{getMonthName(currentMonth)} {currentYear}</div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.present}</div>
            <div className="text-lg text-gray-600">Present Days</div>
            <div className="text-sm text-gray-500 mt-1">{getMonthName(currentMonth)} {currentYear}</div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{stats.absent}</div>
            <div className="text-lg text-gray-600">Absent Days</div>
            <div className="text-sm text-gray-500 mt-1">{getMonthName(currentMonth)} {currentYear}</div>
          </div>
        </Card>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Records</option>
            <option value="present">Present Only</option>
            <option value="absent">Absent Only</option>
          </select>
        </div>
                 <div className="text-sm text-gray-600">
           Showing {generateCompleteMonthView().length} days for {getMonthName(currentMonth)} {currentYear}
         </div>
      </div>

      {/* Attendance Table */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
                 ) : generateCompleteMonthView().length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                </tr>
              </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                  {generateCompleteMonthView().map((record) => (
                   <tr key={record.id} className={`hover:bg-gray-50 ${!record.isPresent ? 'bg-red-50' : ''}`}>
                     <td className={`px-6 py-4 whitespace-nowrap text-sm ${!record.isPresent ? 'text-red-900 font-medium' : 'text-gray-900'}`}>
                       {formatDateWithDay(record.date)}
                     </td>
                     <td className={`px-6 py-4 whitespace-nowrap text-sm ${!record.isPresent ? 'text-red-600' : 'text-gray-600'}`}>
                       {record.isPresent ? formatTime(record.check_in_time) : 'Not Checked In'}
                     </td>
                     <td className={`px-6 py-4 whitespace-nowrap text-sm ${!record.isPresent ? 'text-red-600' : 'text-gray-600'}`}>
                       {record.isPresent ? formatTime(record.check_out_time) : 'Not Checked Out'}
                     </td>
                     <td className={`px-6 py-4 whitespace-nowrap text-sm ${!record.isPresent ? 'text-red-600' : 'text-gray-600'}`}>
                       {record.isPresent ? (record.total_hours ? `${record.total_hours}h` : 'N/A') : '0h'}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(record.status)}`}>
                         {record.status}
                       </span>
                     </td>
                     <td className={`px-6 py-4 text-sm ${!record.isPresent ? 'text-red-600' : 'text-gray-600'}`}>
                       {record.notes || '-'}
                     </td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No days to display
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Unable to generate month view for {getMonthName(currentMonth)} {currentYear}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmployeeAttendanceView;
