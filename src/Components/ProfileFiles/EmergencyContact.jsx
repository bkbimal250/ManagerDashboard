import React from 'react';
import { 
  Heart, 
  Phone, 
  User
} from 'lucide-react';
import { Card, Input } from '../index';

const EmergencyContact = ({ user, formData, handleInputChange, isEditing }) => {
  return (
    <Card className="p-4">
      <div className="flex items-center mb-4">
        <Heart className="h-5 w-5 text-red-600 mr-2" />
        <h3 className="text-base font-semibold text-gray-900">Emergency Contact</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <User className="h-4 w-4 inline mr-1" />
            Contact Name
          </label>
          {isEditing ? (
            <Input
              type="text"
              name="emergency_contact_name"
              value={formData.emergency_contact_name || ''}
              onChange={handleInputChange}
              placeholder="Enter emergency contact name"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{user?.emergency_contact_name || 'Not provided'}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <Phone className="h-4 w-4 inline mr-1" />
            Contact Phone
          </label>
          {isEditing ? (
            <Input
              type="tel"
              name="emergency_contact_phone"
              value={formData.emergency_contact_phone || ''}
              onChange={handleInputChange}
              placeholder="Enter emergency contact phone"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{user?.emergency_contact_phone || 'Not provided'}</p>
          )}
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Relationship
          </label>
          {isEditing ? (
            <Input
              type="text"
              name="emergency_contact_relationship"
              value={formData.emergency_contact_relationship || ''}
              onChange={handleInputChange}
              placeholder="e.g., Spouse, Parent, Sibling"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{user?.emergency_contact_relationship || 'Not provided'}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EmergencyContact;
