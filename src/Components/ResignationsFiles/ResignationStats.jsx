import React from 'react';
import { 
  FileX, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Users
} from 'lucide-react';

const ResignationStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Resignations',
      value: stats.total || 0,
      icon: FileX,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: stats.recent || 0,
      changeLabel: 'This month'
    },
    {
      title: 'Pending',
      value: stats.pending || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      change: stats.pending || 0,
      changeLabel: 'Awaiting approval'
    },
    {
      title: 'Approved',
      value: stats.approved || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: stats.approved || 0,
      changeLabel: 'This month'
    },
    {
      title: 'Rejected',
      value: stats.rejected || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: stats.rejected || 0,
      changeLabel: 'This month'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">{stat.title}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>{stat.change} {stat.changeLabel}</span>
                </div>
              </div>
              <div className={`h-8 w-8 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResignationStats;
