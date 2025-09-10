import React, { useState, useEffect } from 'react';
import { 
  DashboardHeader,
  StatsGrid,
  QuickActionsSection,
  RecentActivitySection,
  OfficeInfoCard,
  OfficeOverviewCard
} from '../Components/DashboardFiles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use manager-specific API calls to get office-specific data
      const [statsData, attendanceData, leavesData] = await Promise.all([
        api.getManagerDashboardStats(), // Get manager-specific dashboard stats
        api.getManagerAttendance({ limit: 5 }), // Get manager's office attendance
        api.getManagerLeaves({ status: 'pending', limit: 5 }) // Get manager's office leaves
      ]);

      setStats(statsData);
      setRecentAttendance(attendanceData.results || attendanceData);
      setPendingLeaves(leavesData.results || leavesData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set default values if API fails
      setStats({
        total_employees: 0,
        today_attendance: 0,
        pending_leaves: 0,
        active_employees: 0,
        office_name: 'Unknown Office'
      });
      setRecentAttendance([]);
      setPendingLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'add-employee':
        navigate('/employees', { state: { openAddModal: true } });
        break;
      case 'attendance':
        navigate('/attendance');
        break;
      case 'leaves':
        navigate('/leaves');
        break;
      case 'reports':
        navigate('/reports');
        break;
      default:
        break;
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Dashboard Header */}
      <DashboardHeader
        user={user}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onViewReports={() => handleQuickAction('reports')}
      />

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Quick Actions Section */}
      <QuickActionsSection onQuickAction={handleQuickAction} />

      {/* Recent Activity Section */}
      <RecentActivitySection
        recentAttendance={recentAttendance}
        pendingLeaves={pendingLeaves}
      />

      {/* Office Overview Card */}
      {user?.office && (
        <OfficeOverviewCard office={user.office} stats={stats} />
      )}

      {/* Office Information */}
      {user?.office && (
        <OfficeInfoCard office={user.office} manager={user} />
      )}
      
    </div>
  );
};

export default Dashboard;
