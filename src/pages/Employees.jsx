import React, { useState } from 'react';
import { 
  EmployeeList, 
  EmployeeModal
} from '../Components/EmployeesFiles';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Employees = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
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

  // Handle employee creation
  const handleCreate = () => {
    setEditingEmployee(null);
    resetForm();
    setShowModal(true);
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
      // The EmployeeList component will handle refreshing the data
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
        // The EmployeeList component will handle refreshing the data
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

  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Employee List with Pagination */}
      <EmployeeList
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

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
