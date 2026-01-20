import React, { useState } from 'react';
import { attendanceAPI } from '../../services/attendanceAPI';

const ExportAttendanceModal = ({ employees, onClose }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    from_date: '',
    to_date: '',
    format: 'excel',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.from_date) {
      newErrors.from_date = 'From date is required';
    }
    if (!formData.to_date) {
      newErrors.to_date = 'To date is required';
    }
    if (formData.from_date && formData.to_date && new Date(formData.from_date) > new Date(formData.to_date)) {
      newErrors.to_date = 'To date must be after from date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleExport = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const params = {
        from_date: formData.from_date,
        to_date: formData.to_date,
        format: formData.format,
      };

      if (formData.employee_id) {
        params.employee_id = parseInt(formData.employee_id, 10);
      }

      await attendanceAPI.exportAttendance(params);
      alert('✅ Attendance exported successfully');
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert(`❌ ${error.message || 'Failed to export attendance'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
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
        <div className="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
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

          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">Export Attendance</h3>
          </div>

          <form onSubmit={handleExport} className="space-y-5">
            {/* Employee Selection (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Employee (Optional)
              </label>
              <select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to export all employees
              </p>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="from_date"
                  value={formData.from_date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border ${
                    errors.from_date ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                />
                {errors.from_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.from_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  To Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="to_date"
                  value={formData.to_date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border ${
                    errors.to_date ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                />
                {errors.to_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.to_date}</p>
                )}
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                  formData.format === 'excel'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300'
                }`}>
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    checked={formData.format === 'excel'}
                    onChange={handleChange}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <div className="text-center">
                    <svg className="w-6 h-6 mx-auto text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,20H16.5V17H14.5V20H12.5V17H10.5V20H8.5V17H6.5V20H5.5V16H18.5V20M13,9V3.5L18.5,9H13Z"/>
                    </svg>
                    <span className="text-xs font-medium text-gray-900 mt-1">Excel</span>
                  </div>
                </label>

                <label className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                  formData.format === 'csv'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}>
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={formData.format === 'csv'}
                    onChange={handleChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-center">
                    <svg className="w-6 h-6 mx-auto text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2L20,8V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H14M18,20V9H13V4H6V20H18M12,19L8,15H10.5V12H13.5V15H16L12,19Z"/>
                    </svg>
                    <span className="text-xs font-medium text-gray-900 mt-1">CSV</span>
                  </div>
                </label>

                <label className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                  formData.format === 'pdf'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-red-300'
                }`}>
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={formData.format === 'pdf'}
                    onChange={handleChange}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <div className="text-center">
                    <svg className="w-6 h-6 mx-auto text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.5,14.5C15.5,15.61 14.61,16.5 13.5,16.5H11V19H9.5V11H13.5A2,2 0 0,1 15.5,13V14.5M13.5,15C14.05,15 14.5,14.55 14.5,14V13C14.5,12.45 14.05,12 13.5,12H11V15H13.5M13,3.5L18.5,9H13V3.5Z"/>
                    </svg>
                    <span className="text-xs font-medium text-gray-900 mt-1">PDF</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">Export Information:</p>
                  <p>• The file will be downloaded automatically</p>
                  <p className="mt-0.5">• Large date ranges may take longer to process</p>
                  <p className="mt-0.5">• Excel format includes all details and formatting</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Attendance
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExportAttendanceModal;
