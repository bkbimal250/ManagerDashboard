import React, { useState } from 'react';
import { Button } from '../Components';
import { 
  Clock, 
  Users,
  Building2
} from 'lucide-react';
import { 
  AttendanceOverview,
  EmployeeAttendanceView
} from '../Components/AttendanceFiles';
import { useAuth } from '../contexts/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('overview'); // overview, employee
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setViewMode('employee');
  };

  const handleBackToOverview = () => {
    setSelectedEmployee(null);
    setViewMode('overview');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Attendance Management</h1>
            <p className="page-subtitle">
              Monitor and manage attendance for your office: {user?.office?.name}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-sm text-gray-600">
              <Building2 className="h-4 w-4 mr-1" />
              {user?.office?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'overview' ? (
        <AttendanceOverview onViewEmployee={handleViewEmployee} />
      ) : (
        <EmployeeAttendanceView 
          employee={selectedEmployee} 
          onBack={handleBackToOverview} 
        />
      )}
    </div>
  );
};

export default Attendance;
