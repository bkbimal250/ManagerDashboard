import React from 'react';
import { Card, Button } from '../../Components';
import { Users, UserPlus } from 'lucide-react';

const EmptyState = ({ searchTerm, onAddEmployee }) => {
  return (
    <Card className="p-12 text-center">
      <Users className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
      <p className="mt-1 text-sm text-gray-500">
        {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first employee.'}
      </p>
      {!searchTerm && (
        <div className="mt-6">
          <Button onClick={onAddEmployee} className="flex items-center mx-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      )}
    </Card>
  );
};

export default EmptyState;
