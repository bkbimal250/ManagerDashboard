import React from 'react';
import { Button } from '../index';
import { X, Download, FileText, User, Calendar, AlertCircle } from 'lucide-react';
import { formatDateWithDay } from '../../utils/dateUtils';

const DocumentViewerModal = ({ document, isOpen, onClose, onDownload }) => {
  if (!isOpen || !document) return null;

  const getDocumentTypeIcon = (type) => {
    switch (type) {
      case 'salary_slip':
        return '💰';
      case 'offer_letter':
        return '📄';
      case 'id_proof':
        return '🆔';
      case 'address_proof':
        return '📍';
      default:
        return '📁';
    }
  };

  const getDocumentTypeLabel = (type) => {
    switch (type) {
      case 'salary_slip':
        return 'Salary Slip';
      case 'offer_letter':
        return 'Offer Letter';
      case 'id_proof':
        return 'ID Proof';
      case 'address_proof':
        return 'Address Proof';
      default:
        return 'Other';
    }
  };

  const getFileExtension = (filename) => {
    if (!filename) return '';
    return filename.split('.').pop().toUpperCase();
  };

  const isImageFile = (filename) => {
    if (!filename) return false;
    const ext = filename.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext);
  };

  const isPdfFile = (filename) => {
    if (!filename) return false;
    const ext = filename.split('.').pop().toLowerCase();
    return ext === 'pdf';
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    // Assuming the file path is relative to the media directory
    return `${import.meta.env.VITE_API_BASE_URL || 'https://company.d0s369.co.in/api'}${filePath}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">{getDocumentTypeIcon(document.document_type)}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{document.title}</h2>
              <p className="text-sm text-gray-500">{getDocumentTypeLabel(document.document_type)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => onDownload(document)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Document Details */}
            <div className="lg:col-span-1 space-y-6">
              {/* Employee Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Employee Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Name:</span>
                    <p className="text-sm font-medium text-gray-900">
                      {document.user?.first_name} {document.user?.last_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Employee ID:</span>
                    <p className="text-sm text-gray-900">
                      {document.user?.employee_id || 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Email:</span>
                    <p className="text-sm text-gray-900">
                      {document.user?.email || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Office:</span>
                    <p className="text-sm text-gray-900">
                      {document.user?.office?.name || 'Not assigned'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Document Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Title:</span>
                    <p className="text-sm font-medium text-gray-900">{document.title}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Type:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getDocumentTypeLabel(document.document_type)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">File Type:</span>
                    <p className="text-sm text-gray-900">
                      {document.file && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {getFileExtension(document.file)}
                        </span>
                      )}
                    </p>
                  </div>
                  {document.description && (
                    <div>
                      <span className="text-xs text-gray-500">Description:</span>
                      <p className="text-sm text-gray-900">{document.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Upload Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Uploaded By:</span>
                    <p className="text-sm font-medium text-gray-900">
                      {document.uploaded_by?.first_name} {document.uploaded_by?.last_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Role:</span>
                    <p className="text-sm text-gray-900 capitalize">
                      {document.uploaded_by?.role || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Upload Date:</span>
                    <p className="text-sm text-gray-900">
                      {formatDateWithDay(document.created_at)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Last Updated:</span>
                    <p className="text-sm text-gray-900">
                      {formatDateWithDay(document.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Preview */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Document Preview</h3>
                
                {document.file ? (
                  <div className="space-y-4">
                    {isImageFile(document.file) ? (
                      <div className="flex justify-center">
                        <img
                          src={getFileUrl(document.file)}
                          alt={document.title}
                          className="max-w-full max-h-96 object-contain rounded border"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div className="hidden flex items-center justify-center h-64 bg-gray-100 rounded border">
                          <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Image preview not available</p>
                          </div>
                        </div>
                      </div>
                    ) : isPdfFile(document.file) ? (
                      <div className="flex items-center justify-center h-64 bg-gray-100 rounded border">
                        <div className="text-center">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 mb-2">PDF Preview</p>
                          <Button
                            onClick={() => onDownload(document)}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download to View
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64 bg-gray-100 rounded border">
                        <div className="text-center">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 mb-2">File Preview Not Available</p>
                          <Button
                            onClick={() => onDownload(document)}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download File
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <Button
                        onClick={() => onDownload(document)}
                        className="flex items-center space-x-2 mx-auto"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Document</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded border">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No file attached to this document</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
