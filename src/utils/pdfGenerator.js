/**
 * PDF Generation Utilities
 * Fallback PDF generation when WeasyPrint is not available
 */

/**
 * Generate PDF using browser's print functionality
 * This is a fallback when WeasyPrint is not available on the server
 */
export const generatePDFFromHTML = (htmlContent, filename = 'document.pdf') => {
  if (typeof window === 'undefined') {
    throw new Error('Window object not available for PDF generation');
  }
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups for this site.');
  }
  
  // Write the HTML content to the new window
  if (printWindow.document && printWindow.document.write) {
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
  } else {
    throw new Error('Print window document.write not available');
  }
  
  if (printWindow.document) {
    printWindow.document.close();
  }
  
  // Auto-trigger print dialog after content loads
  if (printWindow.onload !== undefined) {
    printWindow.onload = () => {
      setTimeout(() => {
        if (printWindow.print) {
          printWindow.print();
        }
      }, 500);
    };
  }
  
  return printWindow;
};

/**
 * Download HTML content as a file
 * Alternative when PDF generation is not available
 */
export const downloadHTML = (htmlContent, filename = 'document.html') => {
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof document.createElement === 'function') {
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
  } else {
    console.error('DOM check failed for HTML download:', {
      window: typeof window,
      document: typeof document,
      createElement: typeof document?.createElement
    });
    throw new Error('DOM not available for HTML download');
  }
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
    
    // Only fallback to HTML if we actually received HTML content type
    if (contentType.includes('text/html') && !contentType.includes('application/pdf')) {
      // Fallback: Generate PDF from HTML using browser
      generatePDFFromHTML(document.content, filename.replace('.pdf', ''));
      return {
        success: true,
        message: 'Document opened for printing (PDF generation not available on server)',
        type: 'print'
      };
    }
    
    // Download the PDF - Try multiple methods
    try {
      // Method 1: Standard DOM approach
      if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof document.createElement === 'function') {
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
      } 
      // Method 2: Direct URL approach
      else if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Cleanup after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      }
      // Method 3: Fallback - direct window.open with blob
      else if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
        const url = window.URL.createObjectURL(blob);
        
        // Try to open in new window/tab
        const newWindow = window.open();
        if (newWindow) {
          newWindow.location.href = url;
          // Cleanup after a delay
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 1000);
        } else {
          throw new Error('Unable to open new window for download');
        }
      } else {
        throw new Error('No download method available');
      }
    } catch (error) {
      console.error('Download methods failed:', error);
      console.error('DOM check failed:', {
        window: typeof window,
        document: typeof document,
        createElement: typeof document?.createElement,
        URL: typeof window?.URL,
        createObjectURL: typeof window?.URL?.createObjectURL
      });
      throw new Error('All download methods failed');
    }
    
    return {
      success: true,
      message: 'Document downloaded successfully!',
      type: 'download'
    };
    
  } catch (error) {
    console.error('Download failed:', error);
    
    return {
      success: false,
      message: 'Failed to download document. Please try again.',
      type: 'error'
    };
  }
};
