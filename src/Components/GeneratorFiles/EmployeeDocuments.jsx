import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Mail } from 'lucide-react';
import api from '../../services/api';
import { Card, Button } from '../';
import DocumentCard from './DocumentCard';
import DocumentFilters from './DocumentFilters';
import PreviewModal from './PreviewModal';
import { filterDocuments } from './utils';

const EmployeeDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadMyDocuments();
  }, []);

  const loadMyDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.getMyDocuments();
      setDocuments(data);
    } catch (error) {
      showMessage('error', 'Failed to load your documents');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleViewDocument = (document) => {
    setPreviewData({
      title: document.title,
      content: document.content,
      employee_name: document.employee_name,
      employee_email: document.employee_email,
      document_type: document.document_type
    });
    setShowPreview(true);
  };

  const handleDownloadDocument = async (doc) => {
    try {
      console.log('Starting download for document:', doc.id);
      
      const response = await api.downloadDocumentPDF(doc.id);
      
      console.log('Download response:', response);
      
      // Handle different response types
      let blob;
      if (response.data instanceof Blob) {
        blob = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        blob = new Blob([response.data], { type: 'application/pdf' });
      } else {
        blob = new Blob([response.data], { 
          type: response.headers['content-type'] || 'application/pdf' 
        });
      }
      
      // Get filename from response headers or use default
      let filename = `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      console.log('Downloading file:', filename);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      showMessage('success', 'Document downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      console.error('Error details:', error.response);
      
      let errorMessage = 'Failed to download document';
      if (error.response?.status === 404) {
        errorMessage = 'Document not found or PDF not generated yet';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to download this document';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error occurred while generating PDF';
      }
      
      showMessage('error', errorMessage);
    }
  };

  const filteredDocuments = filterDocuments(documents, searchTerm, filterType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">My Documents</h2>
          <p className="text-gray-600">View and download your generated documents</p>
        </div>
        <Button
          onClick={loadMyDocuments}
          disabled={loading}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Loading...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-3 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Documents List */}
      <Card className="p-6">
        {loading && documents.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading your documents...</span>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {documents.length === 0 
                ? "You don't have any documents yet. Documents will appear here once they are generated for you."
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <DocumentFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              documentCount={filteredDocuments.length}
            />

            {/* Documents Grid */}
            <div className="grid gap-4">
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onView={handleViewDocument}
                  onDownload={handleDownloadDocument}
                  showActions={false} // Employees can only view and download
                />
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        previewData={previewData}
        onGenerate={null} // Employees can't generate documents
        loading={false}
      />
    </div>
  );
};

export default EmployeeDocuments;
