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
      const [statsData, leavesData] = await Promise.all([
        api.getManagerDashboardStats(), // Get manager-specific dashboard stats
        api.getManagerLeaves({ status: 'pending', limit: 5 }) // Get manager's office leaves
      ]);

      setStats(statsData);
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
      case 'documents':
        navigate('/documents');
        break;
      case 'settings':
        navigate('/profile');
        break;
      default:
        console.warn('Unknown quick action:', action);
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
    <div className="space-y-3 animate-fade-in">
      {/* Dashboard Header */}
      <DashboardHeader
        user={user}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onViewReports={() => handleQuickAction('reports')}
        onQuickAction={handleQuickAction}
      />

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Quick Actions Section */}
      <QuickActionsSection onQuickAction={handleQuickAction} />

      {/* Office Overview and Pending Leaves Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Office Overview Card */}
        {user?.office && (
          <OfficeOverviewCard office={user.office} stats={stats} />
        )}

        {/* Pending Leave Requests */}
        <RecentActivitySection
          pendingLeaves={pendingLeaves}
          onViewLeaves={(leave) => {
            if (leave) {
              navigate('/leaves', { 
                state: { 
                  selectedLeave: leave
                } 
              });
            } else {
              navigate('/leaves');
            }
          }}
        />
      </div>

      {/* Manager Information */}
      {user?.office && (
        <OfficeInfoCard office={user.office} manager={user} />
      )}
      
    </div>
  );
};

export default Dashboard;
