import React, { useState, useEffect } from 'react';
import { Button, Pagination } from '../Components';
import { 
  UserPlus,
  UserCheck,
  Shield,
  Users
} from 'lucide-react';
import { 
  EmployeeTable, 
  EmployeeGrid, 
  EmployeeModal, 
  EmployeeSearch, 
  EmptyState 
} from '../Components/EmployeesFiles';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    // Basic Information
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    employee_id: '',
    role: 'employee',
    
    // Personal Information
    date_of_birth: '',
    gender: '',
    address: '',
    
    // Employment Information
    biometric_id: '',
    joining_date: '',
    department: '',
    designation: '',
    salary: '',
    
    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    
    // Bank Details
    account_holder_name: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    bank_branch_name: '',
    
    // Account Settings
    is_active: true,
    password: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Use the manager-specific API method
      const response = await api.getManagerEmployees();
      console.log('API Response:', response); // Debug log
      
      // Handle different response structures
      let employeesData = [];
      if (Array.isArray(response)) {
        employeesData = response;
      } else if (response && response.results && Array.isArray(response.results)) {
        employeesData = response.results;
      } else if (response && response.employees && Array.isArray(response.employees)) {
        employeesData = response.employees;
      } else if (response && typeof response === 'object') {
        // If response is an object but not the expected structure, try to extract data
        employeesData = Object.values(response).find(val => Array.isArray(val)) || [];
      } else {
        employeesData = [];
      }
      
      console.log('Extracted employeesData:', employeesData); // Debug log
      console.log('User office ID:', user?.office?.id); // Debug log
      
      // For debugging, show all employees first, then filter
      console.log('All employees before filtering:', employeesData);
      
      // Filter employees by office (manager can only see their office employees)
      const filteredEmployees = employeesData.filter(employee => {
        // Debug each employee's office and active status
        console.log('Employee:', {
          name: `${employee.first_name} ${employee.last_name}`,
          office_id: employee.office?.id,
          office_name: employee.office?.name,
          is_active: employee.is_active,
          role: employee.role
        });
        
        return employee.office?.id === user?.office?.id;
      });
      
      console.log('Filtered employees:', filteredEmployees);
      setEmployees(filteredEmployees);
      
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const employeeData = {
        ...formData,
        office: user.office.id,
        role: 'employee', // Ensure role is always employee for managers
        password: formData.password || 'defaultpassword123'
      };

      // Remove empty string values for optional fields
      Object.keys(employeeData).forEach(key => {
        if (employeeData[key] === '') {
          delete employeeData[key];
        }
      });

      if (editingEmployee) {
        await api.updateEmployee(editingEmployee.id, employeeData);
      } else {
        await api.createEmployee(employeeData);
      }

      setShowModal(false);
      setEditingEmployee(null);
      resetForm();
      fetchEmployees();
    } catch (error) {
      console.error('Failed to save employee:', error);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      // Basic Information
      username: employee.username || '',
      first_name: employee.first_name || '',
      last_name: employee.last_name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      employee_id: employee.employee_id || '',
      role: employee.role || 'employee',
      
      // Personal Information
      date_of_birth: employee.date_of_birth || '',
      gender: employee.gender || '',
      address: employee.address || '',
      
      // Employment Information
      biometric_id: employee.biometric_id || '',
      joining_date: employee.joining_date || '',
      department: employee.department || '',
      designation: employee.designation || '',
      salary: employee.salary || '',
      
      // Emergency Contact
      emergency_contact_name: employee.emergency_contact_name || '',
      emergency_contact_phone: employee.emergency_contact_phone || '',
      emergency_contact_relationship: employee.emergency_contact_relationship || '',
      
      // Bank Details
      account_holder_name: employee.account_holder_name || '',
      bank_name: employee.bank_name || '',
      account_number: employee.account_number || '',
      ifsc_code: employee.ifsc_code || '',
      bank_branch_name: employee.bank_branch_name || '',
      
      // Account Settings
      is_active: employee.is_active !== undefined ? employee.is_active : true,
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.deleteEmployee(employeeId);
        fetchEmployees();
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      // Basic Information
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      employee_id: '',
      role: 'employee',
      
      // Personal Information
      date_of_birth: '',
      gender: '',
      address: '',
      
      // Employment Information
      biometric_id: '',
      joining_date: '',
      department: '',
      designation: '',
      salary: '',
      
      // Emergency Contact
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
      
      // Bank Details
      account_holder_name: '',
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      bank_branch_name: '',
      
      // Account Settings
      is_active: true,
      password: ''
    });
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    resetForm();
  };

  const getStatusBadge = (isActive) => {
    // Debug the isActive value
    console.log('getStatusBadge called with:', isActive, 'Type:', typeof isActive);
    
    // Handle different data types
    const isActiveBool = Boolean(isActive);
    
    return isActiveBool 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getRoleIcon = (role) => {
    const icons = {
      employee: <UserCheck className="h-4 w-4" />,
      manager: <Shield className="h-4 w-4" />,
      admin: <Shield className="h-4 w-4" />
    };
    return icons[role] || <Users className="h-4 w-4" />;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const filteredEmployees = employees.filter(employee =>
    employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate the filtered employees
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="page-title">Employees</h1>
            <p className="page-subtitle">Manage employees in your office: {user?.office?.name}</p>
        </div>
          <Button onClick={openAddModal} className="btn btn-primary">
            <UserPlus className="h-5 w-5 mr-2" />
          Add Employee
        </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <EmployeeSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Content */}
      {filteredEmployees.length > 0 ? (
        viewMode === 'table' ? (
          <EmployeeTable
            employees={paginatedEmployees}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getStatusBadge={getStatusBadge}
            getRoleIcon={getRoleIcon}
          />
        ) : (
          <EmployeeGrid
            employees={paginatedEmployees}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getStatusBadge={getStatusBadge}
            getRoleIcon={getRoleIcon}
          />
        )
      ) : (
        <EmptyState
          searchTerm={searchTerm}
          onAddEmployee={openAddModal}
        />
      )}

      {/* Pagination */}
      {filteredEmployees.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredEmployees.length / itemsPerPage)}
          totalItems={filteredEmployees.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Modal */}
      <EmployeeModal
        showModal={showModal}
        editingEmployee={editingEmployee}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />
    </div>
  );
};

export default Employees;
