import React from 'react';
import { X, Download, Mail, FileText } from 'lucide-react';
import { Button } from '../';

const PreviewModal = ({ 
  isOpen, 
  onClose, 
  previewData, 
  onGenerate,
  loading 
}) => {
  if (!isOpen || !previewData) return null;

  const handleGenerate = () => {
    onGenerate(previewData.preview_data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Document Preview
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">{previewData.title}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Employee:</strong> {previewData.employee_name}</p>
              <p><strong>Email:</strong> {previewData.employee_email}</p>
              <p><strong>Type:</strong> {previewData.document_type.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>

          {/* Document Preview */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b">
              <h4 className="font-medium text-gray-700">Document Preview</h4>
            </div>
            <div 
              className="p-6 bg-white"
              dangerouslySetInnerHTML={{ __html: previewData.content }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            Review the document above before generating
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Document
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
