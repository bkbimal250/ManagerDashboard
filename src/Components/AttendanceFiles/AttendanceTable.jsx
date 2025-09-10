import React from 'react';
import { Card, Button } from '../../Components';
import { 
  Edit, 
  Clock,
  Calendar,
  User,
  AlertTriangle,
  Timer,
  CalendarDays,
  CheckCircle
} from 'lucide-react';

const AttendanceTable = ({ attendanceRecords, onEdit, getStatusBadge, formatDate, formatTime }) => {
  // Get day status color
  const getDayStatusColor = (dayStatus) => {
    switch (dayStatus) {
      case 'complete_day':
        return 'bg-green-100 text-green-800';
      case 'half_day':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get late status color
  const getLateStatusColor = (isLate) => {
    return isLate ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late Coming</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {record.employee?.first_name} {record.employee?.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {record.employee?.employee_id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(record.date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Clock className="h-4 w-4 mr-2" />
                    {record.check_in ? formatTime(record.check_in) : 'Not checked in'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Clock className="h-4 w-4 mr-2" />
                    {record.check_out ? formatTime(record.check_out) : 'Not checked out'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(record.status)}`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDayStatusColor(record.day_status)}`}>
                      {record.day_status ? record.day_status.replace('_', ' ').toUpperCase() : 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      record.is_late ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      {record.is_late ? (
                        <AlertTriangle className="w-3 h-3 text-orange-600" />
                      ) : (
                        <CheckCircle className="w-3 h-3 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLateStatusColor(record.is_late)}`}>
                        {record.is_late ? 'Late' : 'On Time'}
                      </span>
                      {record.is_late && record.late_minutes && (
                        <div className="text-xs text-orange-600 mt-1">
                          {record.late_minutes} min late
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => onEdit(record)}
                      size="sm"
                      variant="outline"
                      className="flex items-center"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
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

export default AttendanceTable;
