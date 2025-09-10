import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ResignationStats, 
  ResignationFilters, 
  ResignationTable, 
  ResignationDetails,
  ResignationApprovalModal,
  ResignationRejectionModal
} from '../Components/ResignationsFiles';
import { managerApi } from '../services/managerApi';
import LoadingSpinner from '../Components/LoadingSpinner';

const Resignations = () => {
  const { user } = useAuth();
  const [resignations, setResignations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedResignation, setSelectedResignation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateRange: ''
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    loadResignations();
    loadStats();
  }, [filters, pagination.page, pagination.pageSize]);

  const loadResignations = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        page_size: pagination.pageSize,
        ...filters
      };
      
      console.log('🔄 Loading resignations with params:', params);
      console.log('🔍 Current user:', user);
      console.log('🔍 Auth token exists:', !!localStorage.getItem('access_token'));
      
      const response = await managerApi.getResignations(params);
      console.log('📊 Resignations API response:', response);
      console.log('📊 Response type:', typeof response);
      console.log('📊 Response data:', response);
      
      // Handle different response formats
      // Note: managerApi.getResignations returns response.data directly, not the full response object
      if (Array.isArray(response)) {
        console.log('📋 Setting resignations (array format):', response);
        setResignations(response);
        setPagination(prev => ({ ...prev, total: response.length }));
      } else if (response && response.results) {
        console.log('📋 Setting resignations (results format):', response.results);
        console.log('📋 Results count:', response.results.length);
        setResignations(response.results);
        setPagination(prev => ({ 
          ...prev, 
          total: response.count || response.results.length 
        }));
      } else {
        console.log('📋 No data found, setting empty array');
        console.log('📋 Response structure:', response);
        setResignations([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error('❌ Error loading resignations:', error);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      setResignations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('📊 Loading resignation stats...');
      const response = await managerApi.getResignationStats();
      console.log('📊 Stats API response:', response);
      console.log('📊 Stats data:', response);
      // Note: managerApi.getResignationStats returns response.data directly
      setStats(response || {});
    } catch (error) {
      console.error('❌ Error loading resignation stats:', error);
      console.error('❌ Stats error details:', error.response?.data);
      console.error('❌ Stats error status:', error.response?.status);
      setStats({});
    }
  };

  const handleApprove = async (resignationId, data = {}) => {
    try {
      setActionLoading(true);
      console.log('🔄 Starting resignation approval for ID:', resignationId);
      await managerApi.approveResignation(resignationId);
      console.log('✅ Resignation approved successfully, refreshing data...');
      await loadResignations();
      await loadStats();
      console.log('✅ Data refreshed successfully');
      setShowApprovalModal(false);
      alert('✅ Resignation approved successfully!');
    } catch (error) {
      console.error('❌ Error approving resignation:', error);
      alert('❌ Failed to approve resignation. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (resignationId, data) => {
    try {
      setActionLoading(true);
      console.log('🔄 Starting resignation rejection for ID:', resignationId);
      await managerApi.rejectResignation(resignationId, data);
      console.log('✅ Resignation rejected successfully, refreshing data...');
      await loadResignations();
      await loadStats();
      console.log('✅ Data refreshed successfully');
      setShowRejectionModal(false);
      alert('✅ Resignation rejected successfully!');
    } catch (error) {
      console.error('❌ Error rejecting resignation:', error);
      alert('❌ Failed to reject resignation. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveClick = (resignation) => {
    setSelectedResignation(resignation);
    setShowApprovalModal(true);
  };

  const handleRejectClick = (resignation) => {
    setSelectedResignation(resignation);
    setShowRejectionModal(true);
  };

  const handleView = (resignation) => {
    setSelectedResignation(resignation);
    setShowDetails(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleSearchChange = (value) => {
    handleFilterChange('search', value);
  };

  const handleClearFilters = () => {
    setFilters({ status: '', search: '', dateRange: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRefresh = () => {
    loadResignations();
    loadStats();
  };

  if (loading && resignations.length === 0) {
    return <LoadingSpinner text="Loading resignation requests..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resignation Management</h1>
          <p className="text-gray-600">Manage employee resignation requests from your office</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              console.log('🔍 Debug Info:');
              console.log('  - Current user:', user);
              console.log('  - Auth token exists:', !!localStorage.getItem('access_token'));
              console.log('  - Current resignations:', resignations);
              console.log('  - Current stats:', stats);
              console.log('  - Loading state:', loading);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Debug
          </button>
        </div>
      </div>

      {/* Stats */}
      <ResignationStats stats={stats} loading={loading} />

      {/* Filters */}
      <ResignationFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClearFilters}
      />

      {/* Table */}
      <ResignationTable
        resignations={resignations}
        loading={loading}
        onView={handleView}
        onApprove={handleApproveClick}
        onReject={handleRejectClick}
        currentUser={user}
      />

      {/* Details Modal */}
      {showDetails && selectedResignation && (
        <ResignationDetails
          resignation={selectedResignation}
          onClose={() => {
            setShowDetails(false);
            setSelectedResignation(null);
          }}
        />
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedResignation && (
        <ResignationApprovalModal
          resignation={selectedResignation}
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedResignation(null);
          }}
          onConfirm={handleApprove}
          loading={actionLoading}
        />
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedResignation && (
        <ResignationRejectionModal
          resignation={selectedResignation}
          isOpen={showRejectionModal}
          onClose={() => {
            setShowRejectionModal(false);
            setSelectedResignation(null);
          }}
          onConfirm={handleReject}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default Resignations;
