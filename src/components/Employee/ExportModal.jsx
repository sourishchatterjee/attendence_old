import React, { useState } from 'react';
import { employeeAPI } from '../../services/employeeAPI';

const ExportModal = ({ filterOrganization, filterDepartment, onClose }) => {
  const [exportFormat, setExportFormat] = useState('excel');
  const [includeFilters, setIncludeFilters] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedFields, setSelectedFields] = useState({
    basic_info: true,
    contact_info: true,
    address_info: true,
    employment_info: true,
    bank_details: false,
    documents: false,
    emergency_contact: true,
  });

  const fieldGroups = [
    {
      id: 'basic_info',
      name: 'Basic Information',
      description: 'Name, Employee Code, Date of Birth, Gender',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
    {
      id: 'contact_info',
      name: 'Contact Information',
      description: 'Email, Phone, Alternate Phone',
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    },
    {
      id: 'address_info',
      name: 'Address Details',
      description: 'Current & Permanent Address, City, State, Pincode',
      icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
    },
    {
      id: 'employment_info',
      name: 'Employment Details',
      description: 'Designation, Department, Joining Date, Employment Type',
      icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    },
    {
      id: 'bank_details',
      name: 'Bank Details',
      description: 'Bank Name, Account Number, IFSC Code',
      icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    },
    {
      id: 'documents',
      name: 'Identity Documents',
      description: 'Aadhar Number, PAN Number',
      icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2',
    },
    {
      id: 'emergency_contact',
      name: 'Emergency Contact',
      description: 'Emergency Contact Name, Phone, Relation',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
  ];

  const formatOptions = [
    {
      id: 'excel',
      name: 'Excel (XLSX)',
      description: 'Best for data analysis and manipulation',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'bg-green-100 text-green-600 border-green-200',
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Compatible with most applications',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'bg-blue-100 text-blue-600 border-blue-200',
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Formatted document for printing',
      icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      color: 'bg-red-100 text-red-600 border-red-200',
    },
  ];

  const handleFieldToggle = (fieldId) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedFields).every(val => val);
    const newFields = {};
    Object.keys(selectedFields).forEach(key => {
      newFields[key] = !allSelected;
    });
    setSelectedFields(newFields);
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      // Build export parameters
      const params = {
        format: exportFormat,
      };

      // Include current filters if enabled
      if (includeFilters) {
        if (filterOrganization && filterOrganization !== 'all') {
          params.organization_id = parseInt(filterOrganization, 10);
        }
        if (filterDepartment && filterDepartment !== 'all') {
          params.department_id = parseInt(filterDepartment, 10);
        }
      }

      // Add selected fields info (this would be handled by backend)
      // For now, we'll just export with the format
      
      await employeeAPI.exportEmployees(params);
      
      alert('✅ Export completed successfully');
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Export Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to export data'}`);
      }
    } finally {
      setExporting(false);
    }
  };

  const selectedCount = Object.values(selectedFields).filter(val => val).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary-700">Export Employees</h3>
              <p className="text-sm text-gray-500">Choose format and fields to export</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Export Format Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Export Format
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {formatOptions.map((format) => (
                  <button
                    key={format.id}
                    type="button"
                    onClick={() => setExportFormat(format.id)}
                    className={`p-4 border-2 rounded-lg transition text-left ${
                      exportFormat === format.id
                        ? `${format.color} border-current`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        exportFormat === format.id ? format.color : 'bg-gray-100 text-gray-400'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={format.icon} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${
                            exportFormat === format.id ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {format.name}
                          </span>
                          {exportFormat === format.id && (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {format.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Options */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="includeFilters"
                  checked={includeFilters}
                  onChange={(e) => setIncludeFilters(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <label htmlFor="includeFilters" className="text-sm font-semibold text-blue-900 cursor-pointer">
                    Apply Current Filters
                  </label>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Export only employees matching your current filter criteria
                    {(filterOrganization !== 'all' || filterDepartment !== 'all') && (
                      <span className="block mt-1 font-medium">
                        Active filters will be applied
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Field Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Select Fields to Export
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  {Object.values(selectedFields).every(val => val) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto px-1">
                {fieldGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => handleFieldToggle(group.id)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition ${
                      selectedFields[group.id]
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedFields[group.id]}
                        onChange={() => {}}
                        className="mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-500 pointer-events-none"
                      />
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        selectedFields[group.id] ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={group.icon} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-semibold ${
                          selectedFields[group.id] ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {group.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {group.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Export Summary</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {selectedCount} field group{selectedCount !== 1 ? 's' : ''} selected • {exportFormat.toUpperCase()} format
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600">{selectedCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning for sensitive data */}
            {(selectedFields.bank_details || selectedFields.documents) && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-orange-900">Sensitive Data Warning</h4>
                    <p className="text-xs text-orange-700 mt-1">
                      You are exporting sensitive information (
                      {selectedFields.bank_details && 'Bank Details'}
                      {selectedFields.bank_details && selectedFields.documents && ', '}
                      {selectedFields.documents && 'Identity Documents'}
                      ). Please ensure the exported file is stored securely and shared only with authorized personnel.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || selectedCount === 0}
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Data
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              The export will start downloading automatically when ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
