import React, { useState, useEffect } from 'react';
import { Card, Button, Pagination } from '../Components';
import { 
  FileText, 
  Upload,
  Table,
  Grid,
  Download,
  Eye,
  Trash2,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { formatDateWithDay } from '../utils/dateUtils';
import { 
  DocumentUploadModal, 
  DocumentTable, 
  DocumentViewerModal 
} from '../Components/DocumentsFiles';

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, typeFilter, dateFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.getDocuments({
        page: currentPage,
        page_size: itemsPerPage
      });
      
      console.log('Documents API Response:', response); // Debug log
      
      const documentsData = response.results || response;
      console.log('Documents Data:', documentsData); // Debug log
      
      // Debug each document
      if (Array.isArray(documentsData)) {
        documentsData.forEach((doc, index) => {
          console.log(`Document ${index + 1}:`, {
            id: doc.id,
            title: doc.title,
            document_type: doc.document_type,
            user: doc.user,
            uploaded_by: doc.uploaded_by,
            created_at: doc.created_at,
            file: doc.file
          });
        });
      }
      
      setDocuments(documentsData);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.user?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(doc => doc.document_type === typeFilter);
    }

    // Date filter
    if (dateFilter) {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(doc => {
            const docDate = new Date(doc.created_at);
            return docDate >= startOfDay;
          });
          break;
        case 'week':
          const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
          filtered = filtered.filter(doc => {
            const docDate = new Date(doc.created_at);
            return docDate >= startOfWeek;
          });
          break;
        case 'month':
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          filtered = filtered.filter(doc => {
            const docDate = new Date(doc.created_at);
            return docDate >= startOfMonth;
          });
          break;
        case 'year':
          const startOfYear = new Date(today.getFullYear(), 0, 1);
          filtered = filtered.filter(doc => {
            const docDate = new Date(doc.created_at);
            return docDate >= startOfYear;
          });
          break;
        default:
          break;
      }
    }

    setFilteredDocuments(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilter = (filters) => {
    setTypeFilter(filters.type || '');
    setDateFilter(filters.date || '');
  };

  const handleUploadSuccess = () => {
    fetchDocuments();
  };

  const handleView = (document) => {
    setSelectedDocument(document);
    setShowViewerModal(true);
  };

  const handleDownload = async (doc) => {
    try {
      if (doc.file) {
        const response = await fetch(doc.file);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.title || 'document';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download document:', error);
      // Fallback: try to open in new tab
      if (doc.file) {
        window.open(doc.file, '_blank');
      }
    }
  };

  const handleDelete = async (document) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.deleteDocument(document.id);
        fetchDocuments();
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getDocumentTypeIcon = (type) => {
    if (!type) return '📁';
    
    const iconMap = {
      'salary_slip': '💰',
      'offer_letter': '📄',
      'id_proof': '🆔',
      'address_proof': '📍',
      'aadhar_card': '🆔',
      'pan_card': '🆔',
      'voter_id': '🗳️',
      'driving_license': '🚗',
      'passport': '🌍',
      'birth_certificate': '👶',
      'educational_certificate': '🎓',
      'experience_certificate': '💼',
      'medical_certificate': '🏥',
      'bank_statement': '🏦',
      'other': '📁'
    };
    
    return iconMap[type] || '📁';
  };

  const getDocumentTypeLabel = (type) => {
    if (!type) return 'Unknown Type';
    
    const typeMap = {
      'salary_slip': 'Salary Slip',
      'offer_letter': 'Offer Letter',
      'id_proof': 'ID Proof',
      'address_proof': 'Address Proof',
      'aadhar_card': 'Aadhar Card',
      'pan_card': 'PAN Card',
      'voter_id': 'Voter ID',
      'driving_license': 'Driving License',
      'passport': 'Passport',
      'birth_certificate': 'Birth Certificate',
      'educational_certificate': 'Educational Certificate',
      'experience_certificate': 'Experience Certificate',
      'medical_certificate': 'Medical Certificate',
      'bank_statement': 'Bank Statement',
      'other': 'Other Document'
    };
    
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getFileExtension = (filename) => {
    if (!filename) return '';
    return filename.split('.').pop().toUpperCase();
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
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage and upload documents for your office employees</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Document</span>
          </Button>
          <Button
            onClick={fetchDocuments}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Documents</p>
              <p className="text-lg font-semibold text-gray-900">{documents.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-lg">💰</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Salary Slips</p>
              <p className="text-lg font-semibold text-gray-900">
                {documents.filter(d => d.document_type === 'salary_slip').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <span className="text-lg">📄</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Other Documents</p>
              <p className="text-lg font-semibold text-gray-900">
                {documents.filter(d => d.document_type !== 'salary_slip').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <span className="text-lg">📅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-lg font-semibold text-gray-900">
                {documents.filter(d => {
                  const docDate = new Date(d.created_at);
                  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                  return docDate >= startOfMonth;
                }).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              onClick={() => setViewMode('table')}
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Table className="h-4 w-4" />
              <span>Table</span>
            </Button>
            <Button
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="flex items-center space-x-2"
            >
                             <Grid className="h-4 w-4" />
              <span>Grid</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <DocumentTable
          documents={filteredDocuments}
          loading={loading}
          onView={handleView}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onSearch={handleSearch}
          onFilter={handleFilter}
        />
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl">{getDocumentTypeIcon(document.document_type)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleView(document)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(document)}
                    className="text-green-600 hover:text-green-900"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(document)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {document.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {document.user?.first_name} {document.user?.last_name}
                </p>
                <p className="text-sm text-gray-500">
                  ID: {document.user?.employee_id || 'No ID'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getDocumentTypeLabel(document.document_type)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDateWithDay(document.created_at)}
                  </span>
                </div>
                {document.file && (
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {getFileExtension(document.file)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredDocuments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredDocuments.length / itemsPerPage)}
          totalItems={filteredDocuments.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Empty State */}
      {filteredDocuments.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || typeFilter || dateFilter 
              ? 'Try adjusting your filters.' 
              : 'No documents have been uploaded yet.'
            }
          </p>
          <div className="mt-6">
            <Button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 mx-auto"
            >
              <Upload className="h-4 w-4" />
              <span>Upload First Document</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Modals */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />

      <DocumentViewerModal
        document={selectedDocument}
        isOpen={showViewerModal}
        onClose={() => {
          setShowViewerModal(false);
          setSelectedDocument(null);
        }}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default Documents;
