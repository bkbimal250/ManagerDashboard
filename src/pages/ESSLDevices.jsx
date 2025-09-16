import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../Components';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Users, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Building2,
  Activity,
  UserPlus,
  TestTube,
  Plus,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ESSLDevices = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    port: 4370,
    location: '',
    device_id: '',
    firmware_version: '',
    sync_interval: 5
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await api.getESSLDevices();
      setDevices(response.results || response);
    } catch (error) {
      console.error('Failed to fetch ESSL devices:', error);
      showMessage('error', 'Failed to fetch ESSL devices');
    } finally {
      setLoading(false);
    }
  };

  const testDeviceConnection = async (deviceId) => {
    try {
      const response = await api.testESSLDeviceConnection(deviceId);
      if (response.success) {
        showMessage('success', 'Device connection test successful');
        fetchDevices(); // Refresh device status
      } else {
        showMessage('error', 'Device connection test failed');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      showMessage('error', 'Connection test failed');
    }
  };

  const syncDevice = async (deviceId, startDate, endDate) => {
    try {
      setSyncing(true);
      const response = await api.syncESSLDevice(deviceId, {
        start_date: startDate,
        end_date: endDate
      });
      
      if (response.success) {
        showMessage('success', 'Device synchronized successfully');
        fetchDevices(); // Refresh device data
      } else {
        showMessage('error', response.message || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      showMessage('error', 'Device synchronization failed');
    } finally {
      setSyncing(false);
    }
  };

  const syncAllDevices = async () => {
    try {
      setSyncing(true);
      const response = await api.syncAllESSLDevices();
      
      if (response.success) {
        showMessage('success', `Synced ${response.success_count} out of ${response.total_count} devices`);
        fetchDevices();
      } else {
        showMessage('error', 'Failed to sync devices');
      }
    } catch (error) {
      console.error('Sync all failed:', error);
      showMessage('error', 'Failed to sync all devices');
    } finally {
      setSyncing(false);
    }
  };

  const fetchAllUsersFromDevices = async () => {
    try {
      setSyncing(true);
      const response = await api.getAllUsersFromDevices();
      
      if (response.success) {
        showMessage('success', response.message);
        fetchDevices(); // Refresh device data
      } else {
        showMessage('error', response.message || 'Failed to fetch users from devices');
      }
    } catch (error) {
      console.error('Fetch users failed:', error);
      showMessage('error', 'Failed to fetch users from devices');
    } finally {
      setSyncing(false);
    }
  };

  const exportUsersToCSV = async () => {
    try {
      setSyncing(true);
      const response = await api.exportUsersToCSV({
        output_dir: 'exports',
        force: false
      });
      
      if (response.success) {
        showMessage('success', 'Real users exported to CSV files successfully! Check the exports directory.');
        // Show detailed output in console for debugging
        // console.log('Export output:', response.output);
      } else {
        showMessage('error', response.message || 'Failed to export users to CSV');
      }
    } catch (error) {
      console.error('CSV export failed:', error);
      showMessage('error', 'Failed to export users to CSV');
    } finally {
      setSyncing(false);
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      const deviceData = {
        ...formData,
        device_type: 'essl',
        office: user.office.id
      };
      
      await api.createESSLDevice(deviceData);
      showMessage('success', 'ESSL device added successfully');
      setShowAddModal(false);
      resetForm();
      fetchDevices();
    } catch (error) {
      console.error('Failed to add device:', error);
      showMessage('error', 'Failed to add ESSL device');
    }
  };

  const registerUserOnDevice = async (deviceId, userId) => {
    try {
      const response = await api.registerUserOnESSLDevice(deviceId, { user_id: userId });
      
      if (response.success) {
        showMessage('success', 'User registered on device successfully');
      } else {
        showMessage('error', response.message || 'Failed to register user');
      }
    } catch (error) {
      console.error('User registration failed:', error);
      showMessage('error', 'Failed to register user on device');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      ip_address: '',
      port: 4370,
      location: '',
      device_id: '',
      firmware_version: '',
      sync_interval: 5
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">ESSL Device Management</h1>
          <p className="text-gray-600">Manage biometric devices and attendance synchronization</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={fetchAllUsersFromDevices} 
            disabled={syncing}
            className="flex items-center"
            variant="outline"
          >
            <Users className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Fetching...' : 'Get All Users'}
          </Button>
          <Button 
            onClick={exportUsersToCSV} 
            disabled={syncing}
            className="flex items-center"
            variant="outline"
          >
            <FileText className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Exporting...' : 'Export to CSV'}
          </Button>
          <Button 
            onClick={syncAllDevices} 
            disabled={syncing}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync All Devices'}
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Device Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500 text-white">
              <Wifi className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Online</p>
              <p className="text-2xl font-bold text-gray-900">
                {devices.filter(d => d.device_status === 'online').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-500 text-white">
              <WifiOff className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Offline</p>
              <p className="text-2xl font-bold text-gray-900">
                {devices.filter(d => d.device_status === 'offline').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Registered Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {devices.reduce((total, device) => total + (device.registered_users || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Devices List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">ESSL Devices</h2>
        
        {devices.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No ESSL devices found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first ESSL device.
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowAddModal(true)} className="flex items-center mx-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add ESSL Device
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Sync</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{device.name}</div>
                          <div className="text-sm text-gray-500">{device.ip_address}:{device.port}</div>
                          <div className="text-sm text-gray-500">{device.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(device.device_status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(device.device_status)}`}>
                          {device.device_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {device.last_attendance_sync ? 
                          new Date(device.last_attendance_sync).toLocaleString() : 
                          'Never'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => testDeviceConnection(device.id)}
                          size="sm"
                          variant="outline"
                          className="flex items-center"
                        >
                          <TestTube className="h-3 w-3 mr-1" />
                          Test
                        </Button>
                        <Button
                          onClick={() => syncDevice(device.id, new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0])}
                          size="sm"
                          variant="outline"
                          className="flex items-center"
                          disabled={syncing}
                        >
                          <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                          Sync
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedDevice(device);
                            setShowUserModal(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="flex items-center"
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Users
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Config
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add ESSL Device
            </h2>
            <form onSubmit={handleAddDevice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <Input
                    type="text"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                  <Input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({...formData, port: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device ID</label>
                <Input
                  type="text"
                  value={formData.device_id}
                  onChange={(e) => setFormData({...formData, device_id: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Device
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {showUserModal && selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Manage Users - {selectedDevice.name}
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Device Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">IP Address:</span>
                    <span className="ml-2 font-medium">{selectedDevice.ip_address}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedDevice.device_status)}`}>
                      {selectedDevice.device_status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Sync:</span>
                    <span className="ml-2 font-medium">
                      {selectedDevice.last_attendance_sync ? 
                        new Date(selectedDevice.last_attendance_sync).toLocaleString() : 
                        'Never'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Registered Users:</span>
                    <span className="ml-2 font-medium">{selectedDevice.registered_users || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  onClick={() => testDeviceConnection(selectedDevice.id)}
                  variant="outline"
                  className="flex items-center"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button 
                  onClick={() => syncDevice(selectedDevice.id, new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0])}
                  variant="outline"
                  className="flex items-center"
                  disabled={syncing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  Sync Now
                </Button>
                <Button onClick={() => setShowUserModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ESSLDevices;
