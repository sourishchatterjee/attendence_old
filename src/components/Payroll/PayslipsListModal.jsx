import React, { useState, useEffect } from 'react';
import { payrollAPI } from '../../services/payrollAPI';
import PayslipDetailsModal from './PayslipDetailsModal';
import Pagination from '../Pagination';

const PayslipsListModal = ({ payroll, onClose }) => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchPayslips();
  }, [pagination.page, filterStatus]);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        payroll_id: payroll.payroll_id,
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      
      if (filterStatus !== 'all') {
        params.payment_status = filterStatus;
      }

      const response = await payrollAPI.getAllPayslips(params);
      
      const payslipsData = response.data || response || [];
      setPayslips(Array.isArray(payslipsData) ? payslipsData : []);
      
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
        }));
      }
    } catch (err) {
      console.error('Fetch payslips error:', err);
      setError(err.message || 'Failed to fetch payslips');
      setPayslips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayslip = async (payslip) => {
    try {
      const response = await payrollAPI.getPayslipById(payslip.payslip_id);
      setSelectedPayslip(response.data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Error fetching payslip details:', err);
      alert(`❌ ${err.message || 'Failed to fetch payslip details'}`);
    }
  };

  const handleDownloadPayslip = async (payslipId, employeeName) => {
    try {
      const response = await payrollAPI.downloadPayslip(payslipId);
      
      // Create blob and download
      const blob = new Blob([response.data || response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payslip_${employeeName.replace(/\s+/g, '_')}_${payroll.payroll_month}_${payroll.payroll_year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('✅ Payslip downloaded successfully');
    } catch (err) {
      console.error('Download error:', err);
      alert(`❌ ${err.message || 'Failed to download payslip'}`);
    }
  };

  const handleEmailPayslip = async (payslipId, employeeName) => {
    if (!window.confirm(`Send payslip to ${employeeName} via email?`)) {
      return;
    }

    try {
      const response = await payrollAPI.emailPayslip(payslipId);
      const data = response.data || response;
      alert(`✅ Payslip sent successfully to ${data.email || 'employee email'}`);
    } catch (err) {
      console.error('Email error:', err);
      alert(`❌ ${err.message || 'Failed to send payslip'}`);
    }
  };

  const handleUpdatePayslipStatus = async (payslipId, status, employeeName) => {
    if (!window.confirm(`Update payment status to "${status}" for ${employeeName}?`)) {
      return;
    }

    try {
      const statusData = {
        payment_status: status,
        payment_date: status === 'Paid' ? new Date().toISOString().split('T')[0] : null,
        payment_reference: status === 'Paid' ? `TXN${Date.now()}` : null,
      };
      
      await payrollAPI.updatePayslipStatus(payslipId, statusData);
      alert(`✅ Payment status updated to ${status}`);
      fetchPayslips();
    } catch (err) {
      console.error('Update status error:', err);
      alert(`❌ ${err.message || 'Failed to update status'}`);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Paid': 'bg-green-100 text-green-800 border-green-300',
      'On-Hold': 'bg-orange-100 text-orange-800 border-orange-300',
      'Failed': 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

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
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getMonthName = (monthNum) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNum - 1] || 'N/A';
  };

  const filteredPayslips = payslips.filter(payslip => {
    if (!searchTerm) return true;
    const name = (payslip.employee_name || '').toLowerCase();
    const code = (payslip.employee_code || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || code.includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
          {/* Backdrop */}
          <div
            className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
            onClick={onClose}
          ></div>

          {/* Modal */}
          <div className="relative inline-block w-full max-w-7xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
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

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-secondary-700">Payslips</h3>
                  <p className="text-sm text-gray-500">
                    {getMonthName(payroll.payroll_month)} {payroll.payroll_year} - {payroll.organization_name}
                  </p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-blue-700 mb-1">Total Payslips</p>
                  <p className="text-2xl font-bold text-blue-900">{pagination.totalItems || payslips.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-sm text-green-700 mb-1">Paid</p>
                  <p className="text-2xl font-bold text-green-900">
                    {payslips.filter(p => p.payment_status === 'Paid').length}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-sm text-yellow-700 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {payslips.filter(p => p.payment_status === 'Pending').length}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <p className="text-sm text-purple-700 mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-purple-900">{formatCurrency(payroll.total_net_amount)}</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center mb-4">
              <div className="flex-1 min-w-[250px] relative">
                <input
                  type="text"
                  placeholder="Search by employee name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="On-Hold">On-Hold</option>
                <option value="Failed">Failed</option>
              </select>

              <button
                onClick={fetchPayslips}
                disabled={loading}
                className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading && payslips.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="text-gray-500 ml-3">Loading payslips...</p>
              </div>
            ) : filteredPayslips.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No payslips found</p>
              </div>
            ) : (
              /* Payslips Table */
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Attendance</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Gross</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Deductions</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Net Salary</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPayslips.map((payslip) => (
                        <tr key={payslip.payslip_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{payslip.employee_name || 'N/A'}</p>
                              <p className="text-xs text-gray-500">
                                {payslip.employee_code || 'N/A'} • {payslip.designation_name || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-center">
                              <p className="text-xs text-gray-600">
                                <span className="font-semibold text-green-600">{payslip.present_days || 0}</span>/
                                {payslip.total_working_days || 0}
                              </p>
                              {payslip.absent_days > 0 && (
                                <p className="text-xs text-red-600">Absent: {payslip.absent_days}</p>
                              )}
                              {payslip.overtime_hours > 0 && (
                                <p className="text-xs text-blue-600">OT: {payslip.overtime_hours}h</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm font-semibold text-green-600">
                              {formatCurrency(payslip.gross_salary || 0)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Total: {formatCurrency(payslip.total_earnings || 0)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm font-semibold text-red-600">
                              {formatCurrency(payslip.total_deductions || 0)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="text-base font-bold text-primary-600">
                              {formatCurrency(payslip.net_salary || 0)}
                            </p>
                            {payslip.payment_date && (
                              <p className="text-xs text-gray-500">{formatDate(payslip.payment_date)}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(payslip.payment_status || 'Pending')}`}>
                              {payslip.payment_status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleViewPayslip(payslip)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                                title="View Details"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDownloadPayslip(payslip.payslip_id, payslip.employee_name)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                                title="Download PDF"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleEmailPayslip(payslip.payslip_id, payslip.employee_name)}
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition"
                                title="Email Payslip"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </button>
                              {payslip.payment_status === 'Pending' && (
                                <button
                                  onClick={() => handleUpdatePayslipStatus(payslip.payslip_id, 'Paid', payslip.employee_name)}
                                  className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition"
                                  title="Mark as Paid"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                  {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of{' '}
                  {pagination.totalItems} results
                </div>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                />
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-3 pt-4 border-t mt-6">
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

      {/* Payslip Details Modal */}
      {isDetailsModalOpen && selectedPayslip && (
        <PayslipDetailsModal
          payslip={selectedPayslip}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedPayslip(null);
          }}
          onRefresh={fetchPayslips}
        />
      )}
    </>
  );
};

export default PayslipsListModal;
