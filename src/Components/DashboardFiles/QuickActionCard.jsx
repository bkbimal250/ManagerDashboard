import React from 'react';

const QuickActionCard = ({ title, subtitle, icon: Icon, onClick, color = 'blue' }) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'from-blue-100 to-indigo-100',
        hover: 'from-blue-50 to-indigo-50',
        border: 'border-blue-300',
        icon: 'text-blue-600'
      },
      green: {
        bg: 'from-green-100 to-emerald-100',
        hover: 'from-green-50 to-emerald-50',
        border: 'border-green-300',
        icon: 'text-green-600'
      },
      yellow: {
        bg: 'from-yellow-100 to-orange-100',
        hover: 'from-yellow-50 to-orange-50',
        border: 'border-yellow-300',
        icon: 'text-yellow-600'
      }
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses(color);

  return (
    <button 
      onClick={onClick}
      className={`w-full text-left p-6 rounded-xl border-2 border-gray-200 hover:bg-gradient-to-r hover:${colorClasses.hover} hover:${colorClasses.border} hover:shadow-md transition-all duration-300 group`}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses.bg} group-hover:from-white group-hover:to-${colorClasses.hover.split('-')[1]}-50 transition-all duration-300 shadow-sm`}>
          <Icon className={`h-6 w-6 ${colorClasses.icon}`} />
        </div>
        <div className="ml-4">
          <div className="font-semibold text-gray-900">{title}</div>
          <div className="text-sm text-gray-600">{subtitle}</div>
        </div>
      </div>
    </button>
  );
};

export default QuickActionCard;
