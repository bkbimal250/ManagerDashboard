import React, { useState, useEffect, useCallback } from 'react';
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
  EyeOff
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
  const [viewMode, setViewMode] = useState('overview'); // overview, employee, checkin_checkout
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Data states
  const [attendanceData, setAttendanceData] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    employee: '',
    status: '',
    office: user?.office?.id || ''
  });
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Auto-refresh effect
  useEffect(() => {
    let interval;
    if (autoRefresh && refreshInterval > 0) {
      interval = setInterval(() => {
        fetchAttendanceData();
      }, refreshInterval * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, filters]);

  // Initial data fetch
  useEffect(() => {
    fetchAttendanceData();
  }, [filters]);

  // Fetch attendance data
  const fetchAttendanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch today's attendance with statistics
      const todayData = await api.getTodayAttendance({
        office: filters.office,
        employee: filters.employee,
        status: filters.status
      });
      setTodayAttendance(todayData.attendance_records || []);
      setAttendanceStats(todayData.statistics || {});

      // Fetch general attendance data
      const generalData = await api.getAttendance({
        date: filters.date,
        office: filters.office,
        employee: filters.employee,
        status: filters.status,
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
      {/* Header */}
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Attendance Management</h1>
            <p className="page-subtitle">
              Monitor and manage attendance for your office: {user?.office?.name}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-sm text-gray-600">
              <Building2 className="h-4 w-4 mr-1" />
              {user?.office?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left side - Refresh and Auto-refresh */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-600">
                Auto-refresh
              </label>
            </div>
            
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="text-sm border rounded px-2 py-1"
              >
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            )}
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

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              employee={selectedEmployee} 
              onBack={handleBackToOverview}
              attendanceData={attendanceData.filter(att => att.user?.id === selectedEmployee?.id)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Attendance;
