import React, { useState, useEffect } from 'react';
import { FilePlus, Eye, Users } from 'lucide-react';
import api from '../services/api';
import { Card, Button } from '../Components';
import { 
  DocumentForm, 
  DocumentList, 
  DocumentTable,
  PreviewModal 
} from '../Components/GeneratorFiles';
import { downloadDocument } from '../utils/pdfGenerator';

const Generator = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [employees, setEmployees] = useState([]);
  const [generatedDocuments, setGeneratedDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadEmployees();
    loadGeneratedDocuments();
  }, []);

  // Debug: Log employees state changes

  const loadEmployees = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading employees for document generation...');
      console.log('🔄 Timestamp:', new Date().toISOString());
      
      const data = await api.getEmployeesForDocumentGeneration();
      
      // Ensure we have an array
      let employeesArray = Array.isArray(data) ? data : [];
      

      setEmployees(employeesArray);
      console.log('Employees state should now be set');
      
      // Force a re-render check
      setTimeout(() => {

      }, 100);
      
      showMessage('success', `Loaded ${employeesArray.length} employees successfully`);
    } catch (error) {
      console.error('Error loading employees:', error);
      const errorMessage = error.message || 'Failed to load employees';
      showMessage('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const loadGeneratedDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.getGeneratedDocuments();
      setGeneratedDocuments(data.results || data);
    } catch (error) {
      showMessage('error', 'Failed to load generated documents');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleGenerate = async (documentData) => {
    try {
      setLoading(true);
      await api.generateDocument(documentData);
      showMessage('success', 'Document generated successfully!');
      loadGeneratedDocuments();
      setActiveTab('documents');
    } catch (error) {
      console.error('Document generation failed:', error);
      showMessage('error', 'Failed to generate document');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (documentData) => {
    try {
      setLoading(true);
      const preview = await api.previewDocument(documentData);
      setPreviewData(preview);
      setShowPreview(true);
    } catch (error) {
      console.error('Document preview failed:', error);
      showMessage('error', 'Failed to preview document');
    } finally {
      setLoading(false);
    }
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
    
      
      // Use the enhanced download function with fallbacks
      const result = await downloadDocument(doc, api);
      
      if (result.success) {
        showMessage('success', result.message);
      } else {
        showMessage('error', result.message || 'Failed to download document');
      }
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

  const handleSendEmail = async (document) => {
    try {
      await api.sendDocumentEmail(document.id);
      showMessage('success', 'Document sent via email successfully!');
      loadGeneratedDocuments();
    } catch (error) {
      console.error('Email sending failed:', error);
      showMessage('error', 'Failed to send email');
    }
  };

  const handleDeleteDocument = async (document) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.deleteGeneratedDocument(document.id);
      showMessage('success', 'Document deleted successfully!');
      loadGeneratedDocuments();
    } catch (error) {
        console.error('Delete failed:', error);
      showMessage('error', 'Failed to delete document');
    }
    }
  };

  const tabs = [
    { id: 'generate', label: 'Generate Document', icon: FilePlus },
    { id: 'documents', label: 'Generated Documents', icon: Users }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Document Generator</h1>
        <p className="text-gray-600">Generate and manage employee documents</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
          <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
          </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'generate' && (
        <>
        
          <DocumentForm
            employees={employees}
            loading={loading}
            onGenerate={handleGenerate}
            onPreview={handlePreview}
            message={message}
          />
        </>
      )}

      {activeTab === 'documents' && (
        <DocumentTable
          documents={generatedDocuments}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          onView={handleViewDocument}
          onDownload={handleDownloadDocument}
          onSendEmail={handleSendEmail}
          onDelete={handleDeleteDocument}
          loading={loading}
        />
      )}

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        previewData={previewData}
        onGenerate={handleGenerate}
        loading={loading}
      />
    </div>
  );
};

export default Generator;
