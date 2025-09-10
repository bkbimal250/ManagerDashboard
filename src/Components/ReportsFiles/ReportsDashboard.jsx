import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../Components';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Clock, 
  Download,
  Filter,
  TrendingUp,
  Building2
} from 'lucide-react';
import api from '../../services/api';
import ReportFilters from './ReportFilters';
import ReportTable from './ReportTable';
import ReportChart from './ReportChart';
import ReportExport from './ReportExport';

const ReportsDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('attendance');
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    office: '', // Will be set automatically for managers
    user: '',
    status: ''
  });
  const [offices, setOffices] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchOffices();
    fetchEmployees();
    
    // Auto-set office filter for managers
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'manager' && user.office?.id) {
      setFilters(prev => ({ ...prev, office: user.office.id }));
    }
  }, []);

  useEffect(() => {
    if (filters.start_date && filters.end_date) {
      generateReport();
    }
  }, [reportType, filters]);

  const fetchOffices = async () => {
    try {
      const response = await api.getOffices();
      setOffices(response.results || response);
    } catch (error) {
      console.error('Failed to fetch offices:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.getManagerEmployees();
      setEmployees(response.results || response);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Only generate attendance report
      const response = await api.generateAttendanceReport(filters);
      setReportData(response);
    } catch (error) {
      console.error('Failed to generate report:', error);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const exportReport = async (format = 'csv') => {
    try {
      const response = await api.exportReport('attendance', {
        ...filters,
        format
      });
      
      // Create download link
      const blob = new Blob([response], { 
        type: format === 'csv' ? 'text/csv' : 'application/pdf' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_report_${filters.start_date}_to_${filters.end_date}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
      setError('Failed to export report. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Attendance Reports</h1>
          <p className="text-gray-600">Generate and analyze monthly attendance reports for your office</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => exportReport('csv')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => exportReport('pdf')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Month Selection */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Select Month:</span>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                setFilters(prev => ({
                  ...prev,
                  start_date: firstDay.toISOString().split('T')[0],
                  end_date: lastDay.toISOString().split('T')[0]
                }));
              }}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-white text-gray-900 shadow-sm"
            >
              Current Month
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
                setFilters(prev => ({
                  ...prev,
                  start_date: firstDay.toISOString().split('T')[0],
                  end_date: lastDay.toISOString().split('T')[0]
                }));
              }}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-gray-600 hover:text-gray-900"
            >
              Previous Month
            </button>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        offices={offices}
        employees={employees}
        reportType="attendance"
      />

      {/* Report Content */}
      {loading ? (
        <Card className="p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Generating attendance report...</span>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <Button onClick={generateReport} className="mt-2">
              Try Again
            </Button>
          </div>
        </Card>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          {reportData.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Records</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.summary.totalRecords || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Present</p>
                    <p className="text-2xl font-bold text-green-600">
                      {reportData.summary.presentCount || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Absent</p>
                    <p className="text-2xl font-bold text-red-600">
                      {reportData.summary.absentCount || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {reportData.summary.attendanceRate || 0}%
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Charts */}
          {reportData.dailyStats && (
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Attendance Trends</h3>
              <ReportChart data={reportData.dailyStats} type="attendance" />
            </Card>
          )}

          {/* Data Table */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Attendance Details</h3>
            <ReportTable 
              data={reportData.rawData || reportData.results || []} 
              type="attendance"
              summary={reportData.summary}
            />
          </Card>
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Attendance Data</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select a month and generate a report to see attendance data
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReportsDashboard;
