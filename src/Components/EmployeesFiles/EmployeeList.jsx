import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input, Select } from '../index';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Building,
  Mail,
  Phone,
  Edit,
  Trash2,
  UserCheck,
  Shield,
  Plus,
  Calendar,
  Eye
} from 'lucide-react';
import { formatDateWithDay } from '../../utils/dateUtils';
import api from '../../services/api';

const EmployeeList = ({ onEdit, onDelete, onCreate, onViewAttendance, onViewDetails }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: ''
  });
  const [officeInfo, setOfficeInfo] = useState({
    name: '',
    id: ''
  });
  const [departments, setDepartments] = useState([]);

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await api.getDepartments();
      const data = response.data || response;
      const departmentsData = data.results || data;
      
      if (Array.isArray(departmentsData)) {
        setDepartments(departmentsData);
      } else {
        console.warn('Departments data is not an array:', departmentsData);
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  }, []);

  // Fetch employees with pagination and filters
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.page,
        page_size: pagination.pageSize,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      console.log('🔍 Fetching employees with params:', params);

      const response = await api.getManagerEmployees(params);
      
      console.log('✅ Employees response:', response);

      setEmployees(response.results || []);
      setPagination(prev => ({
        ...prev,
        totalCount: response.count || 0,
        totalPages: response.total_pages || 0
      }));
      setOfficeInfo({
        name: response.office_name || '',
        id: response.office_id || ''
      });

    } catch (error) {
      console.error('❌ Error fetching employees:', error);
      setError(`Failed to fetch employees: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters]);

  // Handle search
  const handleSearch = useCallback((value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  }, [pagination.totalPages]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPagination(prev => ({ 
      ...prev, 
      pageSize: parseInt(newPageSize), 
      page: 1 
    }));
  }, []);

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5 text-red-600" />;
      case 'manager':
        return <UserCheck className="h-5 w-5 text-blue-600" />;
      case 'employee':
        return <Users className="h-5 w-5 text-green-600" />;
      default:
        return <Users className="h-5 w-5 text-gray-600" />;
    }
  };

  // Get status badge
  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      department: '',
      status: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Fetch data when component mounts or dependencies change
  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, [fetchDepartments, fetchEmployees]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
          <p className="text-gray-600">
            {officeInfo.name && `Office: ${officeInfo.name}`}
            {pagination.totalCount > 0 && ` • ${pagination.totalCount} employees`}
          </p>
        </div>
        <Button 
          onClick={onCreate}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </Select>
          
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          
          <Button
            onClick={clearFilters}
            variant="outline"
            className="flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Employee Table */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading employees...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={fetchEmployees}
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No employees found</p>
            {Object.values(filters).some(f => f !== '') && (
              <Button 
                onClick={clearFilters}
                className="mt-4"
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-compact">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employment
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          {getRoleIcon(employee.role)}
                        </div>
                        <div className="ml-4">
                          <div className="text-xs font-medium text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {employee.employee_id || 'Not assigned'}
                          </div>
                          {employee.biometric_id && (
                            <div className="text-xs text-gray-400">
                              Bio: {employee.biometric_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        {employee.email}
                      </div>
                      {employee.phone && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {employee.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {employee.department_name && (
                          <div className="flex items-center">
                            <Building className="h-3 w-3 mr-1 text-gray-400" />
                            {employee.department_name}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.designation_name || 'Not assigned'}
                      </div>
                      {employee.joining_date && (
                        <div className="text-xs text-gray-400">
                          Joined: {formatDateWithDay(employee.joining_date)}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(employee.is_active)}`}>
                        {Boolean(employee.is_active) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => onViewDetails(employee)}
                          size="sm"
                          variant="outline"
                          className="flex items-center text-green-600 hover:text-green-700"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <Button
                          onClick={() => onViewAttendance(employee)}
                          size="sm"
                          variant="outline"
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Attendance
                        </Button>
                        <Button
                          onClick={() => onEdit(employee)}
                          size="sm"
                          variant="outline"
                          className="flex items-center"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => onDelete(employee.id)}
                          size="sm"
                          variant="outline"
                          className="flex items-center text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show</span>
              <Select
                value={pagination.pageSize}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                className="w-20"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </Select>
              <span className="text-sm text-gray-700">per page</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
                {pagination.totalCount} results
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      variant={pagination.page === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmployeeList;
