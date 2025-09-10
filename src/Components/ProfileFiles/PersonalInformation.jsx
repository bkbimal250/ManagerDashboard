import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Building2
} from 'lucide-react';
import { Card, Input } from '../index';
import { formatDateWithDay } from '../../utils/dateUtils';

const PersonalInformation = ({ user, formData, handleInputChange, isEditing }) => {
  const formatGender = (gender) => {
    switch (gender) {
      case 'M': return 'Male';
      case 'F': return 'Female';
      case 'O': return 'Other';
      default: return 'Not specified';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center mb-4">
        <User className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-base font-semibold text-gray-900">Personal Information</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            First Name
          </label>
          {isEditing ? (
            <Input
              type="text"
              name="first_name"
              value={formData.first_name || ''}
              onChange={handleInputChange}
              placeholder="Enter first name"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{user?.first_name || 'Not provided'}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Last Name
          </label>
          {isEditing ? (
            <Input
              type="text"
              name="last_name"
              value={formData.last_name || ''}
              onChange={handleInputChange}
              placeholder="Enter last name"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{user?.last_name || 'Not provided'}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <Mail className="h-4 w-4 inline mr-1" />
            Email Address
          </label>
          {isEditing ? (
            <Input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              placeholder="Enter email address"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{user?.email || 'Not provided'}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <Phone className="h-4 w-4 inline mr-1" />
            Phone Number
          </label>
          {isEditing ? (
            <Input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{user?.phone || 'Not provided'}</p>
          )}
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <MapPin className="h-4 w-4 inline mr-1" />
            Address
          </label>
          {isEditing ? (
            <textarea
              name="address"
              value={formData.address || ''}
              onChange={handleInputChange}
              placeholder="Enter address"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{user?.address || 'Not provided'}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <Calendar className="h-4 w-4 inline mr-1" />
            Date of Birth
          </label>
          {isEditing ? (
            <Input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth || ''}
              onChange={handleInputChange}
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">
              {user?.date_of_birth ? formatDateWithDay(user.date_of_birth) : 'Not provided'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Gender
          </label>
          {isEditing ? (
            <select
              name="gender"
              value={formData.gender || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          ) : (
            <p className="text-sm text-gray-900 py-1">{formatGender(user?.gender)}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PersonalInformation;
