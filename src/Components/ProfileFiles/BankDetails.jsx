import React from 'react';
import { 
  Banknote, 
  Building,
  Hash
} from 'lucide-react';
import { Card, Input } from '../index';

const BankDetails = ({ user, formData, handleInputChange, isEditing }) => {
  return (
    <Card className="p-4">
      <div className="flex items-center mb-4">
        <Banknote className="h-5 w-5 text-yellow-600 mr-2" />
        <h3 className="text-base font-semibold text-gray-900">Bank Details</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Account Holder Name
          </label>
          {isEditing ? (
            <Input
              type="text"
              name="account_holder_name"
              value={formData.account_holder_name || ''}
              onChange={handleInputChange}
              placeholder="Enter account holder name"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{user?.account_holder_name || 'Not provided'}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <Building className="h-4 w-4 inline mr-1" />
            Bank Name
          </label>
          {isEditing ? (
            <Input
              type="text"
              name="bank_name"
              value={formData.bank_name || ''}
              onChange={handleInputChange}
              placeholder="Enter bank name"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{user?.bank_name || 'Not provided'}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <Hash className="h-4 w-4 inline mr-1" />
            Account Number
          </label>
          {isEditing ? (
            <Input
              type="text"
              name="account_number"
              value={formData.account_number || ''}
              onChange={handleInputChange}
              placeholder="Enter account number"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{user?.account_number || 'Not provided'}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            IFSC Code
          </label>
          {isEditing ? (
            <Input
              type="text"
              name="ifsc_code"
              value={formData.ifsc_code || ''}
              onChange={handleInputChange}
              placeholder="Enter IFSC code"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{user?.ifsc_code || 'Not provided'}</p>
          )}
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Bank Branch Name
          </label>
          {isEditing ? (
            <Input
              type="text"
              name="bank_branch_name"
              value={formData.bank_branch_name || ''}
              onChange={handleInputChange}
              placeholder="Enter bank branch name"
            />
          ) : (
            <p className="text-sm text-gray-900 py-1">{user?.bank_branch_name || 'Not provided'}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BankDetails;
