import React from 'react';
import { 
  User, 
  Building2, 
  Shield,
  Clock,
  Calendar
} from 'lucide-react';
import { Card } from '../index';
import { formatDateWithDay } from '../../utils/dateUtils';

const ProfileSummary = ({ user }) => {
  return (
    <Card className="p-4">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <User className="h-8 w-8 text-white" />
          )}
        </div>
        <h2 className="text-base font-semibold text-gray-900">{user?.full_name || 'User'}</h2>
        <p className="text-xs text-gray-600">{user?.role?.toUpperCase() || 'EMPLOYEE'}</p>
        {user?.office_name && (
          <p className="text-xs text-gray-500 mt-1">
            <Building2 className="h-3 w-3 inline mr-1" />
            {user.office_name}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
          <span className="text-xs font-medium text-gray-600">Username</span>
          <span className="text-xs text-gray-900">{user?.username || 'Not provided'}</span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
          <span className="text-xs font-medium text-gray-600">User ID</span>
          <span className="text-xs text-gray-900 font-mono">{user?.id || 'Not provided'}</span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
          <span className="text-xs font-medium text-gray-600">Status</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            user?.is_active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <Shield className="h-3 w-3 mr-1" />
            {user?.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        {user?.last_login && (
          <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
            <span className="text-xs font-medium text-gray-600">Last Login</span>
            <span className="text-xs text-gray-900">
              <Clock className="h-3 w-3 inline mr-1" />
              {formatDateWithDay(user.last_login)}
            </span>
          </div>
        )}

        {user?.created_at && (
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs font-medium text-gray-600">Member Since</span>
            <span className="text-xs text-gray-900">
              <Calendar className="h-3 w-3 inline mr-1" />
              {formatDateWithDay(user.created_at)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProfileSummary;
