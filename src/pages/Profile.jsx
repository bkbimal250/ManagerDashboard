import React, { useState, useEffect } from 'react';
import { 
  Edit, 
  Save, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../Components';
import { 
  PersonalInformation,
  GovernmentID,
  EmploymentInformation,
  EmergencyContact,
  BankDetails,
  PasswordChange,
  ProfileSummary
} from '../Components/ProfileFiles';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        aadhaar_card: user.aadhaar_card || '',
        pan_card: user.pan_card || '',
        employee_id: user.employee_id || '',
        department: user.department || '',
        designation: user.designation || '',
        joining_date: user.joining_date || '',
        salary: user.salary || '',
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || '',
        emergency_contact_relationship: user.emergency_contact_relationship || '',
        account_holder_name: user.account_holder_name || '',
        bank_name: user.bank_name || '',
        account_number: user.account_number || '',
        ifsc_code: user.ifsc_code || '',
        bank_branch_name: user.bank_branch_name || ''
      });
    }
  }, [user]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      await api.updateProfile(formData);
      
      // Update user context with new data
      updateUser({ ...user, ...formData });
      
      showMessage('success', 'Profile updated successfully!');
      setIsEditing(false);
      
    } catch (error) {
      console.error('Profile update failed:', error);
      showMessage('error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      date_of_birth: user.date_of_birth || '',
      gender: user.gender || '',
      employee_id: user.employee_id || '',
      department: user.department || '',
      designation: user.designation || '',
      joining_date: user.joining_date || '',
      salary: user.salary || '',
      emergency_contact_name: user.emergency_contact_name || '',
      emergency_contact_phone: user.emergency_contact_phone || '',
      emergency_contact_relationship: user.emergency_contact_relationship || '',
      account_holder_name: user.account_holder_name || '',
      bank_name: user.bank_name || '',
      account_number: user.account_number || '',
      ifsc_code: user.ifsc_code || '',
      bank_branch_name: user.bank_branch_name || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
          <p className="text-xs text-gray-600">Manage your personal and professional information</p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                size="sm"
                className="flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              className="flex items-center"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {message.text && (
        <div className={`p-3 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : (
            <AlertCircle className="h-4 w-4 mr-2" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Left Sidebar - Profile Summary */}
        <div className="lg:col-span-1">
          <ProfileSummary user={user} />

             {/* Password Change Section */}
      <div className="lg:col-span-1 mt-4">
        <PasswordChange />
      </div>

        </div>

        {/* Main Content - Profile Forms */}
        <div className="lg:col-span-2 space-y-4">
          <PersonalInformation
            user={user}
            formData={formData}
            handleInputChange={handleInputChange}
            isEditing={isEditing}
          />

          <GovernmentID
            formData={formData}
            setFormData={setFormData}
            isEditing={isEditing}
            loading={loading}
          />

          <EmploymentInformation
            user={user}
            formData={formData}
            handleInputChange={handleInputChange}
            isEditing={isEditing}
          />

          <EmergencyContact
            user={user}
            formData={formData}
            handleInputChange={handleInputChange}
            isEditing={isEditing}
          />

          <BankDetails
            user={user}
            formData={formData}
            handleInputChange={handleInputChange}
            isEditing={isEditing}
          />
        </div>
      </div>

   
    </div>
  );
};

export default Profile;
