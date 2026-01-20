import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/leaveAPI';

const LeaveTypeModal = ({ leaveType, organizations, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    organization_id: '',
    leave_type_name: '',
    leave_code: '',
    total_days_per_year: 12,
    is_paid: true,
    is_carry_forward: false,
    max_carry_forward_days: 0,
    requires_approval: true,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (leaveType) {
      setFormData({
        organization_id: leaveType.organization_id || '',
        leave_type_name: leaveType.leave_type_name || '',
        leave_code: leaveType.leave_code || '',
        total_days_per_year: leaveType.total_days_per_year || 12,
        is_paid: leaveType.is_paid ?? true,
        is_carry_forward: leaveType.is_carry_forward || false,
        max_carry_forward_days: leaveType.max_carry_forward_days || 0,
        requires_approval: leaveType.requires_approval ?? true,
        description: leaveType.description || '',
      });
    }
  }, [leaveType]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }
    if (!formData.leave_type_name.trim()) {
      newErrors.leave_type_name = 'Leave type name is required';
    }
    if (!formData.leave_code.trim()) {
      newErrors.leave_code = 'Leave code is required';
    }
    if (!formData.total_days_per_year || formData.total_days_per_year <= 0) {
      newErrors.total_days_per_year = 'Total days must be greater than 0';
    }
    if (formData.is_carry_forward && formData.max_carry_forward_days < 0) {
      newErrors.max_carry_forward_days = 'Carry forward days cannot be negative';
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
        organization_id: parseInt(formData.organization_id, 10),
        leave_type_name: formData.leave_type_name.trim(),
        leave_code: formData.leave_code.trim().toUpperCase(),
        total_days_per_year: parseFloat(formData.total_days_per_year),
        is_paid: formData.is_paid,
        is_carry_forward: formData.is_carry_forward,
        max_carry_forward_days: formData.is_carry_forward ? parseInt(formData.max_carry_forward_days, 10) : 0,
        requires_approval: formData.requires_approval,
        description: formData.description.trim() || null,
      };

      if (leaveType) {
        await leaveAPI.updateLeaveType(leaveType.leave_type_id, submitData);
        alert('✅ Leave type updated successfully');
      } else {
        await leaveAPI.createLeaveType(submitData);
        alert('✅ Leave type created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to save leave type'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
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
            <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">
              {leaveType ? 'Edit Leave Type' : 'Add New Leave Type'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Organization <span className="text-red-500">*</span>
              </label>
              <select
                name="organization_id"
                value={formData.organization_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.organization_id ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
              >
                <option value="">Select Organization</option>
                {organizations.map(org => (
                  <option key={org.organization_id} value={org.organization_id}>
                    {org.organization_name}
                  </option>
                ))}
              </select>
              {errors.organization_id && (
                <p className="text-red-500 text-xs mt-1">{errors.organization_id}</p>
              )}
            </div>

            {/* Leave Type Name & Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Leave Type Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="leave_type_name"
                  value={formData.leave_type_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.leave_type_name ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  placeholder="Casual Leave"
                />
                {errors.leave_type_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.leave_type_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Leave Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="leave_code"
                  value={formData.leave_code}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.leave_code ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm uppercase`}
                  placeholder="CL"
                  maxLength="10"
                />
                {errors.leave_code && (
                  <p className="text-red-500 text-xs mt-1">{errors.leave_code}</p>
                )}
              </div>
            </div>

            {/* Total Days Per Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Total Days Per Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="total_days_per_year"
                value={formData.total_days_per_year}
                onChange={handleChange}
                min="0"
                step="0.5"
                className={`w-full px-3 py-2 border ${
                  errors.total_days_per_year ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                placeholder="12"
              />
              {errors.total_days_per_year && (
                <p className="text-red-500 text-xs mt-1">{errors.total_days_per_year}</p>
              )}
            </div>

            {/* Carry Forward */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_carry_forward"
                  checked={formData.is_carry_forward}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-purple-900">Enable Carry Forward</span>
                  <p className="text-xs text-purple-700 mt-0.5">Allow unused leaves to carry forward to next year</p>
                </div>
              </label>

              {formData.is_carry_forward && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-purple-900 mb-1.5">
                    Maximum Carry Forward Days
                  </label>
                  <input
                    type="number"
                    name="max_carry_forward_days"
                    value={formData.max_carry_forward_days}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-3 py-2 border ${
                      errors.max_carry_forward_days ? 'border-red-500' : 'border-purple-300'
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm bg-white`}
                    placeholder="5"
                  />
                  {errors.max_carry_forward_days && (
                    <p className="text-red-500 text-xs mt-1">{errors.max_carry_forward_days}</p>
                  )}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-2 border-green-200 cursor-pointer hover:border-green-400 transition">
                <input
                  type="checkbox"
                  name="is_paid"
                  checked={formData.is_paid}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-green-900">Paid Leave</span>
                  <p className="text-xs text-green-700">Employee gets paid during this leave</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border-2 border-orange-200 cursor-pointer hover:border-orange-400 transition">
                <input
                  type="checkbox"
                  name="requires_approval"
                  checked={formData.requires_approval}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-orange-900">Requires Approval</span>
                  <p className="text-xs text-orange-700">Leave needs manager approval</p>
                </div>
              </label>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none text-sm"
                placeholder="Casual leave for personal work"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium disabled:opacity-50 text-sm"
              >
                {loading ? 'Saving...' : leaveType ? 'Update Leave Type' : 'Create Leave Type'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeaveTypeModal;
