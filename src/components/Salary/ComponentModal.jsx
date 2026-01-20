import React, { useState, useEffect } from 'react';
import { salaryAPI } from '../../services/salaryAPI';

const ComponentModal = ({ component, organizations, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    organization_id: '',
    component_name: '',
    component_code: '',
    component_type: 'Earning',
    calculation_type: 'Fixed',
    is_taxable: true,
    is_fixed: false,
    display_in_payslip: true,
    sort_order: 1,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (component) {
      setFormData({
        organization_id: component.organization_id || '',
        component_name: component.component_name || '',
        component_code: component.component_code || '',
        component_type: component.component_type || 'Earning',
        calculation_type: component.calculation_type || 'Fixed',
        is_taxable: component.is_taxable ?? true,
        is_fixed: component.is_fixed || false,
        display_in_payslip: component.display_in_payslip ?? true,
        sort_order: component.sort_order || 1,
      });
    }
  }, [component]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }
    if (!formData.component_name.trim()) {
      newErrors.component_name = 'Component name is required';
    }
    if (!formData.component_code.trim()) {
      newErrors.component_code = 'Component code is required';
    }
    if (!formData.sort_order || formData.sort_order < 1) {
      newErrors.sort_order = 'Sort order must be at least 1';
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
        component_name: formData.component_name.trim(),
        component_code: formData.component_code.trim().toUpperCase(),
        component_type: formData.component_type,
        calculation_type: formData.calculation_type,
        is_taxable: formData.is_taxable,
        is_fixed: formData.is_fixed,
        display_in_payslip: formData.display_in_payslip,
        sort_order: parseInt(formData.sort_order, 10),
      };

      if (component) {
        await salaryAPI.updateComponent(component.component_id, submitData);
        alert('✅ Component updated successfully');
      } else {
        await salaryAPI.createComponent(submitData);
        alert('✅ Component created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to save component'}`);
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">
              {component ? 'Edit Salary Component' : 'Add Salary Component'}
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

            {/* Component Name & Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Component Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="component_name"
                  value={formData.component_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.component_name ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  placeholder="Basic Salary"
                />
                {errors.component_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.component_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Component Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="component_code"
                  value={formData.component_code}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.component_code ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm uppercase`}
                  placeholder="BASIC"
                  maxLength="20"
                />
                {errors.component_code && (
                  <p className="text-red-500 text-xs mt-1">{errors.component_code}</p>
                )}
              </div>
            </div>

            {/* Component Type & Calculation Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Component Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="component_type"
                  value={formData.component_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                >
                  <option value="Earning">Earning</option>
                  <option value="Deduction">Deduction</option>
                  <option value="Allowance">Allowance</option>
                  <option value="Reimbursement">Reimbursement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Calculation Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="calculation_type"
                  value={formData.calculation_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Percentage">Percentage</option>
                  <option value="Formula">Formula</option>
                </select>
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Sort Order <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border ${
                  errors.sort_order ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                placeholder="1"
              />
              {errors.sort_order && (
                <p className="text-red-500 text-xs mt-1">{errors.sort_order}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Order in which component appears in payslip</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-2 border-green-200 cursor-pointer hover:border-green-400 transition">
                <input
                  type="checkbox"
                  name="is_taxable"
                  checked={formData.is_taxable}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-green-900">Taxable Component</span>
                  <p className="text-xs text-green-700">This component is subject to tax deduction</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border-2 border-purple-200 cursor-pointer hover:border-purple-400 transition">
                <input
                  type="checkbox"
                  name="is_fixed"
                  checked={formData.is_fixed}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-purple-900">Fixed Component</span>
                  <p className="text-xs text-purple-700">Amount remains constant every month</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-200 cursor-pointer hover:border-blue-400 transition">
                <input
                  type="checkbox"
                  name="display_in_payslip"
                  checked={formData.display_in_payslip}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-blue-900">Display in Payslip</span>
                  <p className="text-xs text-blue-700">Show this component in employee payslip</p>
                </div>
              </label>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-yellow-800">
                  <p className="font-semibold">Component Guidelines</p>
                  <p className="mt-0.5">• Use clear, descriptive names for components</p>
                  <p>• Component codes should be unique and uppercase</p>
                  <p>• Sort order determines display sequence in payslip</p>
                </div>
              </div>
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
                {loading ? 'Saving...' : component ? 'Update Component' : 'Create Component'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComponentModal;
