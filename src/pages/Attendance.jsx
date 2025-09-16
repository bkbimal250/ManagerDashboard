import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../Components';
import { 
  Clock, 
  Users,
  Building2,
  RefreshCw,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  Timer,
  CalendarDays
} from 'lucide-react';
import { 
  AttendanceOverview,
  EmployeeAttendanceView
} from '../Components/AttendanceFiles';
import CheckinCheckoutView from '../Components/AttendanceFiles/CheckinCheckoutView';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Attendance = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [viewMode, setViewMode] = useState('overview'); // overview, employee, checkin_checkout
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Data states
  const [attendanceData, setAttendanceData] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states - Enhanced with new fields
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    employee: '',
    status: '',
    day_status: '', // New: complete_day, half_day, absent
    is_late: '', // New: true, false
    office: user?.office?.id || ''
  });
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);

  // Initial data fetch
  useEffect(() => {
    fetchAttendanceData();
  }, [filters]);

  // Handle navigation state from other pages
  useEffect(() => {
    if (location.state) {
      const { selectedEmployee: navEmployee, viewMode: navViewMode } = location.state;
      if (navEmployee) {
        setSelectedEmployee(navEmployee);
        setViewMode(navViewMode || 'employee');
      }
    }
  }, [location.state]);

  // Fetch attendance data
  const fetchAttendanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch today's attendance with statistics
      const todayData = await api.getTodayAttendance({
        office: filters.office,
        employee: filters.employee,
        status: filters.status,
        day_status: filters.day_status,
        is_late: filters.is_late
      });
      setTodayAttendance(todayData.attendance_records || []);
      setAttendanceStats(todayData.statistics || {});

      // Fetch general attendance data
      const generalData = await api.getAttendance({
        date: filters.date,
        office: filters.office,
        employee: filters.employee,
        status: filters.status,
        day_status: filters.day_status,
        is_late: filters.is_late,
        limit: 100
      });
      setAttendanceData(generalData || []);

    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError(err.response?.data?.detail || 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAttendanceData();
    setRefreshing(false);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      date: new Date().toISOString().split('T')[0],
      employee: '',
      status: '',
      day_status: '',
      is_late: '',
      office: user?.office?.id || ''
    });
  };

  // Export attendance data
  const handleExport = async () => {
    try {
      const response = await api.getAttendance({
        ...filters,
        format: 'csv'
      });
      
      // Create and download CSV file
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${filters.date}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export attendance data');
    }
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setViewMode('employee');
  };

  const handleBackToOverview = () => {
    setSelectedEmployee(null);
    setViewMode('overview');
  };

  return (
    <div className="space-y-6">


      {/* Controls Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left side - Refresh */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>

          {/* Right side - Filters, Export, and View Toggle */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            
            <Button
              onClick={() => setViewMode(viewMode === 'overview' ? 'checkin_checkout' : 'overview')}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Clock className="h-4 w-4" />
              <span>{viewMode === 'overview' ? 'Check-in/Check-out' : 'Overview'}</span>
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

        {/* Enhanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={filters.employee}
                  onChange={(e) => handleFilterChange('employee', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
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

              {/* New Day Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day Status
                </label>
                <select
                  value={filters.day_status}
                  onChange={(e) => handleFilterChange('day_status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Day Status</option>
                  <option value="complete_day">Complete Day</option>
                  <option value="half_day">Half Day</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              {/* New Late Coming Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Late Coming
                </label>
                <select
                  value={filters.is_late}
                  onChange={(e) => handleFilterChange('is_late', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">Late</option>
                  <option value="false">On Time</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office
                </label>
                <select
                  value={filters.office}
                  onChange={(e) => handleFilterChange('office', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Offices</option>
                  <option value={user?.office?.id}>{user?.office?.name}</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="mr-2"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !refreshing && (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600">Loading attendance data...</span>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {viewMode === 'overview' ? (
            <AttendanceOverview 
              onViewEmployee={handleViewEmployee}
              attendanceData={attendanceData}
              todayAttendance={todayAttendance}
              attendanceStats={attendanceStats}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          ) : viewMode === 'checkin_checkout' ? (
            <CheckinCheckoutView 
              officeId={user?.office?.id}
            />
          ) : (
            <EmployeeAttendanceView 
              selectedEmployee={selectedEmployee} 
              onBack={handleBackToOverview}
              officeId={user?.office?.id}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Attendance;
