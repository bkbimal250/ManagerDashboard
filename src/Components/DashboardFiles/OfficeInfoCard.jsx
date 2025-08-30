import React from 'react';
import { Card } from '../../Components';
import { Building2, Users } from 'lucide-react';

const OfficeInfoCard = ({ office, manager }) => {
  if (!office) return null;

  return (
    <Card className="shadow-lg border-2 border-gray-100">
      <div className="card-header">
        <h2 className="text-xl font-bold text-gray-900">Office Information</h2>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-blue-600" />
              Office Details
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p><strong>Name:</strong> {office.name}</p>
              <p><strong>Address:</strong> {office.address || 'Not specified'}</p>
              <p><strong>Email:</strong> {office.email || 'Not specified'}</p>
              <p><strong>Phone:</strong> {office.phone || 'Not specified'}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              Manager Details
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p><strong>Name:</strong> {manager?.first_name} {manager?.last_name}</p>
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
