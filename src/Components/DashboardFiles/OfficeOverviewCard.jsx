import React from 'react';
import { Card } from '../../Components';
import { Building2, MapPin, Phone, Mail, Users, Calendar } from 'lucide-react';

const OfficeOverviewCard = ({ office, stats }) => {
  if (!office) {
    return null;
  }

  return (
    <Card className="shadow-lg border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="card-header border-b border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-900">Office Overview</h2>
            <p className="text-blue-700">Manage your office operations</p>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="space-y-4">
          {/* Office Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-900">{office.name}</span>
              </div>
              {office.address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="text-sm text-gray-600">{office.address}</span>
                </div>
              )}
              {office.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">{office.phone}</span>
                </div>
              )}
              {office.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">{office.email}</span>
                </div>
              )}
            </div>
            
            {/* Office Statistics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Total Employees</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{stats?.total_employees || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Present Today</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats?.today_attendance || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">Pending Leaves</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{stats?.pending_leaves || 0}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Office Actions */}
          <div className="pt-4 border-t border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-3">Quick Office Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                View All Employees
              </button>
              <button className="px-3 py-2 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors">
                Office Reports
              </button>
              <button className="px-3 py-2 text-xs font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors">
                Device Status
              </button>
              <button className="px-3 py-2 text-xs font-medium text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200 transition-colors">
                Office Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OfficeOverviewCard;
