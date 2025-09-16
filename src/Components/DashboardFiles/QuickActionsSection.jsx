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
    <Card className="shadow-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
