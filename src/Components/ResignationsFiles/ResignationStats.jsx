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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>{stat.change} {stat.changeLabel}</span>
                </div>
              </div>
              <div className={`h-12 w-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResignationStats;
