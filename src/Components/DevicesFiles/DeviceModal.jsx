import React from 'react';
import { Card, Button, Input } from '../../Components';
import { Monitor, Save, X } from 'lucide-react';

const DeviceModal = ({ 
  showModal, 
  setShowModal, 
  editingDevice, 
  formData, 
  setFormData, 
  handleSubmit, 
  offices,
  loading 
}) => {
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      device_type: 'essl',
      ip_address: '',
      port: '4370',
      office: '',
      location: '',
      description: '',
      serial_number: '',
      device_id: '',
      firmware_version: '',
      sync_interval: 5
    });
  };

  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {editingDevice ? 'Edit Device' : 'Add New Device'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Device Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="e.g., Main Entrance Device"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device Type
                  </label>
                  <select
                    value={formData.device_type}
                    onChange={(e) => handleInputChange('device_type', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="essl">ESSL</option>
                    <option value="zkteco">ZKTeco</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="IP Address"
                  name="ip_address"
                  value={formData.ip_address}
                  onChange={(e) => handleInputChange('ip_address', e.target.value)}
                  required
                  placeholder="192.168.1.100"
                />
                
                <Input
                  label="Port"
                  name="port"
                  value={formData.port}
                  onChange={(e) => handleInputChange('port', e.target.value)}
                  required
                  placeholder="4370"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Serial Number"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => handleInputChange('serial_number', e.target.value)}
                  placeholder="Device serial number"
                />
                
                <Input
                  label="Device ID"
                  name="device_id"
                  value={formData.device_id}
                  onChange={(e) => handleInputChange('device_id', e.target.value)}
                  placeholder="Device ID from device"
                />
              </div>
            </div>

            {/* Location & Office */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Location & Office
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Office
                  </label>
                  <select
                    value={formData.office}
                    onChange={(e) => handleInputChange('office', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Office</option>
                    {offices && offices.length > 0 ? (
                      offices.map((office) => (
                        <option key={office.id} value={office.id}>
                          {office.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No offices available</option>
                    )}
                  </select>
                </div>
                
                <Input
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Main Entrance, Reception"
                />
              </div>
            </div>

            {/* Device Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Device Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Firmware Version"
                  name="firmware_version"
                  value={formData.firmware_version}
                  onChange={(e) => handleInputChange('firmware_version', e.target.value)}
                  placeholder="e.g., v1.2.3"
                />
                
                <Input
                  label="Sync Interval (minutes)"
                  name="sync_interval"
                  type="number"
                  value={formData.sync_interval}
                  onChange={(e) => handleInputChange('sync_interval', e.target.value)}
                  placeholder="5"
                  min="1"
                  max="60"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Additional Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Optional description about the device"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3 pt-6 border-t">
              <Button 
                type="submit" 
                className="flex-1 flex items-center justify-center"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : (editingDevice ? 'Update Device' : 'Create Device')}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default DeviceModal;
