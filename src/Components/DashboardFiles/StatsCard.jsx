import React from 'react';
import { Card } from '../../Components';

const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      green: 'bg-gradient-to-r from-green-500 to-emerald-500',
      yellow: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
      red: 'bg-gradient-to-r from-red-500 to-pink-500'
    };
    return colors[color] || colors.blue;
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 group">
      <div className="card-body">
        <div className="flex items-center">
          <div className={`p-4 rounded-2xl ${getColorClasses(color)} text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}>
            <Icon className="h-8 w-8" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
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
