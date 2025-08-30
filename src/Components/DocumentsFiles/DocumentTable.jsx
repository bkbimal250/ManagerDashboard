import React, { useState } from 'react';
import { Button, Input } from '../index';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  FileText, 
  Calendar,
  User,
  MoreHorizontal
} from 'lucide-react';
import { formatDateWithDay } from '../../utils/dateUtils';

const DocumentTable = ({ 
  documents, 
  loading, 
  onView, 
  onDownload, 
  onDelete,
  onSearch,
  onFilter 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleTypeFilter = (e) => {
    const value = e.target.value;
    setTypeFilter(value);
    onFilter({ type: value, date: dateFilter });
  };

  const handleDateFilter = (e) => {
    const value = e.target.value;
    setDateFilter(value);
    onFilter({ type: typeFilter, date: value });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setDateFilter('');
    onSearch('');
    onFilter({ type: '', date: '' });
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
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
          
          <div>
            <select
              value={typeFilter}
              onChange={handleTypeFilter}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="salary_slip">Salary Slip</option>
              <option value="offer_letter">Offer Letter</option>
              <option value="id_proof">ID Proof</option>
              <option value="address_proof">Address Proof</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <select
              value={dateFilter}
              onChange={handleDateFilter}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-2">No documents found</h3>
                      <p className="text-sm text-gray-500">
                        {searchTerm || typeFilter || dateFilter 
                          ? 'Try adjusting your filters.' 
                          : 'No documents have been uploaded yet.'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <span className="text-lg">{getDocumentTypeIcon(document.document_type)}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {document.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {document.file && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {getFileExtension(document.file)}
                              </span>
                            )}
                          </div>
                          {document.description && (
                            <div className="text-xs text-gray-400 truncate max-w-xs">
                              {document.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {document.user?.first_name && document.user?.last_name 
                              ? `${document.user.first_name} ${document.user.last_name}`
                              : document.user?.first_name || document.user?.last_name || 'Unknown User'
                            }
                          </div>
                          <div className="text-sm text-gray-500">
                            {document.user?.employee_id || 'Employee ID: Not assigned'}
                          </div>
                          {document.user?.department && (
                            <div className="text-xs text-gray-400">
                              {document.user.department}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getDocumentTypeLabel(document.document_type)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {document.uploaded_by?.first_name && document.uploaded_by?.last_name 
                          ? `${document.uploaded_by.first_name} ${document.uploaded_by.last_name}`
                          : document.uploaded_by?.first_name || document.uploaded_by?.last_name || 'System'
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        {document.uploaded_by?.role ? 
                          document.uploaded_by.role.charAt(0).toUpperCase() + document.uploaded_by.role.slice(1)
                          : 'Unknown Role'
                        }
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {document.created_at ? 
                          formatDateWithDay(document.created_at) 
                          : 'Date not available'
                        }
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onView(document)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDownload(document)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(document)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {documents.length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Total documents: {documents.length}</span>
            <div className="flex space-x-4">
              <span>Salary Slips: {documents.filter(d => d.document_type === 'salary_slip').length}</span>
              <span>Other: {documents.filter(d => d.document_type !== 'salary_slip').length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTable;
