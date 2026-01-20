import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/leaveAPI';

const LeaveApplicationModal = ({ employees, leaveTypes, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type_id: '',
    from_date: '',
    to_date: '',
    total_days: 0,
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    if (formData.from_date && formData.to_date) {
      calculateDays();
    }
  }, [formData.from_date, formData.to_date]);

  useEffect(() => {
    if (formData.employee_id) {
      fetchLeaveBalance();
    }
  }, [formData.employee_id]);

  const fetchLeaveBalance = async () => {
    try {
      setLoadingBalance(true);
      const response = await leaveAPI.getLeaveBalance({
        employee_id: formData.employee_id,
        year: new Date().getFullYear(),
      });
      setLeaveBalance(response.data || []);
    } catch (err) {
      console.error('Error fetching leave balance:', err);
    } finally {
      setLoadingBalance(false);
    }
  };

  const calculateDays = () => {
    const from = new Date(formData.from_date);
    const to = new Date(formData.to_date);
    
    if (from <= to) {
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end date
      setFormData(prev => ({ ...prev, total_days: diffDays }));
    } else {
      setFormData(prev => ({ ...prev, total_days: 0 }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employee_id) {
      newErrors.employee_id = 'Employee is required';
    }
    if (!formData.leave_type_id) {
      newErrors.leave_type_id = 'Leave type is required';
    }
    if (!formData.from_date) {
      newErrors.from_date = 'From date is required';
    }
    if (!formData.to_date) {
      newErrors.to_date = 'To date is required';
    }
    if (formData.from_date && formData.to_date && new Date(formData.from_date) > new Date(formData.to_date)) {
      newErrors.to_date = 'To date must be after from date';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    // Check leave balance
    if (formData.leave_type_id && leaveBalance) {
      const selectedLeave = leaveBalance.find(lb => lb.leave_type_id === parseInt(formData.leave_type_id, 10));
      if (selectedLeave && formData.total_days > selectedLeave.available_leaves) {
        newErrors.leave_type_id = `Insufficient balance. Available: ${selectedLeave.available_leaves} days`;
      }
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
        leave_type_id: parseInt(formData.leave_type_id, 10),
        from_date: formData.from_date,
        to_date: formData.to_date,
        total_days: parseFloat(formData.total_days),
        reason: formData.reason.trim(),
      };

      await leaveAPI.applyLeave(submitData);
      alert('✅ Leave application submitted successfully');
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to apply leave'}`);
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

  const selectedLeaveType = leaveTypes.find(lt => lt.leave_type_id === parseInt(formData.leave_type_id, 10));
  const selectedLeaveBalance = leaveBalance?.find(lb => lb.leave_type_id === parseInt(formData.leave_type_id, 10));

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
            <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">Apply for Leave</h3>
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

            {/* Leave Balance Display */}
            {formData.employee_id && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Leave Balance</h4>
                {loadingBalance ? (
                  <p className="text-sm text-blue-700">Loading balance...</p>
                ) : leaveBalance && leaveBalance.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {leaveBalance.map(lb => (
                      <div key={lb.leave_type_id} className="bg-white rounded-lg p-2 border border-blue-200">
                        <p className="text-xs text-blue-700 font-medium">{lb.leave_code}</p>
                        <p className="text-lg font-bold text-blue-900">{lb.available_leaves}/{lb.total_allocated}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-blue-700">No leave balance information available</p>
                )}
              </div>
            )}

            {/* Leave Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                name="leave_type_id"
                value={formData.leave_type_id}
                onChange={handleChange}
                disabled={!formData.employee_id}
                className={`w-full px-3 py-2 border ${
                  errors.leave_type_id ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:opacity-50`}
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map(type => (
                  <option key={type.leave_type_id} value={type.leave_type_id}>
                    {type.leave_type_name} ({type.leave_code}) - {type.total_days_per_year} days/year
                  </option>
                ))}
              </select>
              {errors.leave_type_id && (
                <p className="text-red-500 text-xs mt-1">{errors.leave_type_id}</p>
              )}
              {selectedLeaveBalance && (
                <p className="text-xs text-gray-600 mt-1">
                  Available: {selectedLeaveBalance.available_leaves} days
                </p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="from_date"
                  value={formData.from_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
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
                  min={formData.from_date || new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border ${
                    errors.to_date ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                />
                {errors.to_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.to_date}</p>
                )}
              </div>
            </div>

            {/* Total Days Display */}
            {formData.total_days > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-900">Total Leave Days:</span>
                  <span className="text-2xl font-bold text-purple-900">{formData.total_days}</span>
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="4"
                className={`w-full px-3 py-2 border ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none text-sm`}
                placeholder="Please provide a reason for your leave application..."
              />
              {errors.reason && (
                <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
              )}
            </div>

            {/* Info Box */}
            {selectedLeaveType?.requires_approval && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-yellow-800">
                    <p className="font-semibold">Approval Required</p>
                    <p className="mt-0.5">This leave type requires manager approval. You will be notified once your application is reviewed.</p>
                  </div>
                </div>
              </div>
            )}

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
                disabled={loading || formData.total_days === 0}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium disabled:opacity-50 text-sm"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplicationModal;
