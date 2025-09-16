import React from 'react';
import { Card } from '../../Components';
import { Building2, MapPin, Phone, Mail, Users, Calendar } from 'lucide-react';

const OfficeOverviewCard = ({ office, stats }) => {
  if (!office) {
    return null;
  }

  return (
    <Card className="shadow-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Office Overview</h2>
            <p className="text-sm text-gray-600">{office.name}</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-600">{stats?.total_employees || 0}</div>
            <div className="text-xs text-gray-600">Employees</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Calendar className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-600">{stats?.today_attendance || 0}</div>
            <div className="text-xs text-gray-600">Present</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <Calendar className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-yellow-600">{stats?.pending_leaves || 0}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OfficeOverviewCard;
