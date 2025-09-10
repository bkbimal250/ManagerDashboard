import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Select } from '../index';
import { 
  Calendar, 
  Download, 
  Users, 
  Building2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';

const MonthlyReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [employees, setEmployees] = useState([]);
  const [officeInfo, setOfficeInfo] = useState({ name: '', id: '' });

  // Fetch employees for the manager's office
  const fetchEmployees = useCallback(async () => {
    try {
      // Request only active employees from the backend
      const response = await api.getManagerEmployees({ 
        page_size: 100,
        status: 'active'  // Only get active employees
      });
      setEmployees(response.results || []);
      setOfficeInfo({
        name: response.office_name || '',
        id: response.office_id || ''
      });
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setError('Failed to fetch employees');
    }
  }, []);

  // Generate monthly report for all employees
  const generateMonthlyReport = useCallback(async () => {
    if (employees.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const reportPromises = employees.map(async (employee) => {
        try {
          const response = await api.getEmployeeAttendance(
            employee.id,
            `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`,
            `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${new Date(selectedYear, selectedMonth, 0).getDate()}`
          );
          
          return {
            id: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
            employee_id: employee.employee_id || 'N/A',
            office: officeInfo.name,
            department: employee.department || 'N/A',
            ...response.statistics
          };
        } catch (error) {
          console.error(`Failed to fetch data for ${employee.first_name}:`, error);
          return {
            id: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
            employee_id: employee.employee_id || 'N/A',
            office: officeInfo.name,
            department: employee.department || 'N/A',
            total_days_in_month: 0,
            present_days: 0,
            absent_days: 0,
            complete_days: 0,
            half_days: 0,
            late_coming_days: 0,
            attendance_rate: 0
          };
        }
      });

      const results = await Promise.all(reportPromises);
      setReportData(results);
    } catch (error) {
      console.error('Failed to generate monthly report:', error);
      setError('Failed to generate monthly report');
    } finally {
      setLoading(false);
    }
  }, [employees, selectedMonth, selectedYear, officeInfo.name]);

  // Handle month navigation
  const handleMonthChange = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (reportData.length === 0) return;

    const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('default', { month: 'long' });
    const filename = `monthly_report_${monthName}_${selectedYear}.csv`;

    const csvContent = [
      ['Name', 'Employee ID', 'Office', 'Department', 'Total Days', 'Present Days', 'Absent Days', 'Complete Days', 'Half Days', 'Late Days', 'Attendance Rate (%)'],
      ...reportData.map(emp => [
        emp.name,
        emp.employee_id,
        emp.office,
        emp.department,
        emp.total_days_in_month || 0,
        emp.present_days || 0,
        emp.absent_days || 0,
        emp.complete_days || 0,
        emp.half_days || 0,
        emp.late_coming_days || 0,
        emp.attendance_rate || 0
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export to PDF
  const exportToPDF = () => {
    if (reportData.length === 0) return;

    const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('default', { month: 'long' });
    const filename = `monthly_report_${monthName}_${selectedYear}.pdf`;

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Monthly Attendance Report - ${monthName} ${selectedYear}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #1f2937;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            color: #6b7280;
            margin: 5px 0 0 0;
            font-size: 14px;
          }
          .summary {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-item h4 {
            margin: 0 0 5px 0;
            color: #6b7280;
            font-size: 12px;
            font-weight: normal;
          }
          .summary-item p {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
          }
          .summary-item .green { color: #059669; }
          .summary-item .red { color: #dc2626; }
          .summary-item .blue { color: #2563eb; }
          .summary-item .yellow { color: #d97706; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: left;
            font-size: 12px;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Monthly Attendance Report</h1>
          <p>${officeInfo.name} • ${monthName} ${selectedYear}</p>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <h4>Active Employees</h4>
            <p>${summaryStats?.totalEmployees || 0}</p>
          </div>
          <div class="summary-item">
            <h4>Total Present Days</h4>
            <p class="green">${summaryStats?.totalPresentDays || 0}</p>
          </div>
          <div class="summary-item">
            <h4>Total Absent Days</h4>
            <p class="red">${summaryStats?.totalAbsentDays || 0}</p>
          </div>
          <div class="summary-item">
            <h4>Complete Days</h4>
            <p class="blue">${summaryStats?.totalCompleteDays || 0}</p>
          </div>
          <div class="summary-item">
            <h4>Half Days</h4>
            <p class="yellow">${summaryStats?.totalHalfDays || 0}</p>
          </div>
          <div class="summary-item">
            <h4>Avg. Attendance Rate</h4>
            <p>${summaryStats?.avgAttendanceRate || 0}%</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Office</th>
              <th>Department</th>
              <th>Total Days</th>
              <th>Present Days</th>
              <th>Absent Days</th>
              <th>Complete Days</th>
              <th>Half Days</th>
              <th>Attendance Rate</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.map(emp => `
              <tr>
                <td>${emp.name}</td>
                <td>${emp.employee_id}</td>
                <td>${emp.office}</td>
                <td>${emp.department}</td>
                <td>${emp.total_days_in_month || 0}</td>
                <td>${emp.present_days || 0}</td>
                <td>${emp.absent_days || 0}</td>
                <td>${emp.complete_days || 0}</td>
                <td>${emp.half_days || 0}</td>
                <td>${emp.attendance_rate || 0}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  // Get month name
  const getMonthName = (month) => {
    return new Date(selectedYear, month - 1, 1).toLocaleString('default', { month: 'long' });
  };

  // Get attendance rate color
  const getAttendanceRateColor = (rate) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (reportData.length === 0) return null;

    const totalEmployees = reportData.length;
    const totalPresentDays = reportData.reduce((sum, emp) => sum + (emp.present_days || 0), 0);
    const totalAbsentDays = reportData.reduce((sum, emp) => sum + (emp.absent_days || 0), 0);
    const totalCompleteDays = reportData.reduce((sum, emp) => sum + (emp.complete_days || 0), 0);
    const totalHalfDays = reportData.reduce((sum, emp) => sum + (emp.half_days || 0), 0);
    const avgAttendanceRate = reportData.reduce((sum, emp) => sum + (emp.attendance_rate || 0), 0) / totalEmployees;

    return {
      totalEmployees,
      totalPresentDays,
      totalAbsentDays,
      totalCompleteDays,
      totalHalfDays,
      avgAttendanceRate: Math.round(avgAttendanceRate * 10) / 10
    };
  };

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Generate report when employees or month/year changes
  useEffect(() => {
    if (employees.length > 0) {
      generateMonthlyReport();
    }
  }, [generateMonthlyReport]);

  const summaryStats = getSummaryStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Attendance Report</h1>
          <p className="text-gray-600">
            {officeInfo.name && `Office: ${officeInfo.name}`}
            {summaryStats && ` • ${summaryStats.totalEmployees} active employees`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={exportToCSV} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={exportToPDF} className="bg-red-600 hover:bg-red-700">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Month Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Select Month:</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => handleMonthChange('prev')}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {getMonthName(selectedMonth)} {selectedYear}
              </h3>
            </div>
            
            <Button
              onClick={() => handleMonthChange('next')}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="text-center">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-500">Active Employees</h4>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalEmployees}</p>
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-500">Total Present Days</h4>
              <p className="text-2xl font-bold text-green-600">{summaryStats.totalPresentDays}</p>
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-500">Total Absent Days</h4>
              <p className="text-2xl font-bold text-red-600">{summaryStats.totalAbsentDays}</p>
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-500">Complete Days</h4>
              <p className="text-2xl font-bold text-blue-600">{summaryStats.totalCompleteDays}</p>
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-500">Half Days</h4>
              <p className="text-2xl font-bold text-yellow-600">{summaryStats.totalHalfDays}</p>
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-500">Avg. Attendance Rate</h4>
              <p className={`text-2xl font-bold ${getAttendanceRateColor(summaryStats.avgAttendanceRate)}`}>
                {summaryStats.avgAttendanceRate}%
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Report Table */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Generating monthly report...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <Button onClick={generateMonthlyReport} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        ) : reportData.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active employees found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Office
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Complete Days
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
                {reportData.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.employee_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.office}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.total_days_in_month || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {employee.present_days || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {employee.absent_days || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                      {employee.complete_days || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                      {employee.half_days || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getAttendanceRateColor(employee.attendance_rate || 0)}`}>
                        {employee.attendance_rate || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MonthlyReport;
