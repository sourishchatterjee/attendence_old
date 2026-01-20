import React, { useState } from 'react';
import { attendanceAPI } from '../../services/attendanceAPI';

const ManualAttendanceModal = ({ employees, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    attendance_date: new Date().toISOString().split('T')[0],
    checkin_time: '09:00',
    checkout_time: '18:00',
    status: 'Present',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employee_id) {
      newErrors.employee_id = 'Employee is required';
    }
    if (!formData.attendance_date) {
      newErrors.attendance_date = 'Date is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        employee_id: parseInt(formData.employee_id, 10),
        attendance_date: formData.attendance_date,
        checkin_time: formData.checkin_time || null,
        checkout_time: formData.checkout_time || null,
        status: formData.status,
        remarks: formData.remarks.trim() || null,
      };

      await attendanceAPI.markManualAttendance(submitData);
      alert('✅ Manual attendance marked successfully');
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to mark attendance'}`);
      }
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
        <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
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
            <div className="h-10 w-10 rounded-lg bg-secondary-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">Mark Manual Attendance</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.employee_id ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_code})
                  </option>
                ))}
              </select>
              {errors.employee_id && (
                <p className="text-red-500 text-xs mt-1">{errors.employee_id}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Attendance Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="attendance_date"
                value={formData.attendance_date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border ${
                  errors.attendance_date ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
              />
              {errors.attendance_date && (
                <p className="text-red-500 text-xs mt-1">{errors.attendance_date}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Present', 'Absent', 'Half Day', 'On Leave', 'Week Off', 'Holiday'].map(status => (
                  <label
                    key={status}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                      formData.status === status
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={formData.status === status}
                      onChange={handleChange}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-900">{status}</span>
                  </label>
                ))}
              </div>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">{errors.status}</p>
              )}
            </div>

            {/* Time Fields (only for Present/Half Day) */}
            {(formData.status === 'Present' || formData.status === 'Half Day') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Check In Time
                  </label>
                  <input
                    type="time"
                    name="checkin_time"
                    value={formData.checkin_time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Check Out Time
                  </label>
                  <input
                    type="time"
                    name="checkout_time"
                    value={formData.checkout_time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                  />
                </div>
              </div>
            )}

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none text-sm"
                placeholder="Enter any additional notes (e.g., reason for manual entry)"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">Manual Entry Guidelines:</p>
                  <p>• Use this for correcting or backdating attendance</p>
                  <p className="mt-0.5">• Always provide a reason in remarks</p>
                  <p className="mt-0.5">• Time fields are required for Present/Half Day status</p>
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
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium disabled:opacity-50 text-sm"
              >
                {loading ? 'Saving...' : 'Mark Attendance'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManualAttendanceModal;
