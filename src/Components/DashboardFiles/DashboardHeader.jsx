import React from 'react';
import { Button } from '../../Components';
import { Building2, RefreshCw, BarChart3, Users, Clock, Calendar, FileText, Settings } from 'lucide-react';

const DashboardHeader = ({ user, onRefresh, refreshing, onViewReports, onQuickAction }) => {
  return (
    <div className="page-header">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Manager Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {user?.first_name}! Here's what's happening in your office.
          </p>
          {/* Office Name Display */}
          {user?.office && (
            <div className="mt-2 flex items-center text-blue-600 font-medium">
              <Building2 className="h-5 w-5 mr-2" />
              <span className="text-lg">{user.office.name}</span>
              {user.office.address && (
                <span className="ml-2 text-gray-600 text-sm">• {user.office.address}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {/* Quick Navigation Buttons */}
          <div className="hidden md:flex items-center space-x-2 mr-4">
            <Button 
              onClick={() => onQuickAction('employees')}
              size="sm"
              variant="outline"
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <Users className="h-4 w-4 mr-1" />
              Employees
            </Button>
            <Button 
              onClick={() => onQuickAction('attendance')}
              size="sm"
              variant="outline"
              className="flex items-center text-green-600 hover:text-green-700"
            >
              <Clock className="h-4 w-4 mr-1" />
              Attendance
            </Button>
            <Button 
              onClick={() => onQuickAction('leaves')}
              size="sm"
              variant="outline"
              className="flex items-center text-yellow-600 hover:text-yellow-700"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Leaves
            </Button>
          </div>
          
          {/* Main Action Buttons */}
          <Button 
            onClick={onRefresh}
            disabled={refreshing}
            className="btn btn-secondary shadow-sm"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={onViewReports}
            className="btn btn-primary shadow-sm"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            View Reports
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
