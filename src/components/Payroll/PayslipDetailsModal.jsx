import React from 'react';

const PayslipDetailsModal = ({ payslip, onClose, onRefresh }) => {
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
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Paid': 'bg-green-100 text-green-800',
      'On-Hold': 'bg-orange-100 text-orange-800',
      'Failed': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getMonthName = (monthNum) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNum - 1] || 'N/A';
  };

  const handlePrint = () => {
    window.print();
  };

  const earnings = payslip.components?.earnings || [];
  const deductions = payslip.components?.deductions || [];
  
  const totalEarnings = earnings.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-4xl p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
          {/* Non-printable header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 print:hidden">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-secondary-700">Payslip Details</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium"
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Printable Payslip */}
          <div className="p-8 print:p-12">
            {/* Company Header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
              <h1 className="text-3xl font-bold text-primary-600 mb-2">SALARY SLIP</h1>
              <p className="text-lg font-semibold text-gray-700">
                {getMonthName(payslip.payroll_month)} {payslip.payroll_year}
              </p>
            </div>

            {/* Employee Information */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase">Employee Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-900">{payslip.employee_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employee Code:</span>
                    <span className="font-semibold text-gray-900">{payslip.employee_code || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Designation:</span>
                    <span className="font-semibold text-gray-900">{payslip.designation_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-semibold text-gray-900">{payslip.department_name || 'N/A'}</span>
                  </div>
                  {payslip.pan_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">PAN:</span>
                      <span className="font-semibold text-gray-900">{payslip.pan_number}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Mode:</span>
                    <span className="font-semibold text-gray-900">{payslip.payment_mode || 'N/A'}</span>
                  </div>
                  {payslip.bank_account_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account:</span>
                      <span className="font-semibold text-gray-900">{payslip.bank_account_number}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(payslip.payment_status || 'Pending')}`}>
                      {payslip.payment_status || 'Pending'}
                    </span>
                  </div>
                  {payslip.payment_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Date:</span>
                      <span className="font-semibold text-gray-900">{formatDate(payslip.payment_date)}</span>
                    </div>
                  )}
                  {payslip.payment_reference && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-semibold text-gray-900">{payslip.payment_reference}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 uppercase">Attendance Summary</h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-blue-600 text-xs">Total Days</p>
                  <p className="text-xl font-bold text-blue-900">{payslip.total_working_days || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-green-600 text-xs">Present</p>
                  <p className="text-xl font-bold text-green-900">{payslip.present_days || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-red-600 text-xs">Absent</p>
                  <p className="text-xl font-bold text-red-900">{payslip.absent_days || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-purple-600 text-xs">Paid Leaves</p>
                  <p className="text-xl font-bold text-purple-900">{payslip.paid_leaves || 0}</p>
                </div>
              </div>
              {payslip.overtime_hours > 0 && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-blue-600">Overtime Hours</p>
                  <p className="text-lg font-bold text-blue-900">{payslip.overtime_hours}h</p>
                </div>
              )}
            </div>

            {/* Salary Breakdown */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Earnings */}
              <div className="border-2 border-green-200 rounded-lg overflow-hidden">
                <div className="bg-green-100 px-4 py-2 border-b-2 border-green-200">
                  <h3 className="text-sm font-bold text-green-900 uppercase">Earnings</h3>
                </div>
                <div className="p-4">
                  {earnings.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No earnings</p>
                  ) : (
                    <div className="space-y-2">
                      {earnings.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.component_name || 'N/A'}</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="pt-2 mt-2 border-t-2 border-green-200">
                        <div className="flex justify-between text-base font-bold">
                          <span className="text-green-900">Total Earnings</span>
                          <span className="text-green-900">{formatCurrency(totalEarnings)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Deductions */}
              <div className="border-2 border-red-200 rounded-lg overflow-hidden">
                <div className="bg-red-100 px-4 py-2 border-b-2 border-red-200">
                  <h3 className="text-sm font-bold text-red-900 uppercase">Deductions</h3>
                </div>
                <div className="p-4">
                  {deductions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No deductions</p>
                  ) : (
                    <div className="space-y-2">
                      {deductions.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.component_name || 'N/A'}</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="pt-2 mt-2 border-t-2 border-red-200">
                        <div className="flex justify-between text-base font-bold">
                          <span className="text-red-900">Total Deductions</span>
                          <span className="text-red-900">{formatCurrency(totalDeductions)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Net Salary */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-90 mb-1">Net Salary (Take Home)</p>
                  <p className="text-4xl font-bold">{formatCurrency(payslip.net_salary)}</p>
                </div>
                <svg className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Remarks */}
            {payslip.remarks && (
              <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-sm font-semibold text-yellow-900 mb-2">Remarks</h3>
                <p className="text-sm text-yellow-800">{payslip.remarks}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 pt-6 border-t border-gray-300">
              <p>This is a computer-generated payslip and does not require a signature.</p>
              <p className="mt-1">Generated on: {formatDate(payslip.generated_at)}</p>
            </div>
          </div>

          {/* Non-printable footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 print:hidden">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipDetailsModal;
