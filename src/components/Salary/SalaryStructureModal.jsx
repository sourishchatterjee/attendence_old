import React, { useState, useEffect } from 'react';
import { salaryAPI } from '../../services/salaryAPI';

const SalaryStructureModal = ({ employees, components, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    effective_from: '',
    effective_to: '',
    ctc_annual: 0,
    ctc_monthly: 0,
    gross_salary: 0,
    net_salary: 0,
    payment_mode: 'Bank-Transfer',
  });
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [componentSearch, setComponentSearch] = useState('');

  useEffect(() => {
    if (formData.ctc_annual > 0) {
      setFormData(prev => ({
        ...prev,
        ctc_monthly: (prev.ctc_annual / 12).toFixed(2),
      }));
    }
  }, [formData.ctc_annual]);

  useEffect(() => {
    calculateSalaries();
  }, [selectedComponents]);

  const calculateSalaries = () => {
    let totalEarnings = 0;
    let totalDeductions = 0;

    selectedComponents.forEach(comp => {
      const component = components.find(c => c.component_id === comp.component_id);
      if (component) {
        if (component.component_type === 'Earning' || component.component_type === 'Allowance') {
          totalEarnings += parseFloat(comp.amount || 0);
        } else if (component.component_type === 'Deduction') {
          totalDeductions += parseFloat(comp.amount || 0);
        }
      }
    });

    setFormData(prev => ({
      ...prev,
      gross_salary: totalEarnings,
      net_salary: totalEarnings - totalDeductions,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employee_id) {
      newErrors.employee_id = 'Employee is required';
    }
    if (!formData.effective_from) {
      newErrors.effective_from = 'Effective from date is required';
    }
    if (!formData.ctc_annual || formData.ctc_annual <= 0) {
      newErrors.ctc_annual = 'Annual CTC must be greater than 0';
    }
    if (selectedComponents.length === 0) {
      newErrors.components = 'At least one component is required';
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
        effective_from: formData.effective_from,
        effective_to: formData.effective_to || null,
        ctc_annual: parseFloat(formData.ctc_annual),
        ctc_monthly: parseFloat(formData.ctc_monthly),
        gross_salary: parseFloat(formData.gross_salary),
        net_salary: parseFloat(formData.net_salary),
        payment_mode: formData.payment_mode,
        components: selectedComponents.map(comp => ({
          component_id: comp.component_id,
          amount: parseFloat(comp.amount),
          percentage_value: comp.percentage_value ? parseFloat(comp.percentage_value) : null,
          calculation_formula: comp.calculation_formula || null,
        })),
      };

      await salaryAPI.createStructure(submitData);
      alert('✅ Salary structure created successfully');
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to create salary structure'}`);
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

  const addComponent = (component) => {
    if (selectedComponents.find(c => c.component_id === component.component_id)) {
      alert('Component already added');
      return;
    }

    setSelectedComponents([
      ...selectedComponents,
      {
        component_id: component.component_id,
        component_name: component.component_name,
        component_code: component.component_code,
        component_type: component.component_type,
        amount: 0,
        percentage_value: null,
        calculation_formula: null,
      },
    ]);
    setComponentSearch('');
  };

  const removeComponent = (componentId) => {
    setSelectedComponents(selectedComponents.filter(c => c.component_id !== componentId));
  };

  const updateComponentAmount = (componentId, amount) => {
    setSelectedComponents(
      selectedComponents.map(comp =>
        comp.component_id === componentId ? { ...comp, amount: amount } : comp
      )
    );
  };

  const updateComponentPercentage = (componentId, percentage) => {
    setSelectedComponents(
      selectedComponents.map(comp =>
        comp.component_id === componentId ? { ...comp, percentage_value: percentage } : comp
      )
    );
  };

  const filteredComponents = components.filter(comp =>
    (comp.component_name.toLowerCase().includes(componentSearch.toLowerCase()) ||
    comp.component_code.toLowerCase().includes(componentSearch.toLowerCase())) &&
    !selectedComponents.find(sc => sc.component_id === comp.component_id)
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getComponentTypeColor = (type) => {
    const colors = {
      'Earning': 'bg-green-100 text-green-800',
      'Deduction': 'bg-red-100 text-red-800',
      'Allowance': 'bg-blue-100 text-blue-800',
      'Reimbursement': 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
        <div className="relative inline-block w-full max-w-5xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
          <div className="absolute top-4 right-4 z-10">
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
            <h3 className="text-xl font-bold text-secondary-700">Create Salary Structure</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Effective From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="effective_from"
                  value={formData.effective_from}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.effective_from ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                />
                {errors.effective_from && (
                  <p className="text-red-500 text-xs mt-1">{errors.effective_from}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Effective To
                </label>
                <input
                  type="date"
                  name="effective_to"
                  value={formData.effective_to}
                  onChange={handleChange}
                  min={formData.effective_from}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                />
              </div>
            </div>

            {/* CTC & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Annual CTC <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="ctc_annual"
                  value={formData.ctc_annual}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className={`w-full px-3 py-2 border ${
                    errors.ctc_annual ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  placeholder="600000"
                />
                {errors.ctc_annual && (
                  <p className="text-red-500 text-xs mt-1">{errors.ctc_annual}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Payment Mode
                </label>
                <select
                  name="payment_mode"
                  value={formData.payment_mode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                >
                  <option value="Bank-Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
            </div>

            {/* Salary Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-700 mb-1">Monthly CTC</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(formData.ctc_monthly)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-700 mb-1">Gross Salary</p>
                <p className="text-xl font-bold text-green-900">{formatCurrency(formData.gross_salary)}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-purple-700 mb-1">Net Salary</p>
                <p className="text-xl font-bold text-purple-900">{formatCurrency(formData.net_salary)}</p>
              </div>
            </div>

            {/* Component Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Salary Components <span className="text-red-500">*</span>
              </label>
              
              {/* Component Search */}
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search components to add..."
                  value={componentSearch}
                  onChange={(e) => setComponentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Component Suggestions */}
              {componentSearch && filteredComponents.length > 0 && (
                <div className="bg-white border border-gray-300 rounded-lg shadow-lg mb-3 max-h-48 overflow-y-auto">
                  {filteredComponents.map(comp => (
                    <button
                      key={comp.component_id}
                      type="button"
                      onClick={() => addComponent(comp)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition flex items-center justify-between border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{comp.component_name}</p>
                        <p className="text-xs text-gray-500">{comp.component_code}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getComponentTypeColor(comp.component_type)}`}>
                        {comp.component_type}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Components */}
              {errors.components && (
                <p className="text-red-500 text-xs mb-2">{errors.components}</p>
              )}

              {selectedComponents.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-gray-500 text-sm">No components added yet</p>
                  <p className="text-gray-400 text-xs mt-1">Search and add components above</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedComponents.map((comp) => (
                    <div
                      key={comp.component_id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-primary-300 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-gray-900">{comp.component_name}</span>
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-mono">
                              {comp.component_code}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getComponentTypeColor(comp.component_type)}`}>
                              {comp.component_type}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Amount (₹)</label>
                              <input
                                type="number"
                                value={comp.amount}
                                onChange={(e) => updateComponentAmount(comp.component_id, e.target.value)}
                                min="0"
                                step="100"
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Percentage (%)</label>
                              <input
                                type="number"
                                value={comp.percentage_value || ''}
                                onChange={(e) => updateComponentPercentage(comp.component_id, e.target.value)}
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                                placeholder="Optional"
                              />
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeComponent(comp.component_id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                {loading ? 'Creating...' : 'Create Salary Structure'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SalaryStructureModal;
