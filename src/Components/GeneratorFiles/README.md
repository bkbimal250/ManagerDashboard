# Document Generator Components

This folder contains all the components related to the document generation system, organized in a modular and reusable way.

## Structure

```
GeneratorFiles/
├── index.js                 # Main export file
├── utils.js                 # Utility functions
├── DocumentForm.jsx         # Document generation form
├── DocumentList.jsx         # List of generated documents
├── DocumentCard.jsx         # Individual document card
├── DocumentFilters.jsx      # Search and filter controls
├── PreviewModal.jsx         # Document preview modal
├── EmployeeDocuments.jsx    # Employee's document view
└── README.md               # This file
```

## Components

### DocumentForm
- Handles document generation form
- Supports offer letters and salary increment letters
- Includes form validation
- Provides preview functionality

### DocumentList
- Displays list of generated documents
- Includes search and filtering
- Handles document actions (view, download, delete)

### DocumentCard
- Individual document display card
- Shows document metadata
- Provides action buttons
- Configurable for different user roles

### DocumentFilters
- Search functionality
- Filter by document type
- Shows document count

### PreviewModal
- Modal for previewing documents before generation
- Shows formatted HTML content
- Allows direct generation from preview

### EmployeeDocuments
- Specialized view for employees to see their own documents
- Read-only access (view and download only)
- Integrated with employee profile

### Utils
- Date formatting functions
- Currency formatting
- Form validation
- Document filtering logic

## Usage

### For Managers/Admins (Document Generation)
```jsx
import { DocumentForm, DocumentList, PreviewModal } from '../Components/GeneratorFiles';

// Use in Generator page
<DocumentForm 
  employees={employees}
  loading={loading}
  onGenerate={handleGenerate}
  onPreview={handlePreview}
  message={message}
/>
```

### For Employees (Document Viewing)
```jsx
import { EmployeeDocuments } from '../Components/GeneratorFiles';

// Use in employee profile
<EmployeeDocuments />
```

## Features

- ✅ Document generation (Offer letters, Salary increments)
- ✅ Document preview before generation
- ✅ PDF generation (when WeasyPrint is available)
- ✅ Email sending
- ✅ Document management (view, download, delete)
- ✅ Search and filtering
- ✅ Role-based access control
- ✅ Responsive design
- ✅ Error handling and loading states

## API Integration

The components integrate with the following API endpoints:

- `POST /api/document-generation/generate_document/` - Generate document
- `POST /api/document-generation/preview_document/` - Preview document
- `GET /api/document-generation/get_employees/` - Get employees list
- `GET /api/document-generation/my_documents/` - Get user's documents
- `GET /api/generated-documents/` - Get all documents (admin/manager)
- `GET /api/generated-documents/{id}/download_pdf/` - Download PDF
- `POST /api/generated-documents/{id}/send_email/` - Send email

## Styling

All components use Tailwind CSS classes and follow the existing design system. They are fully responsive and accessible.
