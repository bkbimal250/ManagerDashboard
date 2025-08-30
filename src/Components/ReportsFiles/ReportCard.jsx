import React from 'react';
import { Card } from '../../Components';

const ReportCard = ({ title, value, change, changeType, icon: Icon, color = 'blue' }) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500'
    };
    return colors[color] || colors.blue;
  };

  const getChangeColor = (changeType) => {
    return changeType === 'positive' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${getColorClasses(color)}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${getChangeColor(changeType)}`}>
              {changeType === 'positive' ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ReportCard;
