import React from 'react';
import { Card, Button, Input } from '../../Components';
import { 
  Search, 
  Filter, 
  Calendar,
  Download
} from 'lucide-react';

const AttendanceSearch = ({ 
  searchTerm, 
  setSearchTerm, 
  showFilters, 
  setShowFilters,
  dateRange,
  setDateRange,
  onExport
}) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={onExport}
            variant="outline"
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => setDateRange({startDate: '', endDate: ''})}
                variant="outline"
                size="sm"
              >
                Clear Dates
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AttendanceSearch;
