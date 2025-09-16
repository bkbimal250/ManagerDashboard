import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../Components';
import { AlertCircle, CheckCircle, Building } from 'lucide-react';
import { showError } from '../../utils/toast';
import api from '../../services/api';

const EmployeeModal = ({ 
  showModal, 
  editingEmployee, 
  formData, 
  setFormData, 
  onSubmit, 
  onClose,
  user // Add user prop to get manager's office
}) => {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [useCustomPassword, setUseCustomPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch departments when modal opens
  useEffect(() => {
    if (showModal) {
      fetchDepartments();
    }
  }, [showModal]);


  // Fetch designations when department changes
  useEffect(() => {
    if (formData.department && formData.department !== '') {
      fetchDesignations(formData.department);
    } else {
      setDesignations([]);
    }
  }, [formData.department]);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await api.getDepartments();
      const data = response.data || response;
      const departments = data.results || data;
      
      // Ensure we always have an array
      if (Array.isArray(departments)) {
        setDepartments(departments);
      } else {
        console.warn('Departments data is not an array:', departments);
        setDepartments([]);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchDesignations = async (departmentId) => {
    try {
      setLoadingDesignations(true);
      const response = await api.getDesignationsByDepartment(departmentId);
      const data = response.data || response;
      const designations = data.results || data;
      
      // Ensure we always have an array
      if (Array.isArray(designations)) {
        setDesignations(designations);
      } else {
        console.warn('Designations data is not an array:', designations);
        setDesignations([]);
      }
    } catch (error) {
      console.error('Failed to fetch designations:', error);
      setDesignations([]);
    } finally {
      setLoadingDesignations(false);
    }
  };


  if (!showModal) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear designation when department changes
    if (field === 'department') {
      setFormData(prev => ({ ...prev, [field]: value, designation: '' }));
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validation function
  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    const requiredFields = {
      first_name: 'First Name is required',
      last_name: 'Last Name is required',
      username: 'Username is required',
      email: 'Email is required'
    };

    // Check required fields
    Object.keys(requiredFields).forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = requiredFields[field];
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation (if provided)
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Custom password validation (only for create mode with custom password)
    if (!editingEmployee && useCustomPassword) {
      if (!formData.password || formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
      }
      if (!formData.confirm_password) {
        errors.confirm_password = 'Please confirm your password';
      }
      if (formData.password !== formData.confirm_password) {
        errors.confirm_password = 'Passwords do not match';
      }
    }

    // PAN Card validation (if provided)
    if (formData.pan_card && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_card)) {
      errors.pan_card = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
    }

    // Aadhaar validation (if provided)
    if (formData.aadhaar_card && !/^[0-9]{12}$/.test(formData.aadhaar_card)) {
      errors.aadhaar_card = 'Aadhaar number must be 12 digits';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Set default password if not using custom password
      const password = useCustomPassword ? formData.password : 'Dos@9999';
      
      const formDataWithDefaults = {
        ...formData,
        office: user?.office?.id || user?.office || user?.office_id, // Include office assignment
        password: password,
        confirm_password: password // Django expects both fields to match
      };
      
      await onSubmit(e, formDataWithDefaults);
    } catch (error) {
      console.error('Form submission error:', error);
      showError('Form submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-3 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {editingEmployee ? 'Edit Employee' : 'Add Employee'}
        </h2>
        
        <form onSubmit={handleFormSubmit} className="space-y-3">
          {/* Basic Information */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-base font-medium text-gray-900 mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
                <Input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className={validationErrors.first_name ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {validationErrors.first_name && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.first_name}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
                <Input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className={validationErrors.last_name ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {validationErrors.last_name && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.last_name}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Username *</label>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={validationErrors.username ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {validationErrors.username && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.username}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={validationErrors.email ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {validationErrors.email && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.email}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={validationErrors.phone ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {validationErrors.phone && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.phone}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Employee ID</label>
                <Input
                  type="text"
                  value={formData.employee_id}
                  onChange={(e) => handleInputChange('employee_id', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Office Assignment */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-base font-medium text-gray-900 mb-3">Office Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Office *</label>
                <Input
                  type="text"
                  value={editingEmployee ? (editingEmployee.office_name || 'N/A') : (user?.office?.name || user?.office_name || 'Default Office')}
                  readOnly
                  className="bg-gray-100 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingEmployee ? 'Current office assignment' : 'Office will be assigned automatically'}
                </p>
              </div>
            </div>
          </div>
          

          {/* Personal Information */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-base font-medium text-gray-900 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Government ID Information */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-base font-medium text-gray-900 mb-3">Government ID Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Aadhaar Card Number</label>
                <Input
                  type="text"
                  value={formData.aadhaar_card}
                  onChange={(e) => handleInputChange('aadhaar_card', e.target.value)}
                  placeholder="Enter 12-digit Aadhaar number"
                  maxLength={12}
                  className={validationErrors.aadhaar_card ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {validationErrors.aadhaar_card ? (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.aadhaar_card}
                  </div>
                ) : (
                <p className="text-xs text-gray-500 mt-1">Enter 12-digit Aadhaar card number</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">PAN Card Number</label>
                <Input
                  type="text"
                  value={formData.pan_card}
                  onChange={(e) => handleInputChange('pan_card', e.target.value.toUpperCase())}
                  placeholder="Enter PAN number (e.g., ABCDE1234F)"
                  maxLength={10}
                  className={validationErrors.pan_card ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {validationErrors.pan_card ? (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.pan_card}
                  </div>
                ) : (
                <p className="text-xs text-gray-500 mt-1">Format: AAAAA9999A (5 letters, 4 digits, 1 letter)</p>
                )}
              </div>
            </div>
          </div>

          {/* Password Section - Only for Create Mode */}
          {!editingEmployee && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="text-base font-medium text-gray-900 mb-3">Password Settings</h3>
              
              {/* Password Option Toggle */}
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="passwordOption"
                      checked={!useCustomPassword}
                      onChange={() => setUseCustomPassword(false)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      Use default password: <code className="bg-gray-100 px-2 py-1 rounded text-xs">Dos@9999</code>
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="passwordOption"
                      checked={useCustomPassword}
                      onChange={() => setUseCustomPassword(true)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Set custom password</span>
                  </label>
                </div>
              </div>

              {/* Custom Password Fields */}
              {useCustomPassword && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter password (min 6 characters)"
                      minLength={6}
                      className={validationErrors.password ? 'border-red-500 focus:ring-red-500' : ''}
                    />
                    {validationErrors.password && (
                      <div className="flex items-center mt-1 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {validationErrors.password}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password *</label>
                    <Input
                      type="password"
                      value={formData.confirm_password}
                      onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                      placeholder="Confirm password"
                      className={validationErrors.confirm_password ? 'border-red-500 focus:ring-red-500' : ''}
                    />
                    {validationErrors.confirm_password && (
                      <div className="flex items-center mt-1 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {validationErrors.confirm_password}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Employment Information */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-base font-medium text-gray-900 mb-3">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Biometric ID</label>
                <Input
                  type="text"
                  value={formData.biometric_id}
                  onChange={(e) => handleInputChange('biometric_id', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Employee Joining Date</label>
                <Input
                  type="date"
                  value={formData.joining_date}
                  onChange={(e) => handleInputChange('joining_date', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loadingDepartments}
                >
                  <option value="">Select Department</option>
                  {Array.isArray(departments) && departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {loadingDepartments && (
                  <p className="text-xs text-gray-500 mt-1">Loading departments...</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
                <select
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loadingDesignations || !formData.department}
                >
                  <option value="">Select Designation</option>
                  {Array.isArray(designations) && designations.map((desig) => (
                    <option key={desig.id} value={desig.id}>
                      {desig.name}
                    </option>
                  ))}
                </select>
                {loadingDesignations && (
                  <p className="text-xs text-gray-500 mt-1">Loading designations...</p>
                )}
                {!formData.department && (
                  <p className="text-xs text-gray-500 mt-1">Please select a department first</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Salary</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-base font-medium text-gray-900 mb-3">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Name</label>
                <Input
                  type="text"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Phone</label>
                <Input
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Relationship</label>
                <Input
                  type="text"
                  value={formData.emergency_contact_relationship}
                  onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-base font-medium text-gray-900 mb-3">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Bank Account Holder Name</label>
                <Input
                  type="text"
                  value={formData.account_holder_name}
                  onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Bank Name</label>
                <Input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => handleInputChange('bank_name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Bank Account Number</label>
                <Input
                  type="text"
                  value={formData.account_number}
                  onChange={(e) => handleInputChange('account_number', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Bank IFSC Code</label>
                <Input
                  type="text"
                  value={formData.ifsc_code}
                  onChange={(e) => handleInputChange('ifsc_code', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Bank Branch Name</label>
                <Input
                  type="text"
                  value={formData.bank_branch_name}
                  onChange={(e) => handleInputChange('bank_branch_name', e.target.value)}
                />
              </div>
            </div>
          </div>


          {/* Status */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-base font-medium text-gray-900 mb-3">Account Status</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active Account
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingEmployee ? 'Updating...' : 'Adding...'}
                </div>
              ) : (
                `${editingEmployee ? 'Update' : 'Add'} Employee`
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
