import React, { useState } from 'react';
import { payrollAPI } from '../../services/payrollAPI';

const CreatePayrollModal = ({ organizations, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    organization_id: '',
    payroll_month: new Date().getMonth() + 1,
    payroll_year: new Date().getFullYear(),
    payroll_period_from: '',
    payroll_period_to: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  // Auto-calculate period dates when month/year changes
  React.useEffect(() => {
    if (formData.payroll_month && formData.payroll_year) {
      const year = parseInt(formData.payroll_year, 10);
      const month = parseInt(formData.payroll_month, 10);
      
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      
      setFormData(prev => ({
        ...prev,
        payroll_period_from: firstDay.toISOString().split('T')[0],
        payroll_period_to: lastDay.toISOString().split('T')[0],
      }));
    }
  }, [formData.payroll_month, formData.payroll_year]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }
    if (!formData.payroll_month) {
      newErrors.payroll_month = 'Month is required';
    }
    if (!formData.payroll_year) {
      newErrors.payroll_year = 'Year is required';
    }
    if (!formData.payroll_period_from) {
      newErrors.payroll_period_from = 'Period from date is required';
    }
    if (!formData.payroll_period_to) {
      newErrors.payroll_period_to = 'Period to date is required';
    }
    if (formData.payroll_period_from && formData.payroll_period_to) {
      if (new Date(formData.payroll_period_from) > new Date(formData.payroll_period_to)) {
        newErrors.payroll_period_to = 'End date must be after start date';
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
        organization_id: parseInt(formData.organization_id, 10),
        payroll_month: parseInt(formData.payroll_month, 10),
        payroll_year: parseInt(formData.payroll_year, 10),
        payroll_period_from: formData.payroll_period_from,
        payroll_period_to: formData.payroll_period_to,
      };

      await payrollAPI.createPayroll(submitData);
      alert('✅ Payroll created successfully');
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to create payroll'}`);
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
            <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">Create New Payroll</h3>
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

            {/* Month & Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Payroll Month <span className="text-red-500">*</span>
                </label>
                <select
                  name="payroll_month"
                  value={formData.payroll_month}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.payroll_month ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.name}</option>
                  ))}
                </select>
                {errors.payroll_month && (
                  <p className="text-red-500 text-xs mt-1">{errors.payroll_month}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Payroll Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="payroll_year"
                  value={formData.payroll_year}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.payroll_year ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.payroll_year && (
                  <p className="text-red-500 text-xs mt-1">{errors.payroll_year}</p>
                )}
              </div>
            </div>

            {/* Period Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Period From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="payroll_period_from"
                  value={formData.payroll_period_from}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.payroll_period_from ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                />
                {errors.payroll_period_from && (
                  <p className="text-red-500 text-xs mt-1">{errors.payroll_period_from}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Period To <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="payroll_period_to"
                  value={formData.payroll_period_to}
                  onChange={handleChange}
                  min={formData.payroll_period_from}
                  className={`w-full px-3 py-2 border ${
                    errors.payroll_period_to ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                />
                {errors.payroll_period_to && (
                  <p className="text-red-500 text-xs mt-1">{errors.payroll_period_to}</p>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-800">
                  <p className="font-semibold">Payroll Creation Guidelines</p>
                  <p className="mt-0.5">• Payroll will be created in Draft status</p>
                  <p>• You can process payroll for employees after creation</p>
                  <p>• Period dates are auto-calculated based on month and year</p>
                  <p>• Ensure all employee salary structures are up to date</p>
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
                {loading ? 'Creating...' : 'Create Payroll'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePayrollModal;
