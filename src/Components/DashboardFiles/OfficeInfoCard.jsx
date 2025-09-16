import React from 'react';
import { Card } from '../../Components';
import { Building2, Users } from 'lucide-react';

const OfficeInfoCard = ({ office, manager }) => {
  if (!office) return null;

  return (
    <Card className="shadow-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Manager Information</h2>
      </div>
      <div className="p-4">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-green-100 text-green-600">
            <Users className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">{manager?.first_name} {manager?.last_name}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Email:</strong> {manager?.email}</p>
              <p><strong>Phone:</strong> {manager?.phone || 'Not specified'}</p>
              <p><strong>Employee ID:</strong> {manager?.employee_id || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OfficeInfoCard;
