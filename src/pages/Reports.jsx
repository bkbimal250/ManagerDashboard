import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../Components';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Users, 
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  Target,
  Search,
  FileSpreadsheet,
  FileText as FileTextIcon,
  Filter,
  User,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Get month names
  const getMonthName = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      generateReport();
    }
  }, [selectedMonth, selectedYear, selectedEmployee, employees, searchTerm]);

  useEffect(() => {
    // Filter employees based on search term
    const filtered = employees.filter(emp => 
      emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
    
    // Reset selected employee if search term changes and selected employee is not in filtered results
    if (searchTerm && selectedEmployee) {
      const selectedEmp = employees.find(emp => emp.id === selectedEmployee);
      const isInFiltered = filtered.some(emp => emp.id === selectedEmployee);
      if (!isInFiltered) {
        setSelectedEmployee('');
      }
    }
  }, [searchTerm, employees, selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const response = await api.getManagerEmployees();
      const employeeList = response.results || response;
      setEmployees(employeeList);
      setFilteredEmployees(employeeList);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployee(employeeId);
    // Clear search term when an employee is selected
    if (employeeId) {
      setSearchTerm('');
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedEmployee('');
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      
      const params = {
        month: selectedMonth + 1, // API expects 1-12
        year: selectedYear
      };

      // Get the employees to process based on current filters
      const employeesToProcess = searchTerm 
        ? filteredEmployees 
        : (selectedEmployee ? employees.filter(emp => emp.id === selectedEmployee) : employees);

      if (selectedEmployee) {
        params.user_id = selectedEmployee;
      }

      let response;
      try {
        // Try the monthly attendance endpoint first
        response = await api.getMonthlyAttendance(selectedMonth + 1, selectedYear, params);
      } catch (monthlyError) {
        console.warn('Monthly attendance endpoint failed, falling back to regular attendance:', monthlyError);
        
        // Fallback to regular attendance endpoint with date range
        const startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
        const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];
        
        response = await api.getAttendance({
          start_date: startDate,
          end_date: endDate,
          ...params
        });
      }
      
      // Debug: Log the response structure
      console.log('API Response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Handle the correct response structure from backend
      let attendanceData;
      let responseStats = {};
      
      if (response.attendance_records) {
        // Monthly endpoint response structure
        attendanceData = response.attendance_records;
        responseStats = response.statistics || {};
      } else if (response.results) {
        // Regular attendance endpoint response structure
        attendanceData = response.results;
      } else if (Array.isArray(response)) {
        // Direct array response
        attendanceData = response;
      } else {
        // Fallback: treat response as attendance data
        attendanceData = response;
      }
      
      console.log('Attendance data:', attendanceData);
      console.log('Attendance data type:', typeof attendanceData);
      console.log('Is array:', Array.isArray(attendanceData));

      // Calculate statistics
      const totalDays = response.total_days_in_month || new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const totalEmployees = employeesToProcess.length;
      
      let totalPresentDays = 0;
      let totalAbsentDays = 0;
      let totalLateDays = 0;
      let totalHalfDays = 0;

      // Process attendance data
      const processedData = employeesToProcess.map(employee => {
        const employeeAttendance = Array.isArray(attendanceData) ? attendanceData.filter(att => att.user?.id === employee.id) : [];
        const presentDays = employeeAttendance.filter(att => att.status === 'present').length;
        const lateDays = employeeAttendance.filter(att => att.status === 'late').length;
        const halfDays = employeeAttendance.filter(att => att.status === 'partial').length;
        const absentDays = totalDays - presentDays;
        const attendanceRate = totalDays > 0 ? (presentDays / totalDays * 100).toFixed(2) : 0;

        // Update totals
        totalPresentDays += presentDays;
        totalAbsentDays += absentDays;
        totalLateDays += lateDays;
        totalHalfDays += halfDays;

        return {
          ...employee,
          attendance: employeeAttendance,
          presentDays,
          absentDays,
          lateDays,
          halfDays,
          attendanceRate: parseFloat(attendanceRate),
          totalDays
        };
      });

      setReportData({
        month: selectedMonth,
        year: selectedYear,
        totalDays,
        totalEmployees,
        summary: {
          totalPresentDays,
          totalAbsentDays,
          totalLateDays,
          totalHalfDays,
          averageAttendanceRate: totalEmployees > 0 ? (totalPresentDays / (totalDays * totalEmployees) * 100).toFixed(2) : 0
        },
        employees: processedData
      });

    } catch (error) {
      console.error('Failed to generate report:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      
      // Get the employees to process based on current filters for error handling
      const employeesToProcess = searchTerm 
        ? filteredEmployees 
        : (selectedEmployee ? employees.filter(emp => emp.id === selectedEmployee) : employees);

      // Set empty report data to prevent further errors
      setReportData({
        month: selectedMonth,
        year: selectedYear,
        totalDays: new Date(selectedYear, selectedMonth + 1, 0).getDate(),
        totalEmployees: employeesToProcess.length,
        summary: {
          totalPresentDays: 0,
          totalAbsentDays: 0,
          totalLateDays: 0,
          totalHalfDays: 0,
          averageAttendanceRate: 0
        },
        employees: employeesToProcess.map(emp => ({
          ...emp,
          attendance: [],
          presentDays: 0,
          absentDays: new Date(selectedYear, selectedMonth + 1, 0).getDate(),
          lateDays: 0,
          halfDays: 0,
          attendanceRate: 0,
          totalDays: new Date(selectedYear, selectedMonth + 1, 0).getDate()
        }))
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData) return;

    // Create CSV content
    const headers = [
      'Employee ID',
      'Name',
      'Email',
      'Total Days',
      'Present Days',
      'Absent Days',
      'Late Days',
      'Half Days',
      'Attendance Rate (%)'
    ];

    const csvContent = [
      headers.join(','),
      ...reportData.employees.map(emp => [
        emp.employee_id || 'N/A',
        `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
        emp.email || 'N/A',
        emp.totalDays,
        emp.presentDays,
        emp.absentDays,
        emp.lateDays,
        emp.halfDays,
        emp.attendanceRate
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${getMonthName(selectedMonth)}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!reportData) return;

    // Create a simple HTML table for PDF
    const tableContent = `
      <html>
        <head>
          <title>Attendance Report - ${getMonthName(selectedMonth)} ${selectedYear}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
            .summary { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Attendance Report</h1>
            <h2>${getMonthName(selectedMonth)} ${selectedYear}</h2>
            <p>Office: ${user?.office?.name || 'N/A'}</p>
          </div>
          
          <div class="summary">
            <h3>Summary</h3>
            <p>Total Employees: ${reportData.totalEmployees}</p>
            <p>Total Days: ${reportData.totalDays}</p>
            <p>Average Attendance Rate: ${reportData.summary.averageAttendanceRate}%</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Present Days</th>
                <th>Absent Days</th>
                <th>Late Days</th>
                <th>Half Days</th>
                <th>Attendance Rate (%)</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.employees.map(emp => `
                <tr>
                  <td>${emp.employee_id || 'N/A'}</td>
                  <td>${emp.first_name || ''} ${emp.last_name || ''}</td>
                  <td>${emp.presentDays}</td>
                  <td>${emp.absentDays}</td>
                  <td>${emp.lateDays}</td>
                  <td>${emp.halfDays}</td>
                  <td>${emp.attendanceRate}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Create and download PDF (using browser's print functionality)
    const printWindow = window.open('', '_blank');
    printWindow.document.write(tableContent);
    printWindow.document.close();
    printWindow.print();
  };

  const renderSummaryCards = () => {
    if (!reportData?.summary) return null;

    const { summary } = reportData;
    const cards = [
      { 
        title: 'Total Employees', 
        value: reportData.totalEmployees, 
        icon: <Users className="h-4 w-4" />, 
        color: 'bg-blue-500' 
      },
      { 
        title: 'Total Days', 
        value: reportData.totalDays, 
        icon: <CalendarDays className="h-4 w-4" />, 
        color: 'bg-indigo-500' 
      },
      { 
        title: 'Present Days', 
        value: summary.totalPresentDays, 
        icon: <CheckCircle className="h-4 w-4" />, 
        color: 'bg-green-500' 
      },
      { 
        title: 'Absent Days', 
        value: summary.totalAbsentDays, 
        icon: <XCircle className="h-4 w-4" />, 
        color: 'bg-red-500' 
      },
      { 
        title: 'Late Days', 
        value: summary.totalLateDays, 
        icon: <AlertCircle className="h-4 w-4" />, 
        color: 'bg-yellow-500' 
      },
      { 
        title: 'Attendance Rate', 
        value: `${summary.averageAttendanceRate}%`, 
        icon: <Target className="h-4 w-4" />, 
        color: 'bg-purple-500' 
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {cards.map((card, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${card.color} text-white`}>
                {card.icon}
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">{card.title}</p>
                <p className="text-lg font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderEmployeeTable = () => {
    if (!reportData?.employees) return null;

    return (
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Present Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Absent Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Late Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Half Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.first_name} {employee.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.employee_id || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-green-600 font-medium">
                      {employee.presentDays}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-red-600 font-medium">
                      {employee.absentDays}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-yellow-600 font-medium">
                      {employee.lateDays}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-orange-600 font-medium">
                      {employee.halfDays}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        employee.attendanceRate >= 90 ? 'text-green-600' :
                        employee.attendanceRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {employee.attendanceRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-600">Monthly attendance reports for your office</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={exportToExcel} 
            disabled={!reportData}
            className="flex items-center bg-green-600 hover:bg-green-700"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button 
            onClick={exportToPDF} 
            disabled={!reportData}
            className="flex items-center bg-red-600 hover:bg-red-700"
          >
            <FileTextIcon className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Month/Year Selection */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{getMonthName(i)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>{year}</option>
                );
              })}
            </select>
          </div>
        </div>
      </Card>

      {/* Employee Search and Filter */}
      <Card className="p-6">
                  <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Employee</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => handleEmployeeSelect(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Employees</option>
                {filteredEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_id || 'N/A'})
                  </option>
                ))}
              </select>
            </div>
            {(searchTerm || selectedEmployee) && (
              <div className="flex items-end">
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
      </Card>

      {/* Report Content */}
      {reportData && (
        <div className="space-y-6">
          {renderSummaryCards()}
          {renderEmployeeTable()}
        </div>
      )}

      {/* Empty State */}
      {!reportData && !loading && (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No report generated</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select a month and year to view attendance analytics.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
