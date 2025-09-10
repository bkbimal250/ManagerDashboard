// Utility functions for document generation

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatCurrency = (amount) => {
  if (!amount) return '0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const getDocumentTypeLabel = (type) => {
  const labels = {
    'offer_letter': 'Offer Letter',
    'salary_increment': 'Salary Increment',
    'salary_slip': 'Salary Slip'
  };
  return labels[type] || type.replace('_', ' ').toUpperCase();
};

export const getDocumentTypeIcon = (type) => {
  const icons = {
    'offer_letter': '📄',
    'salary_increment': '💰',
    'salary_slip': '📊'
  };
  return icons[type] || '📄';
};

export const validateFormData = (formData) => {
  const errors = {};
  
  if (!formData.employee_id) {
    errors.employee_id = 'Please select an employee';
  }
  
  if (formData.document_type === 'offer_letter') {
    if (!formData.position) errors.position = 'Position is required';
    if (!formData.start_date) errors.start_date = 'Start date is required';
    if (!formData.starting_salary) errors.starting_salary = 'Starting salary is required';
  } else if (formData.document_type === 'salary_increment') {
    if (!formData.previous_salary) errors.previous_salary = 'Previous salary is required';
    if (!formData.new_salary) errors.new_salary = 'New salary is required';
    if (!formData.effective_date) errors.effective_date = 'Effective date is required';
  } else if (formData.document_type === 'salary_slip') {
    if (!formData.salary_month) errors.salary_month = 'Salary month is required';
    if (!formData.salary_year) errors.salary_year = 'Salary year is required';
    if (!formData.basic_salary) errors.basic_salary = 'Basic salary is required';
    if (!formData.extra_days_pay) errors.extra_days_pay = 'Extra days pay is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const prepareDocumentData = (formData) => {
  const documentData = {
    employee_id: formData.employee_id,
    document_type: formData.document_type,
    send_email: formData.send_email
  };

  if (formData.document_type === 'offer_letter') {
    documentData.position = formData.position;
    documentData.start_date = formData.start_date;
    documentData.starting_salary = parseFloat(formData.starting_salary);
  } else if (formData.document_type === 'salary_increment') {
    documentData.previous_salary = parseFloat(formData.previous_salary);
    documentData.new_salary = parseFloat(formData.new_salary);
    documentData.effective_date = formData.effective_date;
  } else if (formData.document_type === 'salary_slip') {
    documentData.salary_month = formData.salary_month;
    documentData.salary_year = formData.salary_year;
    documentData.basic_salary = parseFloat(formData.basic_salary);
    documentData.extra_days_pay = parseFloat(formData.extra_days_pay);
  }

  return documentData;
};

export const filterDocuments = (documents, searchTerm, filterType) => {
  let filtered = documents;

  // Filter by type
  if (filterType !== 'all') {
    filtered = filtered.filter(doc => doc.document_type === filterType);
  }

  // Filter by search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(doc => 
      doc.title.toLowerCase().includes(term) ||
      doc.employee_name.toLowerCase().includes(term) ||
      doc.document_type.toLowerCase().includes(term)
    );
  }

  return filtered;
};
