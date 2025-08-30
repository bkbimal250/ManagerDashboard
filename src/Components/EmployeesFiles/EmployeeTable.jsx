import React from 'react';
import { Card, Button } from '../../Components';
import { 
  Edit, 
  Trash2, 
  UserCheck,
  Shield,
  Users,
  Mail,
  Phone,
  Building
} from 'lucide-react';
import { formatDateWithDay } from '../../utils/dateUtils';

const EmployeeTable = ({ employees, onEdit, onDelete, getStatusBadge, getRoleIcon }) => {
  return (
    <Card className="p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      {getRoleIcon(employee.role)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
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
                <td className="px-6 py-4 whitespace-nowrap">
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {employee.department && (
                      <div className="flex items-center">
                        <Building className="h-3 w-3 mr-1 text-gray-400" />
                        {employee.department}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {employee.designation || 'Not assigned'}
                  </div>
                  {employee.joining_date && (
                    <div className="text-xs text-gray-400">
                      Joined: {formatDateWithDay(employee.joining_date)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(employee.is_active)}`}>
                    {Boolean(employee.is_active) ? 'Active' : 'Inactive'}
                  </span>
                  {/* Debug info */}
                  <div className="text-xs text-gray-400 mt-1">
                    Debug: {employee.is_active} ({typeof employee.is_active})
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
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
    </Card>
  );
};

export default EmployeeTable;
