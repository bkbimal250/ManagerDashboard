import React from 'react';
import { Card } from '../../Components';

const ReportChart = ({ title, data, type = 'bar' }) => {
  // This is a placeholder for chart implementation
  // In a real application, you would use a charting library like Chart.js or Recharts
  
  const renderPlaceholderChart = () => {
    if (type === 'bar') {
      return (
        <div className="flex items-end justify-between h-32 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="bg-blue-500 rounded-t w-8"
                style={{ height: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%` }}
              ></div>
              <span className="text-xs text-gray-600 mt-2">{item.label}</span>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="h-32 mt-4 flex items-center justify-center bg-gray-100 rounded">
        <span className="text-gray-500">Chart placeholder for {type}</span>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {renderPlaceholderChart()}
    </Card>
  );
};

export default ReportChart;
