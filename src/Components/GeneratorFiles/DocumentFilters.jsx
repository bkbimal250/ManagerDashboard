import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../';

const DocumentFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  filterType, 
  setFilterType,
  documentCount 
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter by Type */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="offer_letter">Offer Letters</option>
            <option value="salary_increment">Salary Increments</option>
            <option value="salary_slip">Salary Slips</option>
          </select>
        </div>

        {/* Document Count */}
        <div className="text-sm text-gray-500">
          {documentCount} document{documentCount !== 1 ? 's' : ''} found
        </div>
      </div>
    </div>
  );
};

export default DocumentFilters;
