import React from 'react';
import { Card } from '../../Components';
import { QuickActionCard } from '../../Components';
import { UserPlus, Clock, Calendar, FileText, BarChart3, Settings } from 'lucide-react';

const QuickActionsSection = ({ onQuickAction }) => {
  const quickActions = [
    {
      title: 'Add Employee',
      subtitle: 'Register new employee',
      icon: UserPlus,
      color: 'blue',
      action: 'add-employee'
    },
    {
      title: 'View Attendance',
      subtitle: 'Check office attendance',
      icon: Clock,
      color: 'green',
      action: 'attendance'
    },
    {
      title: 'Review Leaves',
      subtitle: 'Approve/reject requests',
      icon: Calendar,
      color: 'yellow',
      action: 'leaves'
    },
    {
      title: 'Generate Reports',
      subtitle: 'Office performance reports',
      icon: BarChart3,
      color: 'purple',
      action: 'reports'
    },
    {
      title: 'Manage Documents',
      subtitle: 'Office document management',
      icon: FileText,
      color: 'indigo',
      action: 'documents'
    },
    {
      title: 'Office Settings',
      subtitle: 'Configure office settings',
      icon: Settings,
      color: 'gray',
      action: 'settings'
    }
  ];

  return (
    <Card className="shadow-lg border-2 border-gray-100">
      <div className="card-header">
        <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              subtitle={action.subtitle}
              icon={action.icon}
              color={action.color}
              onClick={() => onQuickAction(action.action)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default QuickActionsSection;
