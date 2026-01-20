import React from 'react';

const PayrollDetailsModal = ({ payroll, onClose, onRefresh }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800 border-gray-300',
      'Processing': 'bg-blue-100 text-blue-800 border-blue-300',
      'Completed': 'bg-green-100 text-green-800 border-green-300',
      'Paid': 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getMonthName = (monthNum) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNum - 1] || 'N/A';
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
        <div className="relative inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {getMonthName(payroll.payroll_month)} {payroll.payroll_year}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{payroll.organization_name || 'N/A'}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(payroll.status || 'Draft')}`}>
                {payroll.status || 'Draft'}
              </span>
            </div>
          </div>

          {/* Period Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Payroll Period</h4>
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold">
                {formatDate(payroll.payroll_period_from)} to {formatDate(payroll.payroll_period_to)}
              </span>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-purple-700">Total Employees</p>
                  <p className="text-3xl font-bold text-purple-900">{payroll.total_employees || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-green-700">Gross Amount</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(payroll.total_gross_amount)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-indigo-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-indigo-700">Net Amount</p>
                  <p className="text-2xl font-bold text-indigo-900">{formatCurrency(payroll.total_net_amount)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {payroll.payment_date && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mb-6">
              <h4 className="text-sm font-semibold text-purple-900 mb-3">Payment Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-purple-700">Payment Date</p>
                  <p className="font-semibold text-purple-900">{formatDate(payroll.payment_date)}</p>
                </div>
                <div>
                  <p className="text-purple-700">Status</p>
                  <p className="font-semibold text-purple-900">{payroll.status}</p>
                </div>
              </div>
            </div>
          )}

          {/* Processing Information */}
          {payroll.processed_by_name && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Processing Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Processed By</p>
                  <p className="font-semibold text-gray-900">{payroll.processed_by_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Processed Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(payroll.processed_date)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payroll Summary */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6 border-2 border-primary-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Payroll Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                <span className="text-sm text-gray-700">Total Gross Salary</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(payroll.total_gross_amount)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                <span className="text-sm text-gray-700">Total Deductions</span>
                <span className="text-lg font-bold text-red-600">
                  -{formatCurrency((payroll.total_gross_amount || 0) - (payroll.total_net_amount || 0))}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-semibold text-gray-900">Net Payable Amount</span>
                <span className="text-2xl font-bold text-primary-600">{formatCurrency(payroll.total_net_amount)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-6 border-t mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailsModal;
