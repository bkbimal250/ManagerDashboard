import React from 'react';
import { Card, Button, Input } from '../../Components';
import { 
  Search, 
  Filter, 
  Grid, 
  List
} from 'lucide-react';

const EmployeeSearch = ({ 
  searchTerm, 
  setSearchTerm, 
  showFilters, 
  setShowFilters, 
  viewMode, 
  setViewMode 
}) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search employees..."
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
            onClick={() => setViewMode('table')}
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            className="flex items-center"
          >
            <List className="h-4 w-4 mr-1" />
            Table
          </Button>
          <Button
            onClick={() => setViewMode('grid')}
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            className="flex items-center"
          >
            <Grid className="h-4 w-4 mr-1" />
            Grid
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeSearch;
