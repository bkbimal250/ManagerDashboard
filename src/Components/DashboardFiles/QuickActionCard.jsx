import React from 'react';

const QuickActionCard = ({ title, subtitle, icon: Icon, onClick, color = 'blue' }) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'from-blue-100 to-indigo-100',
        hover: 'from-blue-50 to-indigo-50',
        border: 'border-blue-300',
        icon: 'text-blue-600',
        shadow: 'shadow-blue-100'
      },
      green: {
        bg: 'from-green-100 to-emerald-100',
        hover: 'from-green-50 to-emerald-50',
        border: 'border-green-300',
        icon: 'text-green-600',
        shadow: 'shadow-green-100'
      },
      yellow: {
        bg: 'from-yellow-100 to-orange-100',
        hover: 'from-yellow-50 to-orange-50',
        border: 'border-yellow-300',
        icon: 'text-yellow-600',
        shadow: 'shadow-yellow-100'
      },
      purple: {
        bg: 'from-purple-100 to-violet-100',
        hover: 'from-purple-50 to-violet-50',
        border: 'border-purple-300',
        icon: 'text-purple-600',
        shadow: 'shadow-purple-100'
      },
      indigo: {
        bg: 'from-indigo-100 to-blue-100',
        hover: 'from-indigo-50 to-blue-50',
        border: 'border-indigo-300',
        icon: 'text-indigo-600',
        shadow: 'shadow-indigo-100'
      },
      gray: {
        bg: 'from-gray-100 to-slate-100',
        hover: 'from-gray-50 to-slate-50',
        border: 'border-gray-300',
        icon: 'text-gray-600',
        shadow: 'shadow-gray-100'
      }
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses(color);

  return (
    <button 
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gradient-to-r hover:${colorClasses.hover} hover:${colorClasses.border} hover:shadow-md transition-all duration-200 group`}
    >
      <div className="flex flex-col items-center text-center">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses.bg} group-hover:from-white group-hover:to-${colorClasses.hover.split('-')[1]}-50 transition-all duration-200 shadow-sm group-hover:shadow-md mb-2`}>
          <Icon className={`h-5 w-5 ${colorClasses.icon} group-hover:scale-110 transition-transform duration-200`} />
        </div>
        <div className="font-medium text-gray-900 group-hover:text-gray-800 transition-colors duration-200 text-sm">{title}</div>
        <div className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-200 mt-1">{subtitle}</div>
      </div>
    </button>
  );
};

export default QuickActionCard;
