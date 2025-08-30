import React, { useState, useEffect } from 'react';
import { Button } from '../Components';
import { 
  Monitor, 
  Plus, 
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { 
  DeviceGrid, 
  DeviceModal, 
  DeviceStats 
} from '../Components/DevicesFiles';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Devices = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [devicesData, officesData] = await Promise.all([
        api.getManagerDevices(),
        api.getOffices().catch(err => {
          console.warn('Failed to fetch offices:', err);
          return { results: [] }; // Return empty array if offices fetch fails
        })
      ]);
      setDevices(devicesData.results || devicesData);
      setOffices(officesData.results || officesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingDevice) {
        await api.updateDevice(editingDevice.id, formData);
      } else {
        await api.createDevice(formData);
      }
      setShowModal(false);
      setEditingDevice(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save device:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (device) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      device_type: device.device_type,
      ip_address: device.ip_address,
      port: device.port || '4370',
      office: device.office?.id || '',
      location: device.location || '',
      description: device.description || '',
      serial_number: device.serial_number || '',
      device_id: device.device_id || '',
      firmware_version: device.firmware_version || '',
      sync_interval: device.sync_interval || 5
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        setLoading(true);
        await api.deleteDevice(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete device:', error);
      } finally {
        setLoading(false);
      }
    }
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

  const openModal = () => {
    setEditingDevice(null);
    resetForm();
    setShowModal(true);
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getDeviceTypeBadge = (type) => {
    const colors = {
      essl: 'bg-blue-100 text-blue-800',
      zkteco: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type]}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.ip_address.includes(searchTerm) ||
                         (device.serial_number && device.serial_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || device.device_type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && device.is_active) ||
                         (filterStatus === 'inactive' && !device.is_active);

    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading && devices.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
          <p className="text-gray-600">
            {user?.role === 'admin' 
              ? `Manage biometric devices for your office: ${user?.office?.name}`
              : `View biometric devices for your office: ${user?.office?.name}`
            }
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {user?.role === 'admin' && (
            <Button onClick={openModal} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <DeviceStats devices={devices} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="essl">ESSL</option>
            <option value="zkteco">ZKTeco</option>
            <option value="other">Other</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Devices Grid */}
      {filteredDevices.length > 0 ? (
        <DeviceGrid
          devices={filteredDevices}
          onEdit={handleEdit}
          onDelete={handleDelete}
          getStatusBadge={getStatusBadge}
          getDeviceTypeBadge={getDeviceTypeBadge}
          user={user}
        />
      ) : (
        <div className="text-center py-12">
          <Monitor className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No devices found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first device'
            }
          </p>
          {!searchTerm && filterType === 'all' && filterStatus === 'all' && user?.role === 'admin' && (
            <div className="mt-6">
              <Button onClick={openModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Device Modal */}
      <DeviceModal
        showModal={showModal}
        setShowModal={setShowModal}
        editingDevice={editingDevice}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        offices={offices}
        loading={loading}
      />
    </div>
  );
};

export default Devices;
