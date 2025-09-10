import React, { useState } from 'react';
import { 
  FilePlus, 
  Eye, 
  User, 
  Calendar, 
  DollarSign, 
  Building2,
  Mail,
  Send
} from 'lucide-react';
import { Card, Button, Input } from '../';
import { validateFormData, prepareDocumentData } from './utils';
import SearchableEmployeeSelect from './SearchableEmployeeSelect';

const DocumentForm = ({ 
  employees, 
  loading, 
  onGenerate, 
  onPreview,
  message 
}) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    document_type: 'offer_letter',
    position: '',
    start_date: '',
    starting_salary: '',
    previous_salary: '',
    new_salary: '',
    effective_date: '',
    salary_month: '',
    salary_year: '',
    basic_salary: '',
    extra_days_pay: '',
    send_email: true
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateFormData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const documentData = prepareDocumentData(formData);
    await onGenerate(documentData);
    
    // Reset form on success
    setFormData({
      employee_id: '',
      document_type: 'offer_letter',
      position: '',
      start_date: '',
      starting_salary: '',
      previous_salary: '',
      new_salary: '',
      effective_date: '',
      send_email: true
    });
    setErrors({});
  };

  const handlePreview = async () => {
    const validation = validateFormData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const documentData = prepareDocumentData(formData);
    await onPreview(documentData);
  };

  const renderOfferLetterFields = () => (
    <>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="inline w-4 h-4 mr-2" />
            Position *
          </label>
          <Input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            placeholder="e.g., Software Developer"
            className={errors.position ? 'border-red-500' : ''}
          />
          {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            Start Date *
          </label>
          <Input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleInputChange}
            className={errors.start_date ? 'border-red-500' : ''}
          />
          {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline w-4 h-4 mr-2" />
            Starting Salary *
          </label>
          <Input
            type="number"
            name="starting_salary"
            value={formData.starting_salary}
            onChange={handleInputChange}
            placeholder="e.g., 50000"
            className={errors.starting_salary ? 'border-red-500' : ''}
          />
          {errors.starting_salary && <p className="text-red-500 text-sm mt-1">{errors.starting_salary}</p>}
        </div>
      </div>
    </>
  );

  const renderSalaryIncrementFields = () => (
    <>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline w-4 h-4 mr-2" />
            Previous Salary *
          </label>
          <Input
            type="number"
            name="previous_salary"
            value={formData.previous_salary}
            onChange={handleInputChange}
            placeholder="e.g., 60000"
            className={errors.previous_salary ? 'border-red-500' : ''}
          />
          {errors.previous_salary && <p className="text-red-500 text-sm mt-1">{errors.previous_salary}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline w-4 h-4 mr-2" />
            New Salary *
          </label>
          <Input
            type="number"
            name="new_salary"
            value={formData.new_salary}
            onChange={handleInputChange}
            placeholder="e.g., 75000"
            className={errors.new_salary ? 'border-red-500' : ''}
          />
          {errors.new_salary && <p className="text-red-500 text-sm mt-1">{errors.new_salary}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            Effective Date *
          </label>
          <Input
            type="date"
            name="effective_date"
            value={formData.effective_date}
            onChange={handleInputChange}
            className={errors.effective_date ? 'border-red-500' : ''}
          />
          {errors.effective_date && <p className="text-red-500 text-sm mt-1">{errors.effective_date}</p>}
        </div>
      </div>
    </>
  );

  const renderSalarySlipFields = () => (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-2" />
              Salary Month *
            </label>
            <select
              name="salary_month"
              value={formData.salary_month}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.salary_month ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Month</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
            {errors.salary_month && <p className="text-red-500 text-sm mt-1">{errors.salary_month}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-2" />
              Salary Year *
            </label>
            <Input
              type="number"
              name="salary_year"
              value={formData.salary_year}
              onChange={handleInputChange}
              placeholder="e.g., 2024"
              min="2020"
              max="2030"
              className={errors.salary_year ? 'border-red-500' : ''}
            />
            {errors.salary_year && <p className="text-red-500 text-sm mt-1">{errors.salary_year}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline w-4 h-4 mr-2" />
            Basic Salary *
          </label>
          <Input
            type="number"
            name="basic_salary"
            value={formData.basic_salary}
            onChange={handleInputChange}
            placeholder="e.g., 45000"
            className={errors.basic_salary ? 'border-red-500' : ''}
          />
          {errors.basic_salary && <p className="text-red-500 text-sm mt-1">{errors.basic_salary}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline w-4 h-4 mr-2" />
            Extra Days Pay *
          </label>
          <Input
            type="number"
            name="extra_days_pay"
            value={formData.extra_days_pay}
            onChange={handleInputChange}
            placeholder="e.g., 3500"
            className={errors.extra_days_pay ? 'border-red-500' : ''}
          />
          {errors.extra_days_pay && <p className="text-red-500 text-sm mt-1">{errors.extra_days_pay}</p>}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Auto-Calculated Fields:</h4>
          <div className="text-sm text-blue-700">
            <p><strong>Total Salary:</strong> {formData.basic_salary && formData.extra_days_pay ? 
              `₹${(parseFloat(formData.basic_salary || 0) + parseFloat(formData.extra_days_pay || 0)).toLocaleString('en-IN')}` : 
              'Will be calculated automatically'}
            </p>
            <p><strong>Net Salary:</strong> {formData.basic_salary && formData.extra_days_pay ? 
              `₹${(parseFloat(formData.basic_salary || 0) + parseFloat(formData.extra_days_pay || 0)).toLocaleString('en-IN')}` : 
              'Will be calculated automatically'}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <Card className="p-6">
      <div className="flex items-center mb-6">
        <FilePlus className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">Generate Document</h2>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-2" />
            Select Employee *
          </label>
          <SearchableEmployeeSelect
            employees={employees}
            value={formData.employee_id}
            onChange={(employeeId) => handleInputChange({ target: { name: 'employee_id', value: employeeId } })}
            error={errors.employee_id}
            placeholder="Search and select employee..."
          />
        </div>

        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type *
          </label>
          <select
            name="document_type"
            value={formData.document_type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="offer_letter">Offer Letter</option>
            <option value="salary_increment">Salary Increment Letter</option>
            <option value="salary_slip">Salary Slip</option>
          </select>
        </div>

        {/* Dynamic Fields based on Document Type */}
        {formData.document_type === 'offer_letter' && renderOfferLetterFields()}
        {formData.document_type === 'salary_increment' && renderSalaryIncrementFields()}
        {formData.document_type === 'salary_slip' && renderSalarySlipFields()}

        {/* Email Option */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="send_email"
            checked={formData.send_email}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            <Mail className="inline w-4 h-4 mr-1" />
            Send document via email
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            onClick={handlePreview}
            disabled={loading}
            className="flex items-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Generate Document
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DocumentForm;
