import React from 'react';
import { 
  Briefcase, 
  Calendar, 
  Building2,
  Hash,
  DollarSign
} from 'lucide-react';
import { Card, Input } from '../index';
import { formatDateWithDay } from '../../utils/dateUtils';

const EmploymentInformation = ({ user, formData, handleInputChange, isEditing }) => {
  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center mb-4">
        <Briefcase className="h-5 w-5 text-green-600 mr-2" />
        <h3 className="text-base font-semibold text-gray-900">Employment Information</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <Hash className="h-4 w-4 inline mr-1" />
            Employee ID
          </label>
          {isEditing ? (
            <Input
              type="text"
              name="employee_id"
              value={formData.employee_id || ''}
              onChange={handleInputChange}
              placeholder="Enter employee ID"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{user?.employee_id || 'Not provided'}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <Building2 className="h-4 w-4 inline mr-1" />
            Department
          </label>
          {isEditing ? (
            <Input
              type="text"
              name="department"
              value={formData.department || ''}
              onChange={handleInputChange}
              placeholder="Enter department"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{user?.department_name || 'Not provided'}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Designation
          </label>
          {isEditing ? (
            <Input
              type="text"
              name="designation"
              value={formData.designation || ''}
              onChange={handleInputChange}
              placeholder="Enter designation"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{user?.designation_name || 'Not provided'}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <Calendar className="h-4 w-4 inline mr-1" />
            Joining Date
          </label>
          {isEditing ? (
            <Input
              type="date"
              name="joining_date"
              value={formData.joining_date || ''}
              onChange={handleInputChange}
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">
              {user?.joining_date ? formatDateWithDay(user.joining_date) : 'Not provided'}
            </p>
          )}
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <DollarSign className="h-4 w-4 inline mr-1" />
            Salary
          </label>
          {isEditing ? (
            <Input
              type="number"
              name="salary"
              value={formData.salary || ''}
              onChange={handleInputChange}
              placeholder="Enter salary"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{formatSalary(user?.salary)}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EmploymentInformation;
