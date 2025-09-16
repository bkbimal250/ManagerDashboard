import React from 'react';
import { StatsCard } from '../../Components';
import { Users, Clock, Calendar, Building2, Smartphone, TrendingUp } from 'lucide-react';

const StatsGrid = ({ stats }) => {
  const statsData = [
    {
      title: 'Total Employees',
      value: stats?.total_employees || 0,
      subtitle: `In ${stats?.office_name || 'your office'}`,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Present Today',
      value: stats?.today_attendance || 0,
      subtitle: 'Checked in today',
      icon: Clock,
      color: 'green'
    },
    {
      title: 'Pending Leaves',
      value: stats?.pending_leaves || 0,
      subtitle: 'Awaiting approval',
      icon: Calendar,
      color: 'yellow'
    },
    {
      title: 'Active Employees',
      value: stats?.active_employees || 0,
      subtitle: 'Currently active',
      icon: Building2,
      color: 'purple'
    }
  ];

  // Additional manager-specific stats
  const additionalStats = [
    {
      title: 'Office Devices',
      value: stats?.total_devices || 0,
      subtitle: `${stats?.active_devices || 0} active`,
      icon: Smartphone,
      color: 'indigo'
    },
    {
      title: 'Attendance Rate',
      value: `${stats?.attendance_rate || 0}%`,
      subtitle: 'Today\'s rate',
      icon: TrendingUp,
      color: 'emerald'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {/* All Stats in One Grid */}
      {[...statsData, ...additionalStats].map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
};

export default StatsGrid;
