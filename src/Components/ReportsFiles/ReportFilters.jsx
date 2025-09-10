import React, { useState } from 'react';
import { Card } from '../../Components';
import { Filter, Calendar, Building2, User, RefreshCw } from 'lucide-react';

const ReportFilters = ({ filters, onFilterChange, offices, employees }) => {
  // Check if user is manager
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isManager = user.role === 'manager';
  const [showFilters, setShowFilters] = useState(false);

  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const resetFilters = () => {
    onFilterChange({
      start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      office: '',
      user: '',
      status: ''
    });
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'late', label: 'Late' },
    { value: 'half_day', label: 'Half Day' }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Attendance Report Filters</h3>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4 inline mr-2" />
              Start Date
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4 inline mr-2" />
              End Date
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleInputChange('end_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Office Filter - Hidden for managers since it's auto-set */}
          {!isManager && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Building2 className="h-4 w-4 inline mr-2" />
                Office
              </label>
              <select
                value={filters.office}
                onChange={(e) => handleInputChange('office', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Offices</option>
                {Array.isArray(offices) && offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Employee Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <User className="h-4 w-4 inline mr-2" />
              Employee
            </label>
            <select
              value={filters.user}
              onChange={(e) => handleInputChange('user', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Employees</option>
              {Array.isArray(employees) && employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name} ({employee.employee_id || 'No ID'})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Filter className="h-4 w-4 inline mr-2" />
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          {filters.start_date && filters.end_date && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Calendar className="h-3 w-3 mr-1" />
              {filters.start_date} to {filters.end_date}
            </span>
          )}
          {filters.office && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Building2 className="h-3 w-3 mr-1" />
              Office: {offices.find(o => o.id === filters.office)?.name || filters.office}
              {isManager && ' (Auto-set)'}
            </span>
          )}
          {filters.user && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <User className="h-3 w-3 mr-1" />
              Employee: {employees.find(e => e.id === filters.user)?.first_name || filters.user}
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Filter className="h-3 w-3 mr-1" />
              Status: {statusOptions.find(s => s.value === filters.status)?.label || filters.status}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ReportFilters;
