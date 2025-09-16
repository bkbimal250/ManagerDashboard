import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  User, 
  Building2, 
  ChevronDown, 
  ChevronUp,
  SortAsc,
  SortDesc
} from 'lucide-react';

const ReportTable = ({ data, summary }) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <SortAsc className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <SortAsc className="h-4 w-4 text-blue-600" /> : 
      <SortDesc className="h-4 w-4 text-blue-600" />;
  };

  const sortedData = [...data].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle date sorting
    if (sortField === 'date' || sortField.includes('date')) {
      aValue = new Date(aValue || 0);
      bValue = new Date(bValue || 0);
    }

    // Handle numeric sorting
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Handle string sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    }

    // Handle date sorting
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const getStatusBadge = (status) => {
    const badges = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      half_day: 'bg-orange-100 text-orange-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  const headers = [
    { key: 'date', label: 'Date', sortable: true, icon: Calendar },
    { key: 'user__first_name', label: 'Employee', sortable: true, icon: User },
    { key: 'user__employee_id', label: 'Employee ID', sortable: true },
    { key: 'user__department__name', label: 'Department', sortable: true, icon: Building2 },
    { key: 'user__office__name', label: 'Office', sortable: true, icon: Building2 },
    { key: 'check_in_time', label: 'Check In', sortable: true, icon: Clock },
    { key: 'check_out_time', label: 'Check Out', sortable: true, icon: Clock },
    { key: 'status', label: 'Status', sortable: true }
  ];

  const renderCell = (record, header) => {
    const value = record[header.key];
    
    switch (header.key) {
      case 'date':
        return formatDate(value);
      
      case 'check_in_time':
      case 'check_out_time':
        return formatTime(value);
      
      case 'user__first_name':
        return `${record.user__first_name || ''} ${record.user__last_name || ''}`.trim() || '-';
      
      case 'user__department__name':
        return value || 'Not assigned';
      
      case 'status':
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(value)}`}>
            {value}
          </span>
        );
      
      default:
        return value || '-';
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Data Available</h3>
        <p className="text-gray-500">No attendance records found for the selected filters and date range.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Info */}
      {summary && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{data.length}</span> attendance records
              {summary.totalRecords && summary.totalRecords !== data.length && (
                <span> of <span className="font-medium">{summary.totalRecords}</span> total</span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    header.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => header.sortable && handleSort(header.key)}
                >
                  <div className="flex items-center space-x-1">
                    {header.icon && <header.icon className="h-4 w-4" />}
                    <span>{header.label}</span>
                    {header.sortable && getSortIcon(header.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((record, index) => (
              <tr key={record.id || index} className="hover:bg-gray-50">
                {headers.map((header) => (
                  <td key={header.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderCell(record, header)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportTable;
