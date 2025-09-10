import React from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

const ReportChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">No chart data available</p>
      </div>
    );
  }

  // Limit data to last 30 days for better visualization
  const limitedData = data.slice(-30);
  
  // Get chart dimensions
  const maxValue = Math.max(...limitedData.map(d => d.total || d.present || 0));
  const chartHeight = 200;
  const barWidth = Math.max(20, Math.min(40, 800 / limitedData.length));

  const getChartColor = (value, max) => {
    const percentage = value / max;
    
    if (percentage >= 0.8) return 'bg-green-500';
    if (percentage >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTooltipContent = (item) => {
    return `
      <div class="bg-gray-900 text-white p-2 rounded text-xs">
        <div class="font-medium">${item.date}</div>
        <div>Present: ${item.present}</div>
        <div>Absent: ${item.absent}</div>
        <div>Total: ${item.total}</div>
        <div>Rate: ${item.rate}%</div>
      </div>
    `;
  };

  const renderChart = () => {
    return (
      <div className="relative">
        <svg
          width="100%"
          height={chartHeight}
          className="overflow-visible"
        >
          {/* Grid lines */}
          {Array.from({ length: 5 }, (_, i) => {
            const y = (i * chartHeight) / 4;
            return (
              <line
                key={i}
                x1="0"
                y1={y}
                x2="100%"
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            );
          })}

          {/* Bars */}
          {limitedData.map((item, index) => {
            const x = (index * 100) / limitedData.length;
            const value = item.total || item.present || item.value || 0;
            const height = maxValue > 0 ? (value / maxValue) * chartHeight : 0;
            const y = chartHeight - height;
            
            return (
              <g key={index}>
                <rect
                  x={`${x}%`}
                  y={y}
                  width={`${100 / limitedData.length - 1}%`}
                  height={height}
                  fill={getChartColor(value, maxValue)}
                  className="transition-all duration-200 hover:opacity-80"
                  rx="2"
                />
                
                {/* Value label */}
                {height > 20 && (
                  <text
                    x={`${x + (100 / limitedData.length) / 2}%`}
                    y={y - 5}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-600"
                  >
                    {value}
                  </text>
                )}
              </g>
            );
          })}

          {/* X-axis labels */}
          {limitedData.length <= 15 && limitedData.map((item, index) => {
            const x = (index * 100) / limitedData.length;
            return (
              <text
                key={index}
                x={`${x + (100 / limitedData.length) / 2}%`}
                y={chartHeight + 20}
                textAnchor="middle"
                className="text-xs fill-gray-500"
                transform={`rotate(-45 ${(x + (100 / limitedData.length) / 2) * 8} ${(chartHeight + 20) * 8})`}
              >
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderStats = () => {
    const totalPresent = limitedData.reduce((sum, d) => sum + (d.present || 0), 0);
    const totalAbsent = limitedData.reduce((sum, d) => sum + (d.absent || 0), 0);
    const avgRate = limitedData.reduce((sum, d) => sum + (d.rate || 0), 0) / limitedData.length;
    
    return (
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalPresent}</div>
          <div className="text-sm text-gray-600">Total Present</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{totalAbsent}</div>
          <div className="text-sm text-gray-600">Total Absent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{avgRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Avg. Rate</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">Daily Attendance Trends</h4>
        <div className="text-sm text-gray-500">
          Last {limitedData.length} days
        </div>
      </div>
      
      {renderChart()}
      {renderStats()}
      
      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">Good (≥80%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-600">Average (60-79%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">Needs Attention (&lt;60%)</span>
        </div>
      </div>
    </div>
  );
};

export default ReportChart;
