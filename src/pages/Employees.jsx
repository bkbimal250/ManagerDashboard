import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  EmployeeList, 
  EmployeeModal,
  ViewEmployee
} from '../Components/EmployeesFiles';
import { useAuth } from '../contexts/AuthContext';
import { showSuccess, showError, showLoading, updateLoadingToSuccess, updateLoadingToError } from '../utils/toast';
import api from '../services/api';

const Employees = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    // Basic Information
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    employee_id: '',
    role: 'employee',
    office: '', // Office must be selected by manager
    
    // Personal Information
    date_of_birth: '',
    gender: '',
    address: '',
    
    // Government ID Information
    aadhaar_card: '',
    pan_card: '',
    
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
    password: '',
    confirm_password: ''
  });

  // Handle employee creation
  const handleCreate = () => {
    setEditingEmployee(null);
    resetForm();
    setShowModal(true);
  };

  const handleSubmit = async (e, formDataWithOffice) => {
    e.preventDefault();
    
    // Show loading toast
    const loadingToastId = showLoading(
      editingEmployee ? 'Updating employee...' : 'Creating employee...'
    );
    
    try {
      // Use the form data with office if provided, otherwise use the original formData
      const dataToSubmit = formDataWithOffice || formData;
      
      // Handle password logic
      let finalPassword = 'Dos@9999'; // Default password
      
      if (dataToSubmit.password) {
        // Custom password provided
        if (dataToSubmit.password !== dataToSubmit.confirm_password) {
          updateLoadingToError(loadingToastId, 'Passwords do not match');
          return;
        }
        if (dataToSubmit.password.length < 6) {
          updateLoadingToError(loadingToastId, 'Password must be at least 6 characters long');
          return;
        }
        finalPassword = dataToSubmit.password;
      }
      
      const employeeData = {
        ...dataToSubmit,
        office: dataToSubmit.office || user.office.id, // Use office from form data or fallback to manager's office
        role: 'employee', // Ensure role is always employee for managers
        password: finalPassword,
        confirm_password: finalPassword // Django expects both fields to match
      };

      // Remove empty string values for optional fields
      Object.keys(employeeData).forEach(key => {
        if (employeeData[key] === '') {
          delete employeeData[key];
        }
      });

      // Debug: Log the final employee data being sent
      console.log('🏢 Final employee data being sent to backend:', employeeData);
      console.log('🏢 Office field value:', employeeData.office);
      console.log('🏢 Manager office:', user.office);

      if (editingEmployee) {
        await api.updateEmployee(editingEmployee.id, employeeData);
        updateLoadingToSuccess(loadingToastId, 'Employee updated successfully! 🎉');
      } else {
        await api.createEmployee(employeeData);
        updateLoadingToSuccess(loadingToastId, 'Employee created successfully! 🎉');
      }

      setShowModal(false);
      setEditingEmployee(null);
      resetForm();
      // The EmployeeList component will handle refreshing the data
    } catch (error) {
      console.error('Failed to save employee:', error);
      updateLoadingToError(loadingToastId, `Failed to save employee: ${error.message}`);
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
      office: employee.office?.id || employee.office || user?.office?.id || '',
      
      // Personal Information
      date_of_birth: employee.date_of_birth || '',
      gender: employee.gender || '',
      address: employee.address || '',
      
      // Government ID Information
      aadhaar_card: employee.aadhaar_card || '',
      pan_card: employee.pan_card || '',
      
      // Employment Information
      biometric_id: employee.biometric_id || '',
      joining_date: employee.joining_date || '',
      department: employee.department?.id || employee.department || '',
      designation: employee.designation?.id || employee.designation || '',
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
      password: '',
      confirm_password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        const result = await api.deleteEmployee(employeeId);
        
        // Check if employee was deactivated instead of deleted
        if (result.deactivated) {
          showSuccess('Employee deactivated successfully! (Employee was deactivated instead of deleted)');
        } else {
          showSuccess('Employee deleted successfully!');
        }
        
        // The EmployeeList component will handle refreshing the data
      } catch (error) {
        console.error('Failed to delete employee:', error);
        
        // Handle specific error cases
        if (error.response?.status === 404) {
          showError('Employee not found or delete endpoint not available');
        } else if (error.response?.status === 403) {
          showError('You do not have permission to delete employees');
        } else if (error.response?.status === 400) {
          showError('Cannot delete employee. They may have active records.');
        } else if (error.response?.status === 405) {
          showError('Delete operation not supported. Employee may have been deactivated instead.');
        } else {
          showError('Failed to delete employee. Please try again.');
        }
      }
    }
  };

  const handleViewAttendance = (employee) => {
    // Navigate to attendance page with the selected employee
    navigate('/attendance', { 
      state: { 
        selectedEmployee: employee,
        viewMode: 'employee'
      } 
    });
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
      office: user?.office?.id || '', // Auto-set to manager's office
      
      // Personal Information
      date_of_birth: '',
      gender: '',
      address: '',
      
      // Government ID Information
      aadhaar_card: '',
      pan_card: '',
      
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
      password: '',
      confirm_password: ''
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    resetForm();
  };

  // Handle view employee details
  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="space-y-6">
      {/* Employee List with Pagination */}
      <EmployeeList
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onViewAttendance={handleViewAttendance}
        onViewDetails={handleViewDetails}
      />

      {/* Modal */}
      <EmployeeModal
        showModal={showModal}
        editingEmployee={editingEmployee}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onClose={closeModal}
        user={user}
      />

      {/* View Employee Modal */}
      {showViewModal && (
        <ViewEmployee 
          employee={selectedEmployee}
          onClose={closeViewModal}
        />
      )}
    </div>
  );
};

export default Employees;
