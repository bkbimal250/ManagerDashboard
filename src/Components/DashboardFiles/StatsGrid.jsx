import React from 'react';
import { StatsCard } from '../../Components';
import { Users, Clock, Calendar, Building2 } from 'lucide-react';

const StatsGrid = ({ stats }) => {
  const statsData = [
    {
      title: 'Total Employees',
      value: stats?.total_employees || 0,
      subtitle: 'In your office',
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
      title: 'Active Users',
      value: stats?.active_users || 0,
      subtitle: 'Currently active',
      icon: Building2,
      color: 'purple'
    }
  ];

  return (
    <div className="stats-grid">
      {statsData.map((stat, index) => (
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
