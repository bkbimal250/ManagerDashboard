/**
 * PDF Generation Utilities
 * Fallback PDF generation when WeasyPrint is not available
 */

/**
 * Generate PDF using browser's print functionality
 * This is a fallback when WeasyPrint is not available on the server
 */
export const generatePDFFromHTML = (htmlContent, filename = 'document.pdf') => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups for this site.');
  }
  
  // Write the HTML content to the new window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${filename}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          line-height: 1.6;
          color: #333;
        }
        h1, h2, h3 {
          color: #2c3e50;
        }
        .header {
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .content {
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
          font-size: 0.9em;
          color: #666;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      ${htmlContent}
      <div class="no-print" style="margin-top: 20px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Print as PDF
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
          Close
        </button>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  
  // Auto-trigger print dialog after content loads
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  
  return printWindow;
};

/**
 * Download HTML content as a file
 * Alternative when PDF generation is not available
 */
export const downloadHTML = (htmlContent, filename = 'document.html') => {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
};

/**
 * Enhanced document download with fallback options
 */
export const downloadDocument = async (document, apiService) => {
  try {
    // Try to download PDF first
    const response = await apiService.downloadDocumentPDF(document.id);
    const contentType = response.headers['content-type'] || 'application/pdf';
    
    let blob;
    if (response.data instanceof Blob) {
      blob = response.data;
    } else if (response.data instanceof ArrayBuffer) {
      blob = new Blob([response.data], { type: contentType });
    } else {
      blob = new Blob([response.data], { type: contentType });
    }
    
    // Get filename from response headers
    let filename = `${document.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
    
    // Check if we got HTML instead of PDF
    if (contentType.includes('html') || blob.size === 0) {
      // Fallback: Generate PDF from HTML using browser
      generatePDFFromHTML(document.content, filename.replace('.pdf', ''));
      return {
        success: true,
        message: 'Document opened for printing (PDF generation not available on server)',
        type: 'print'
      };
    }
    
    // Download the PDF
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
    
    return {
      success: true,
      message: 'Document downloaded successfully!',
      type: 'download'
    };
    
  } catch (error) {
    console.error('Download failed:', error);
    
    // Final fallback: Download as HTML
    const htmlFilename = `${document.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    downloadHTML(document.content, htmlFilename);
    
    return {
      success: true,
      message: 'Document downloaded as HTML (PDF generation not available)',
      type: 'html'
    };
  }
};
