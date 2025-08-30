import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../Components';
import { 
  Clock, 
  Users, 
  Calendar,
  Eye,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  Bell
} from 'lucide-react';
import api from '../../services/api';
import realtimeAttendanceService from '../../services/realtimeAttendance';
import { formatDateWithDay, formatTime } from '../../utils/dateUtils';

const AttendanceOverview = ({ onViewEmployee }) => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('today'); // today, date, employee, monthly
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0
  });
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [fingerprintNotifications, setFingerprintNotifications] = useState([]);
  const [zktecoDeviceStatus, setZktecoDeviceStatus] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [currentPage, selectedEmployee, selectedDate, viewMode, currentMonth, currentYear]);

  // Real-time attendance monitoring
  useEffect(() => {
    const startRealtimeMonitoring = () => {
      realtimeAttendanceService.startPolling({
        interval: 5000, // 5 seconds
        onAttendanceUpdate: (data) => {
          // Handle combined data from regular attendance and ZKTeco devices
          const attendanceData = data.regular || data;
          setAttendance(attendanceData);
          calculateStats(attendanceData);
          setLastUpdate(new Date());
          
          // Log ZKTeco device status
          if (data.zkteco && data.zkteco.deviceStatus) {
            console.log('ZKTeco Device Status:', data.zkteco.deviceStatus);
            setZktecoDeviceStatus(data.zkteco.deviceStatus);
          }
        },
        onFingerprintDetected: (changes) => {
          // Add fingerprint notifications
          const newNotifications = Array.isArray(changes) ? changes.map(change => {
            let message = '';
            let icon = 'fingerprint';
            
            switch (change.type) {
              case 'check_in':
                message = `${change.userName} checked in at ${formatTime(change.timestamp)}`;
                icon = 'check-in';
                break;
              case 'check_out':
                message = `${change.userName} checked out at ${formatTime(change.timestamp)}`;
                icon = 'check-out';
                break;
              case 'zkteco_sync':
                message = change.message;
                icon = 'device-sync';
                break;
              case 'device_online':
                message = change.message;
                icon = 'device-online';
                break;
              default:
                message = `${change.userName} ${change.type} at ${formatTime(change.timestamp)}`;
                icon = 'fingerprint';
            }
            
            return {
              id: Date.now() + Math.random(),
              type: change.type,
              message: message,
              timestamp: change.timestamp,
              icon: icon,
              data: change
            };
          }) : [];
          
          setFingerprintNotifications(prev => [...newNotifications, ...prev].slice(0, 10)); // Keep last 10 notifications
        },
        onError: (error) => {
          console.error('Real-time attendance error:', error);
        }
      });
      
      setIsRealtimeActive(true);
    };

    // Start real-time monitoring when component mounts
    startRealtimeMonitoring();

    // Cleanup on unmount
    return () => {
      realtimeAttendanceService.stopPolling();
      setIsRealtimeActive(false);
    };
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.getManagerEmployees();
      console.log('Employees API Response:', response); // Debug log
      
      // Handle different response structures
      let employeesData = [];
      if (Array.isArray(response)) {
        employeesData = response;
      } else if (response && response.results && Array.isArray(response.results)) {
        employeesData = response.results;
      } else if (response && response.employees && Array.isArray(response.employees)) {
        employeesData = response.employees;
      } else if (response && typeof response === 'object') {
        // If response is an object but not the expected structure, try to extract data
        employeesData = Object.values(response).find(val => Array.isArray(val)) || [];
      } else {
        employeesData = [];
      }
      
      console.log('Extracted employeesData:', employeesData); // Debug log
      setEmployees(employeesData);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setEmployees([]); // Ensure it's always an array
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      let response;
      
      const params = {
        page: currentPage,
        limit: 20 // Limit per page to prevent bulk data
      };

      if (viewMode === 'today') {
        response = await api.getTodayAttendance(params);
      } else if (viewMode === 'date') {
        response = await api.getManagerAttendance({
          ...params,
          date: selectedDate
        });
      } else if (viewMode === 'employee' && selectedEmployee) {
        response = await api.getEmployeeAttendance(selectedEmployee, {
          ...params,
          date: selectedDate
        });
      } else if (viewMode === 'monthly') {
        // Get attendance for the selected month using the new backend endpoint
        response = await api.getMonthlyAttendance(currentMonth + 1, currentYear, params);
      } else {
        response = await api.getManagerAttendance(params);
      }
      
      // Handle different response structures based on view mode
      if (viewMode === 'monthly' && response.attendance_records) {
        // New monthly endpoint returns structured data
        setAttendance(response.attendance_records);
        setStats({
          present: response.statistics.present_days,
          absent: response.statistics.absent_days,
          late: response.statistics.late_days,
          total: response.statistics.total_days_in_month
        });
        // No pagination for monthly view as it returns all records for the month
        setTotalPages(1);
      } else if (viewMode === 'today' && response.attendance_records) {
        // New today endpoint returns structured data
        setAttendance(response.attendance_records);
        setStats({
          present: response.statistics.present_records,
          absent: response.statistics.absent_records,
          late: response.statistics.late_records,
          total: response.statistics.total_records
        });
        // No pagination for today view as it's just today's data
        setTotalPages(1);
      } else {
        // Handle other view modes with existing logic
        const attendanceData = response.results || response;
        setAttendance(attendanceData);
        
        // Calculate stats from the actual attendance records
        calculateStats(attendanceData);
        // Calculate total pages (assuming backend returns pagination info)
        if (response.count) {
          setTotalPages(Math.ceil(response.count / 20));
        }
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (attendanceData) => {
    if (!Array.isArray(attendanceData)) {
      setStats({ present: 0, absent: 0, late: 0, total: 0 });
      return;
    }
    
    const present = attendanceData.filter(a => a.status === 'present').length;
    const absent = attendanceData.filter(a => a.status === 'absent').length;
    const late = attendanceData.filter(a => a.status === 'late').length;
    const total = attendanceData.length;
    
    // For monthly view, calculate total days in the month
    let totalDays = total;
    if (viewMode === 'monthly') {
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      totalDays = daysInMonth;
    }
    
    setStats({ present, absent, late, total: totalDays });
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

  const getMonthName = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  };



  const handleViewEmployee = (employee) => {
    onViewEmployee(employee);
  };

  const exportAttendance = () => {
    const csvContent = [
      ['Employee', 'Date', 'Check In', 'Check Out', 'Status', 'Total Hours', 'Notes'],
      ...(Array.isArray(attendance) ? attendance.map(record => [
        `${record.user?.first_name} ${record.user?.last_name}`,
        record.date,
        formatTime(record.check_in_time),
        formatTime(record.check_out_time),
        record.status,
        record.total_hours || 'N/A',
        record.notes || ''
      ]) : [])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
         const fileName = viewMode === 'monthly' 
       ? `attendance_${getMonthName(currentMonth)}_${currentYear}.csv`
       : `attendance_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`;
     a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('today')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'today'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('date')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'date'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              By Date
            </button>
            <button
              onClick={() => setViewMode('employee')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'employee'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              By Employee
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              By Month
            </button>
          </div>

          {/* Real-time Status Indicator */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
            <div className={`flex items-center space-x-2 ${isRealtimeActive ? 'text-green-600' : 'text-red-600'}`}>
              {isRealtimeActive ? (
                <Wifi className="h-4 w-4 animate-pulse" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {isRealtimeActive ? 'Live' : 'Offline'}
              </span>
            </div>
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                Last: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Fingerprint Notifications */}
          {fingerprintNotifications.length > 0 && (
            <div className="relative">
              <Button variant="outline" className="relative">
                <Bell className="h-4 w-4 mr-2" />
                Fingerprints
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {fingerprintNotifications.length}
                </span>
              </Button>
            </div>
          )}
        </div>
        
        <Button onClick={exportAttendance} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        {viewMode === 'date' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        
        {viewMode === 'employee' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Employees</option>
              {Array.isArray(employees) && employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name}
                </option>
              ))}
            </select>
          </div>
                 )}
       </div>

       {/* Month Navigation - Only show for monthly view */}
       {viewMode === 'monthly' && (
         <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
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
       )}

              {/* Statistics */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="p-4">
           <div className="text-center">
             <div className="text-2xl font-bold text-green-600">{stats.present}</div>
             <div className="text-sm text-gray-600">Present</div>
             {viewMode === 'monthly' && (
               <div className="text-xs text-gray-500 mt-1">{getMonthName(currentMonth)} {currentYear}</div>
             )}
           </div>
         </Card>
         <Card className="p-4">
           <div className="text-center">
             <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
             <div className="text-sm text-gray-600">Absent</div>
             {viewMode === 'monthly' && (
               <div className="text-xs text-gray-500 mt-1">{getMonthName(currentMonth)} {currentYear}</div>
             )}
           </div>
         </Card>
         <Card className="p-4">
           <div className="text-center">
             <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
             <div className="text-sm text-gray-600">Late</div>
             {viewMode === 'monthly' && (
               <div className="text-xs text-gray-500 mt-1">{getMonthName(currentMonth)} {currentYear}</div>
             )}
           </div>
         </Card>
         <Card className="p-4">
           <div className="text-center">
             <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
             <div className="text-sm text-gray-600">
               {viewMode === 'monthly' ? 'Total Days' : 'Total Records'}
             </div>
             {viewMode === 'monthly' && (
               <div className="text-xs text-gray-500 mt-1">{getMonthName(currentMonth)} {currentYear}</div>
             )}
           </div>
         </Card>
       </div>

      {/* ZKTeco Device Status */}
      {zktecoDeviceStatus && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">ZKTeco Device Status</h3>
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${zktecoDeviceStatus.online_devices > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {zktecoDeviceStatus.online_devices}/{zktecoDeviceStatus.total_devices} Online
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.isArray(zktecoDeviceStatus.devices) && zktecoDeviceStatus.devices.map((device) => (
              <div key={device.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`h-3 w-3 rounded-full ${device.is_online ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{device.name}</p>
                  <p className="text-xs text-gray-500">{device.ip_address}:{device.port}</p>
                  {device.office && (
                    <p className="text-xs text-gray-400">{device.office}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {device.is_online ? 'Online' : 'Offline'}
                  </p>
                  {device.last_sync && (
                    <p className="text-xs text-gray-400">
                      Last: {new Date(device.last_sync).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

             {/* Attendance Table */}
       <Card className="p-6">
         {viewMode === 'monthly' && (
           <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
             <div className="grid grid-cols-3 gap-4 text-center">
               <div>
                 <div className="text-lg font-semibold text-gray-800">{getMonthName(currentMonth)} {currentYear}</div>
                 <div className="text-sm text-gray-600">Current Month</div>
               </div>
               <div>
                 <div className="text-lg font-semibold text-green-600">{stats.present} days</div>
                 <div className="text-sm text-gray-600">Present</div>
               </div>
               <div>
                 <div className="text-lg font-semibold text-red-600">{stats.absent} days</div>
                 <div className="text-sm text-gray-600">Absent</div>
               </div>
             </div>
           </div>
         )}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (Array.isArray(attendance) && attendance.length > 0) ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(attendance) && attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {record.user?.first_name} {record.user?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.user?.employee_id || 'No ID'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateWithDay(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatTime(record.check_in_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatTime(record.check_out_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.total_hours ? `${record.total_hours}h` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          onClick={() => handleViewEmployee(record.user)}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
                     <div className="text-center py-12">
             <Clock className="mx-auto h-12 w-12 text-gray-400" />
             <h3 className="mt-2 text-sm font-medium text-gray-900">
               {viewMode === 'monthly' 
                 ? `No attendance records found for ${getMonthName(currentMonth)} ${currentYear}`
                 : 'No attendance records found'
               }
             </h3>
             <p className="mt-1 text-sm text-gray-500">
               {viewMode === 'monthly'
                 ? `No attendance data available for ${getMonthName(currentMonth)} ${currentYear}`
                 : 'No attendance data available for the selected criteria'
               }
             </p>
           </div>
        )}
      </Card>
    </div>
  );
};

export default AttendanceOverview;
