import React, { useState } from 'react';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, Button, Input } from '../index';
import api from '../../services/api';

const PasswordField = ({ label, name, value, show, onChange, toggle }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={label}
        required
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </div>
);

const PasswordChange = () => {
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [data, setData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleChange = e => setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const toggle = field => setShow(prev => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (data.new_password !== data.confirm_password) return setMsg({ type: 'error', text: 'Passwords do not match' });
    if (data.new_password.length < 8) return setMsg({ type: 'error', text: 'Password must be at least 8 characters' });

    try {
      setLoading(true);
      setMsg({ type: '', text: '' });
      await api.changePassword({ current_password: data.current_password, new_password: data.new_password });
      setMsg({ type: 'success', text: 'Password changed successfully!' });
      setData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 border-l-4 border-blue-500">
      <div className="flex items-center mb-4">
        <Key className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
      </div>

      {msg.text && (
        <div className={`mb-4 p-3 rounded-lg flex items-center ${
          msg.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {msg.type === 'success' ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
          <span className="text-sm">{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordField
          label="Current Password"
          name="current_password"
          value={data.current_password}
          show={show.current}
          onChange={handleChange}
          toggle={() => toggle('current')}
        />
        <PasswordField
          label="New Password"
          name="new_password"
          value={data.new_password}
          show={show.new}
          onChange={handleChange}
          toggle={() => toggle('new')}
        />
        <PasswordField
          label="Confirm New Password"
          name="confirm_password"
          value={data.confirm_password}
          show={show.confirm}
          onChange={handleChange}
          toggle={() => toggle('confirm')}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} size="sm">
            {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PasswordChange;
