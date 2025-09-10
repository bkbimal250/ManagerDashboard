import React from 'react';
import { Card } from '../../Components';

const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500',
      indigo: 'bg-indigo-500'
    };
    return colors[color] || colors.blue;
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <div className="card-body">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${getColorClasses(color)} text-white`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-600">{title}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
