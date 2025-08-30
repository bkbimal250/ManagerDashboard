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
  Activity,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    generateReport();
  }, [reportType, dateRange]);

  const generateReport = async () => {
    try {
      setLoading(true);
      let data = null;

      switch (reportType) {
        case 'attendance':
          data = await generateAttendanceReport();
          break;
        case 'leave':
          data = await generateLeaveReport();
          break;
        case 'employee':
          data = await generateEmployeeReport();
          break;
        default:
          data = await generateAttendanceReport();
      }

      setReportData(data);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAttendanceReport = async () => {
    const params = {
      start_date: dateRange.startDate,
      end_date: dateRange.endDate
    };

    const response = await api.getAttendance(params);
    const attendanceData = (response.results || response).filter(
      record => record.user?.office?.id === user?.office?.id
    );

    const totalRecords = attendanceData.length;
    const presentCount = attendanceData.filter(a => a.status === 'present').length;
    const absentCount = attendanceData.filter(a => a.status === 'absent').length;
    const lateCount = attendanceData.filter(a => a.status === 'late').length;
    const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords * 100).toFixed(2) : 0;

    return {
      type: 'attendance',
      summary: {
        totalRecords,
        presentCount,
        absentCount,
        lateCount,
        attendanceRate: parseFloat(attendanceRate)
      },
      rawData: attendanceData
    };
  };

  const generateLeaveReport = async () => {
    const params = {
      start_date: dateRange.startDate,
      end_date: dateRange.endDate
    };

    const response = await api.getLeaves(params);
    const leaveData = (response.results || response).filter(
      leave => leave.user?.office?.id === user?.office?.id
    );

    const totalLeaves = leaveData.length;
    const approvedLeaves = leaveData.filter(l => l.status === 'approved').length;
    const pendingLeaves = leaveData.filter(l => l.status === 'pending').length;
    const rejectedLeaves = leaveData.filter(l => l.status === 'rejected').length;
    const approvalRate = totalLeaves > 0 ? (approvedLeaves / totalLeaves * 100).toFixed(2) : 0;

    return {
      type: 'leave',
      summary: {
        totalLeaves,
        approvedLeaves,
        pendingLeaves,
        rejectedLeaves,
        approvalRate: parseFloat(approvalRate)
      },
      rawData: leaveData
    };
  };

  const generateEmployeeReport = async () => {
    const response = await api.getEmployees();
    const employees = (response.results || response).filter(
      emp => emp.role === 'employee' && emp.office?.id === user?.office?.id
    );

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.is_active).length;
    const inactiveEmployees = employees.filter(emp => !emp.is_active).length;
    const activationRate = totalEmployees > 0 ? (activeEmployees / totalEmployees * 100).toFixed(2) : 0;

    return {
      type: 'employee',
      summary: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        activationRate: parseFloat(activationRate)
      },
      rawData: employees
    };
  };

  const exportReport = () => {
    if (!reportData) return;

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}_report_${dateRange.startDate}_to_${dateRange.endDate}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderSummaryCards = () => {
    if (!reportData?.summary) return null;

    const { summary } = reportData;
    const cards = [];

    switch (reportData.type) {
      case 'attendance':
        cards.push(
          { title: 'Total Records', value: summary.totalRecords, icon: <FileText className="h-4 w-4" />, color: 'bg-blue-500' },
          { title: 'Present', value: summary.presentCount, icon: <TrendingUp className="h-4 w-4" />, color: 'bg-green-500' },
          { title: 'Absent', value: summary.absentCount, icon: <TrendingDown className="h-4 w-4" />, color: 'bg-red-500' },
          { title: 'Attendance Rate', value: `${summary.attendanceRate}%`, icon: <Target className="h-4 w-4" />, color: 'bg-purple-500' }
        );
        break;
      case 'leave':
        cards.push(
          { title: 'Total Leaves', value: summary.totalLeaves, icon: <FileText className="h-4 w-4" />, color: 'bg-blue-500' },
          { title: 'Approved', value: summary.approvedLeaves, icon: <Award className="h-4 w-4" />, color: 'bg-green-500' },
          { title: 'Pending', value: summary.pendingLeaves, icon: <AlertCircle className="h-4 w-4" />, color: 'bg-yellow-500' },
          { title: 'Approval Rate', value: `${summary.approvalRate}%`, icon: <Target className="h-4 w-4" />, color: 'bg-purple-500' }
        );
        break;
      case 'employee':
        cards.push(
          { title: 'Total Employees', value: summary.totalEmployees, icon: <Users className="h-4 w-4" />, color: 'bg-blue-500' },
          { title: 'Active', value: summary.activeEmployees, icon: <TrendingUp className="h-4 w-4" />, color: 'bg-green-500' },
          { title: 'Inactive', value: summary.inactiveEmployees, icon: <TrendingDown className="h-4 w-4" />, color: 'bg-red-500' },
          { title: 'Activation Rate', value: `${summary.activationRate}%`, icon: <Target className="h-4 w-4" />, color: 'bg-purple-500' }
        );
        break;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {cards.map((card, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${card.color} text-white`}>
                {card.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Office Reports</h1>
          <p className="text-gray-600">Generate reports for your office</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={exportReport} 
            disabled={!reportData}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Report Type Selection */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { type: 'attendance', label: 'Attendance Report', icon: <Clock className="h-5 w-5" /> },
            { type: 'leave', label: 'Leave Report', icon: <Calendar className="h-5 w-5" /> },
            { type: 'employee', label: 'Employee Report', icon: <Users className="h-5 w-5" /> }
          ].map((option) => (
            <button
              key={option.type}
              onClick={() => setReportType(option.type)}
              className={`p-4 rounded-lg border-2 transition-all ${
                reportType === option.type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                {option.icon}
                <span className="font-medium">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Date Range */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Report Content */}
      {reportData && (
        <div className="space-y-6">
          {renderSummaryCards()}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {reportType === 'attendance' && 'Attendance Overview'}
              {reportType === 'leave' && 'Leave Overview'}
              {reportType === 'employee' && 'Employee Overview'}
            </h3>
            <p className="text-gray-600">
              Report generated for {user?.office?.name} from {dateRange.startDate} to {dateRange.endDate}
            </p>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!reportData && !loading && (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No report generated</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select a report type to view analytics.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
