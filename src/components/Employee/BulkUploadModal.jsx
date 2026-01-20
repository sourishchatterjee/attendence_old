import React, { useState, useRef } from 'react';
import { employeeAPI } from '../../services/employeeAPI';

const BulkUploadModal = ({ organizations, sites, onClose, onSuccess, onDownloadTemplate }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [organizationSites, setOrganizationSites] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleOrganizationChange = (orgId) => {
    setSelectedOrganization(orgId);
    setSelectedSite('');
    
    // Filter sites by organization
    if (orgId) {
      const filteredSites = sites.filter(site => 
        site.organization_id === parseInt(orgId, 10)
      );
      setOrganizationSites(filteredSites);
    } else {
      setOrganizationSites([]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
      alert('❌ Please select a valid Excel (.xlsx, .xls) or CSV (.csv) file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    if (!selectedOrganization) {
      alert('❌ Please select an organization');
      return false;
    }
    if (!selectedSite) {
      alert('❌ Please select a site');
      return false;
    }
    if (!selectedFile) {
      alert('❌ Please select a file to upload');
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('organization_id', selectedOrganization);
      formData.append('site_id', selectedSite);

      // Simulate progress (you can implement real progress tracking if your API supports it)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await employeeAPI.bulkUploadEmployees(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Set upload result
      const result = response.data || response;
      setUploadResult(result);

      if (result.errorCount === 0) {
        alert(`✅ Success! ${result.successCount} employees uploaded successfully`);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        alert(`⚠️ Upload completed with errors\nSuccess: ${result.successCount}\nErrors: ${result.errorCount}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(0);
      
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Upload Failed:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to upload file'}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

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
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-accent-blue to-accent-teal flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary-700">Bulk Upload Employees</h3>
              <p className="text-sm text-gray-500">Upload multiple employees using Excel or CSV file</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Upload Instructions</h4>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>Download the template file to see required columns</li>
                    <li>Fill in employee details in the template</li>
                    <li>Save the file as Excel (.xlsx) or CSV (.csv)</li>
                    <li>Upload the completed file</li>
                    <li>Maximum file size: 10MB</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Download Template */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-green-900">Employee Template</h4>
                    <p className="text-xs text-green-700">Excel file with all required columns</p>
                  </div>
                </div>
                <button
                  onClick={onDownloadTemplate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Template
                </button>
              </div>
            </div>

            {/* Organization & Site Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Organization <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedOrganization}
                  onChange={(e) => handleOrganizationChange(e.target.value)}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:opacity-50"
                >
                  <option value="">Select Organization</option>
                  {organizations.map(org => (
                    <option key={org.organization_id} value={org.organization_id}>
                      {org.organization_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Site <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  disabled={!selectedOrganization || uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:opacity-50"
                >
                  <option value="">Select Site</option>
                  {organizationSites.map(site => (
                    <option key={site.site_id} value={site.site_id}>
                      {site.site_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Upload File <span className="text-red-500">*</span>
              </label>
              
              {!selectedFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                    dragActive 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center">
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
                      dragActive ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-8 h-8 ${dragActive ? 'text-primary-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {dragActive ? 'Drop file here' : 'Drag & drop file here'}
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">or</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium disabled:opacity-50"
                    >
                      Browse Files
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                      Supports: Excel (.xlsx, .xls), CSV (.csv) • Max size: 10MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {selectedFile.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                      </p>
                    </div>
                    {!uploading && (
                      <button
                        onClick={handleRemoveFile}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                        title="Remove file"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Uploading...</span>
                  <span className="text-sm font-bold text-blue-900">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Please wait while we process your file...
                </p>
              </div>
            )}

            {/* Upload Result */}
            {uploadResult && (
              <div className={`border-2 rounded-lg p-4 ${
                uploadResult.errorCount === 0 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-orange-200 bg-orange-50'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    uploadResult.errorCount === 0 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-orange-100 text-orange-600'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {uploadResult.errorCount === 0 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-semibold mb-1 ${
                      uploadResult.errorCount === 0 ? 'text-green-900' : 'text-orange-900'
                    }`}>
                      {uploadResult.errorCount === 0 ? 'Upload Successful!' : 'Upload Completed with Errors'}
                    </h4>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600">Total Rows</p>
                        <p className="text-lg font-bold text-gray-900">{uploadResult.totalRows}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-green-700">Success</p>
                        <p className="text-lg font-bold text-green-600">{uploadResult.successCount}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-red-200">
                        <p className="text-xs text-red-700">Errors</p>
                        <p className="text-lg font-bold text-red-600">{uploadResult.errorCount}</p>
                      </div>
                    </div>

                    {/* Error Details */}
                    {uploadResult.errors && uploadResult.errors.length > 0 && (
                      <div className="mt-3 bg-white rounded-lg border border-orange-200 p-3 max-h-40 overflow-y-auto">
                        <h5 className="text-xs font-semibold text-orange-900 mb-2">Error Details:</h5>
                        <div className="space-y-1">
                          {uploadResult.errors.slice(0, 10).map((error, index) => (
                            <div key={index} className="text-xs text-orange-800">
                              <span className="font-semibold">Row {error.row}:</span> {error.error}
                            </div>
                          ))}
                          {uploadResult.errors.length > 10 && (
                            <p className="text-xs text-orange-700 font-medium mt-2">
                              ... and {uploadResult.errors.length - 10} more errors
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Pro Tips
              </h4>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>Ensure all required fields are filled in the template</li>
                <li>Use the exact column names from the template</li>
                <li>Date format should be YYYY-MM-DD</li>
                <li>Employee codes must be unique</li>
                <li>Email addresses must be valid and unique</li>
                <li>Phone numbers should be 10 digits</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadResult ? 'Close' : 'Cancel'}
            </button>
            {!uploadResult && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !selectedOrganization || !selectedSite}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Employees
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
