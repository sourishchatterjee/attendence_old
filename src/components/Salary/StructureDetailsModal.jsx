import React from 'react';

const StructureDetailsModal = ({ structure, onClose, onRefresh }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getComponentTypeColor = (type) => {
    const colors = {
      'Earning': 'bg-green-100 text-green-800 border-green-200',
      'Deduction': 'bg-red-100 text-red-800 border-red-200',
      'Allowance': 'bg-blue-100 text-blue-800 border-blue-200',
      'Reimbursement': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const groupedComponents = {
    earnings: structure.components?.filter(c => c.component_type === 'Earning') || [],
    allowances: structure.components?.filter(c => c.component_type === 'Allowance') || [],
    deductions: structure.components?.filter(c => c.component_type === 'Deduction') || [],
    reimbursements: structure.components?.filter(c => c.component_type === 'Reimbursement') || [],
  };

  const totalEarnings = groupedComponents.earnings.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalAllowances = groupedComponents.allowances.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalDeductions = groupedComponents.deductions.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalReimbursements = groupedComponents.reimbursements.reduce((sum, c) => sum + (c.amount || 0), 0);

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
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {structure.employee_name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{structure.employee_name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-600">{structure.employee_code}</span>
                  {structure.is_current && (
                    <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs font-semibold">
                      Current Structure
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Annual CTC</p>
                <p className="text-3xl font-bold text-primary-600">{formatCurrency(structure.ctc_annual)}</p>
              </div>
            </div>

            {/* Employee Details */}
            <div className="grid grid-cols-4 gap-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div>
                <p className="text-xs text-blue-600">Designation</p>
                <p className="text-sm font-semibold text-blue-900">{structure.designation_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Department</p>
                <p className="text-sm font-semibold text-blue-900">{structure.department_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Organization</p>
                <p className="text-sm font-semibold text-blue-900">{structure.organization_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Payment Mode</p>
                <p className="text-sm font-semibold text-blue-900">{structure.payment_mode}</p>
              </div>
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Monthly CTC</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(structure.ctc_monthly)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700 mb-1">Gross Salary</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(structure.gross_salary)}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-700 mb-1">Net Salary</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(structure.net_salary)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-orange-700 mb-1">Total Deductions</p>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(totalDeductions)}</p>
            </div>
          </div>

          {/* Effective Period */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 mb-6">
            <h4 className="text-sm font-semibold text-indigo-900 mb-2">Effective Period</h4>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-indigo-700">From: <strong className="text-indigo-900">{formatDate(structure.effective_from)}</strong></span>
              </div>
              {structure.effective_to ? (
                <div className="flex items-center gap-2">
                  <span className="text-indigo-700">To: <strong className="text-indigo-900">{formatDate(structure.effective_to)}</strong></span>
                </div>
              ) : (
                <span className="text-indigo-700">To: <strong className="text-indigo-900">Ongoing</strong></span>
              )}
            </div>
          </div>

          {/* Components Breakdown */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-gray-900">Salary Components Breakdown</h4>

            {/* Earnings */}
            {groupedComponents.earnings.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-green-900">Earnings</h5>
                  <span className="text-lg font-bold text-green-900">{formatCurrency(totalEarnings)}</span>
                </div>
                <div className="space-y-2">
                  {groupedComponents.earnings.map((comp, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{comp.component_name}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">
                          {comp.component_code}
                        </span>
                        {comp.percentage_value && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                            {comp.percentage_value}%
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-green-900">{formatCurrency(comp.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allowances */}
            {groupedComponents.allowances.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-blue-900">Allowances</h5>
                  <span className="text-lg font-bold text-blue-900">{formatCurrency(totalAllowances)}</span>
                </div>
                <div className="space-y-2">
                  {groupedComponents.allowances.map((comp, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{comp.component_name}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">
                          {comp.component_code}
                        </span>
                        {comp.percentage_value && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                            {comp.percentage_value}%
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-blue-900">{formatCurrency(comp.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deductions */}
            {groupedComponents.deductions.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-red-900">Deductions</h5>
                  <span className="text-lg font-bold text-red-900">-{formatCurrency(totalDeductions)}</span>
                </div>
                <div className="space-y-2">
                  {groupedComponents.deductions.map((comp, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{comp.component_name}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">
                          {comp.component_code}
                        </span>
                        {comp.percentage_value && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
                            {comp.percentage_value}%
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-red-900">-{formatCurrency(comp.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reimbursements */}
            {groupedComponents.reimbursements.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-purple-900">Reimbursements</h5>
                  <span className="text-lg font-bold text-purple-900">{formatCurrency(totalReimbursements)}</span>
                </div>
                <div className="space-y-2">
                  {groupedComponents.reimbursements.map((comp, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{comp.component_name}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">
                          {comp.component_code}
                        </span>
                        {comp.percentage_value && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                            {comp.percentage_value}%
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-purple-900">{formatCurrency(comp.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6 border-2 border-primary-200 mt-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Components</p>
                <p className="text-3xl font-bold text-primary-600">{structure.components?.length || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-2">Take Home (Monthly)</p>
                <p className="text-3xl font-bold text-secondary-600">{formatCurrency(structure.net_salary)}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Salary Slip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StructureDetailsModal;
