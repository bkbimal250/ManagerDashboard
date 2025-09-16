import React from 'react';
import { CreditCard } from 'lucide-react';

const GovernmentID = ({ formData, setFormData, isEditing, loading }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
          Government ID Information
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aadhaar Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.aadhaar_card || ''}
              onChange={(e) => handleChange('aadhaar_card', e.target.value)}
              disabled={!isEditing || loading}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Enter Aadhaar card number"
              maxLength="12"
            />
            <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PAN Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.pan_card || ''}
              onChange={(e) => handleChange('pan_card', e.target.value)}
              disabled={!isEditing || loading}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Enter PAN card number"
              maxLength="10"
            />
            <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernmentID;
