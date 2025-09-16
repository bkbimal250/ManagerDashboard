import React from 'react';
import { Card, Button } from '../../Components';
import { 
  Edit, 
  Trash2, 
  Mail, 
  Phone,
  Building,
  Calendar,
  User
} from 'lucide-react';
import { formatDateWithDay } from '../../utils/dateUtils';

const EmployeeGrid = ({ employees, onEdit, onDelete, getStatusBadge, getRoleIcon }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {employees.map((employee) => (
        <Card key={employee.id} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              {getRoleIcon(employee.role)}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => onEdit(employee)}
                size="sm"
                variant="outline"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => onDelete(employee.id)}
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {employee.first_name} {employee.last_name}
              </h3>
              <p className="text-sm text-gray-500">ID: {employee.employee_id || 'Not assigned'}</p>
              {employee.biometric_id && (
                <p className="text-xs text-gray-400">Bio: {employee.biometric_id}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {employee.email}
              </div>
              {employee.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {employee.phone}
                </div>
              )}
              {employee.department_name && (
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="h-4 w-4 mr-2" />
                  {employee.department_name}
                </div>
              )}
              {employee.designation_name && (
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  {employee.designation_name}
                </div>
              )}
              {employee.joining_date && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Joined: {formatDateWithDay(employee.joining_date)}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(employee.is_active)}`}>
                {employee.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default EmployeeGrid;
