import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import DocumentCard from './DocumentCard';
import DocumentFilters from './DocumentFilters';
import { filterDocuments } from './utils';

const DocumentList = ({ 
  documents, 
  searchTerm, 
  setSearchTerm, 
  filterType, 
  setFilterType,
  onView, 
  onDownload, 
  onSendEmail, 
  onDelete,
  loading 
}) => {
  const filteredDocuments = filterDocuments(documents, searchTerm, filterType);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <DocumentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        documentCount={filteredDocuments.length}
      />

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {documents.length === 0 
              ? "No documents have been generated yet."
              : "Try adjusting your search or filter criteria."
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onView={onView}
              onDownload={onDownload}
              onSendEmail={onSendEmail}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
