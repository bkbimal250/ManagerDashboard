import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '../../Components';

const ReportExport = ({ data, filters, onExport }) => {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  const handleExport = async (format) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    setExporting(true);
    setExportFormat(format);

    try {
      if (format === 'csv') {
        exportToCSV();
      } else if (format === 'pdf') {
        await exportToPDF();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    const headers = getCSVHeaders();
    const csvContent = [
      headers.join(','),
      ...data.map(record => getCSVRow(record, headers))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${filters.start_date}_to_${filters.end_date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    try {
      // Dynamic import for PDF generation
      const { jsPDF } = await import('jspdf');
      const autoTable = await import('jspdf-autotable');

      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Attendance Report', 14, 22);
      
      // Add subtitle
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
      doc.text(`Date Range: ${filters.start_date} to ${filters.end_date}`, 14, 40);
      
      if (filters.office) {
        doc.text(`Office: ${filters.office}`, 14, 48);
      }
      if (filters.user) {
        doc.text(`Employee: ${filters.user}`, 14, 56);
      }

      // Prepare table data
      const headers = getPDFHeaders();
      const tableData = data.map(record => getPDFRow(record, headers));

      // Add table
      autoTable.default(doc, {
        head: [headers],
        body: tableData,
        startY: 70,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 70 },
      });

      // Save PDF
      doc.save(`attendance_report_${filters.start_date}_to_${filters.end_date}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    }
  };

  const getCSVHeaders = () => {
    return [
      'Date',
      'Employee Name',
      'Employee ID',
      'Office',
      'Check In Time',
      'Check Out Time',
      'Status',
      'Total Hours',
      'Notes'
    ];
  };

  const getPDFHeaders = () => {
    return getCSVHeaders();
  };

  const getCSVRow = (record, headers) => {
    const values = headers.map(header => {
      switch (header) {
        case 'Date':
          return formatDate(record.date);
        case 'Employee Name':
          return `"${record.user__first_name || ''} ${record.user__last_name || ''}"`.trim();
        case 'Employee ID':
          return record.user__employee_id || '';
        case 'Office':
          return record.user__office__name || '';
        case 'Check In Time':
          return formatTime(record.check_in_time);
        case 'Check Out Time':
          return formatTime(record.check_out_time);
        case 'Status':
          return record.status || '';
        case 'Total Hours':
          return record.total_hours || '';
        case 'Notes':
          return `"${record.notes || ''}"`;
        default:
          return record[header.toLowerCase().replace(/\s+/g, '_')] || '';
      }
    });

    return values.join(',');
  };

  const getPDFRow = (record, headers) => {
    return headers.map(header => {
      switch (header) {
        case 'Date':
          return formatDate(record.date);
        case 'Employee Name':
          return `${record.user__first_name || ''} ${record.user__last_name || ''}`.trim();
        case 'Employee ID':
          return record.user__employee_id || '';
        case 'Office':
          return record.user__office__name || '';
        case 'Check In Time':
          return formatTime(record.check_in_time);
        case 'Check Out Time':
          return formatTime(record.check_out_time);
        case 'Status':
          return record.status || '';
        case 'Total Hours':
          return record.total_hours || '';
        case 'Notes':
          return record.notes || '';
        default:
          return record[header.toLowerCase().replace(/\s+/g, '_')] || '';
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString;
    }
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      <Button
        onClick={() => handleExport('csv')}
        variant="outline"
        disabled={exporting}
        className="flex items-center space-x-2"
      >
        {exporting && exportFormat === 'csv' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        <span>Export CSV</span>
      </Button>

      <Button
        onClick={() => handleExport('pdf')}
        variant="outline"
        disabled={exporting}
        className="flex items-center space-x-2"
      >
        {exporting && exportFormat === 'pdf' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        <span>Export PDF</span>
      </Button>

      {exporting && (
        <div className="text-sm text-gray-500">
          Exporting {exportFormat.toUpperCase()}...
        </div>
      )}
    </div>
  );
};

export default ReportExport;
