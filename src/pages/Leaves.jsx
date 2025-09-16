import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../Components';
import { 
  Calendar, 
  Search, 
  Filter, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Download,
  Eye,
  Check,
  X,
  Plus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Leaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [activeTab, setActiveTab] = useState('office'); // 'office' or 'my'
  const [applyForm, setApplyForm] = useState({
    leave_type: 'casual',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const [leavesResponse, myLeavesResponse] = await Promise.all([
        api.getLeaves(),
        api.getMyLeaves()
      ]);
      
      // Filter leaves for the manager's office
      const officeLeaves = (leavesResponse.results || leavesResponse).filter(
        leave => leave.user?.office?.id === user?.office?.id
      );
      setLeaves(officeLeaves);
      setMyLeaves(myLeavesResponse.results || myLeavesResponse);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await api.createLeave(applyForm);
      setShowApplyModal(false);
      setApplyForm({
        leave_type: 'casual',
        start_date: '',
        end_date: '',
        reason: ''
      });
      fetchLeaves();
    } catch (error) {
      console.error('Failed to apply leave:', error);
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      await api.approveLeave(leaveId, { status: 'approved' });
      fetchLeaves();
    } catch (error) {
      console.error('Failed to approve leave:', error);
    }
  };

  const handleReject = async (leaveId) => {
    try {
      await api.rejectLeave(leaveId, { status: 'rejected' });
      fetchLeaves();
    } catch (error) {
      console.error('Failed to reject leave:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="h-4 w-4" />,
      approved: <CheckCircle className="h-4 w-4" />,
      rejected: <AlertCircle className="h-4 w-4" />,
      cancelled: <X className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  const getLeaveTypeIcon = (type) => {
    const icons = {
      casual: <Calendar className="h-4 w-4 text-blue-500" />,
      sick: <AlertCircle className="h-4 w-4 text-red-500" />,
      annual: <TrendingUp className="h-4 w-4 text-green-500" />,
      maternity: <User className="h-4 w-4 text-pink-500" />,
      paternity: <User className="h-4 w-4 text-purple-500" />,
      other: <FileText className="h-4 w-4 text-gray-500" />
    };
    return icons[type] || <FileText className="h-4 w-4 text-gray-500" />;
  };

  const getLeaveTypeLabel = (type) => {
    const labels = {
      casual: 'Casual Leave',
      sick: 'Sick Leave',
      annual: 'Annual Leave',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave',
      other: 'Other Leave'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateStats = (leavesList) => {
    const stats = {
      total: leavesList.length,
      pending: leavesList.filter(l => l.status === 'pending').length,
      approved: leavesList.filter(l => l.status === 'approved').length,
      rejected: leavesList.filter(l => l.status === 'rejected').length
    };
    return stats;
  };

  const currentLeaves = activeTab === 'office' ? leaves : myLeaves;
  const stats = calculateStats(currentLeaves);

  const filteredLeaves = currentLeaves.filter(leave => {
    const matchesSearch = 
      leave.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.user?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.leave_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || leave.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Leave Management</h1>
          <p className="text-xs text-gray-600">
            {activeTab === 'office' 
              ? 'Review and manage leave requests from your employees' 
              : 'Manage your own leave requests'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowApplyModal(true)}
            size="sm"
            className="flex items-center space-x-1"
          >
            <Plus className="h-3 w-3" />
            <span>Apply Leave</span>
          </Button>
          <Button
            onClick={fetchLeaves}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-0.5 rounded-md">
        <button
          onClick={() => setActiveTab('office')}
          className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-colors ${
            activeTab === 'office'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Office Leaves ({leaves.length})
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-colors ${
            activeTab === 'my'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Leaves ({myLeaves.length})
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <CalendarDays className="h-4 w-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Total</p>
              <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center">
            <div className="p-1.5 bg-yellow-100 rounded-md">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Pending</p>
              <p className="text-lg font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center">
            <div className="p-1.5 bg-green-100 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Approved</p>
              <p className="text-lg font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center">
            <div className="p-1.5 bg-red-100 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Rejected</p>
              <p className="text-lg font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
            <Input
              type="text"
              placeholder="Search employees or leave types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-sm"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <Button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Leaves Table */}
      <Card className="p-3">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date Range</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="ml-2">
                        <div className="text-xs font-medium text-gray-900">
                          {leave.user?.first_name} {leave.user?.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {leave.user?.employee_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {getLeaveTypeIcon(leave.leave_type)}
                      <span className="ml-1 text-xs text-gray-900">
                        {getLeaveTypeLabel(leave.leave_type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                    {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                    {leave.total_days || 1} days
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(leave.status)}`}>
                      <span className="mr-1">{getStatusIcon(leave.status)}</span>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs font-medium">
                    <div className="flex items-center space-x-1">
                      {activeTab === 'office' && leave.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleApprove(leave.id)}
                            size="sm"
                            className="flex items-center bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(leave.id)}
                            size="sm"
                            variant="outline"
                            className="flex items-center text-red-600 hover:text-red-700 text-xs px-2 py-1"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => {
                          setSelectedLeave(leave);
                          setShowModal(true);
                        }}
                        size="sm"
                        variant="outline"
                        className="flex items-center text-xs px-2 py-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredLeaves.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter ? 'Try adjusting your filters.' : 'No leave requests have been submitted yet.'}
            </p>
          </div>
        )}
      </Card>

      {/* Leave Details Modal */}
      {showModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave Request Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee</label>
                <p className="text-sm text-gray-900">
                  {selectedLeave.user?.first_name} {selectedLeave.user?.last_name} ({selectedLeave.user?.employee_id})
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                <div className="flex items-center mt-1">
                  {getLeaveTypeIcon(selectedLeave.leave_type)}
                  <span className="ml-2 text-sm text-gray-900">
                    {getLeaveTypeLabel(selectedLeave.leave_type)}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date Range</label>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedLeave.start_date)} to {formatDate(selectedLeave.end_date)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Days</label>
                <p className="text-sm text-gray-900">{selectedLeave.total_days || 1} days</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <p className="text-sm text-gray-900">{selectedLeave.reason || 'No reason provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedLeave.status)}`}>
                  <span className="mr-1">{getStatusIcon(selectedLeave.status)}</span>
                  {selectedLeave.status}
                </span>
              </div>
              {activeTab === 'office' && selectedLeave.status === 'pending' && (
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => {
                      handleApprove(selectedLeave.id);
                      setShowModal(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => {
                      handleReject(selectedLeave.id);
                      setShowModal(false);
                    }}
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => {
                  setShowModal(false);
                  setSelectedLeave(null);
                }}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Apply for Leave</h2>
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                <select
                  value={applyForm.leave_type}
                  onChange={(e) => setApplyForm({...applyForm, leave_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                  <option value="other">Other Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={applyForm.start_date}
                  onChange={(e) => setApplyForm({...applyForm, start_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={applyForm.end_date}
                  onChange={(e) => setApplyForm({...applyForm, end_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({...applyForm, reason: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please provide a reason for your leave request..."
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                >
                  Submit Request
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowApplyModal(false);
                    setApplyForm({
                      leave_type: 'casual',
                      start_date: '',
                      end_date: '',
                      reason: ''
                    });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
