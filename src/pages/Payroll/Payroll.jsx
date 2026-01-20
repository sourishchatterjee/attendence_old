import React, { useState, useEffect } from 'react';
import { payrollAPI } from '../../services/payrollAPI';
import { organizationAPI } from '../../services/organizationAPI';
import CreatePayrollModal from '../../components/Payroll/CreatePayrollModal';
import ProcessPayrollModal from '../../components/Payroll/ProcessPayrollModal';
import PayrollDetailsModal from '../../components/Payroll/PayrollDetailsModal';
import PayslipsListModal from '../../components/Payroll/PayslipsListModal';
import Pagination from '../../components/Pagination';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPayslipsModalOpen, setIsPayslipsModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0,
  });

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

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    fetchPayrolls();
  }, [pagination.page, filterOrganization, filterYear, filterMonth, filterStatus]);

  const fetchOrganizations = async () => {
    try {
      const response = await organizationAPI.getAllOrganizations({ pageSize: 100 });
      setOrganizations(response.data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      
      if (filterOrganization !== 'all') {
        params.organization_id = parseInt(filterOrganization, 10);
      }
      if (filterYear) {
        params.year = parseInt(filterYear, 10);
      }
      if (filterMonth !== 'all') {
        params.month = parseInt(filterMonth, 10);
      }
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      const response = await payrollAPI.getAllPayrolls(params);
      
      const payrollsData = response.data || response || [];
      setPayrolls(Array.isArray(payrollsData) ? payrollsData : []);
      
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
        }));
      }
    } catch (err) {
      console.error('Fetch payrolls error:', err);
      setError(err.message || 'Failed to fetch payrolls');
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (payroll) => {
    try {
      const response = await payrollAPI.getPayrollById(payroll.payroll_id);
      setSelectedPayroll(response.data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Error fetching payroll details:', err);
      alert(`❌ ${err.message || 'Failed to fetch payroll details'}`);
    }
  };

  const handleProcessPayroll = (payroll) => {
    setSelectedPayroll(payroll);
    setIsProcessModalOpen(true);
  };

  const handleViewPayslips = (payroll) => {
    setSelectedPayroll(payroll);
    setIsPayslipsModalOpen(true);
  };

  const handleUpdateStatus = async (payrollId, status) => {
    try {
      const statusData = {
        status,
        payment_date: status === 'Paid' ? new Date().toISOString().split('T')[0] : null,
      };
      await payrollAPI.updatePayrollStatus(payrollId, statusData);
      alert(`✅ Payroll status updated to ${status}`);
      fetchPayrolls();
    } catch (err) {
      console.error('Update status error:', err);
      alert(`❌ ${err.message || 'Failed to update status'}`);
    }
  };

  const handleDeletePayroll = async (payrollId, monthYear) => {
    if (window.confirm(`Delete payroll for ${monthYear}? This action cannot be undone.`)) {
      try {
        await payrollAPI.deletePayroll(payrollId);
        alert('✅ Payroll deleted successfully');
        fetchPayrolls();
      } catch (err) {
        console.error('Delete error:', err);
        alert(`❌ ${err.message || 'Failed to delete payroll'}`);
      }
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
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getMonthName = (monthNum) => {
    const month = months.find(m => m.value === monthNum);
    return month ? month.name : 'N/A';
  };

  if (loading && payrolls.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading payrolls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-secondary-700">Payroll Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage monthly payroll processing and payslips</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Payroll
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={filterOrganization}
              onChange={(e) => {
                setFilterOrganization(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">All Organizations</option>
              {organizations.map(org => (
                <option key={org.organization_id} value={org.organization_id}>
                  {org.organization_name}
                </option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">All Months</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.name}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Paid">Paid</option>
            </select>

            <button
              onClick={fetchPayrolls}
              disabled={loading}
              className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Payroll Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payrolls.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">No payrolls found</p>
              <p className="text-gray-400 text-sm mt-1">Click "Create Payroll" to start a new payroll cycle</p>
            </div>
          ) : (
            payrolls.map((payroll) => (
              <div
                key={payroll.payroll_id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden"
              >
                {/* Payroll Card Header */}
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {getMonthName(payroll.payroll_month)} {payroll.payroll_year}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{payroll.organization_name || 'N/A'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(payroll.status || 'Draft')}`}>
                      {payroll.status || 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Payroll Card Body */}
                <div className="p-4 space-y-3">
                  {/* Period */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(payroll.payroll_period_from)} - {formatDate(payroll.payroll_period_to)}</span>
                  </div>

                  {/* Employees Count */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-sm text-blue-700 mb-1">Total Employees</p>
                    <p className="text-2xl font-bold text-blue-900">{payroll.total_employees || 0}</p>
                  </div>

                  {/* Financial Summary */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-green-700 mb-1">Gross Amount</p>
                      <p className="text-sm font-bold text-green-900">{formatCurrency(payroll.total_gross_amount)}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <p className="text-xs text-purple-700 mb-1">Net Amount</p>
                      <p className="text-sm font-bold text-purple-900">{formatCurrency(payroll.total_net_amount)}</p>
                    </div>
                  </div>

                  {/* Payment Date */}
                  {payroll.payment_date && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Payment Date:</span> {formatDate(payroll.payment_date)}
                    </div>
                  )}

                  {/* Processed Info */}
                  {payroll.processed_by_name && (
                    <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                      <span className="font-medium">Processed by:</span> {payroll.processed_by_name}
                      <br />
                      <span className="font-medium">Date:</span> {formatDate(payroll.processed_date)}
                    </div>
                  )}
                </div>

                {/* Payroll Card Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(payroll)}
                      className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-xs font-medium"
                      title="View Details"
                    >
                      Details
                    </button>
                    
                    {(payroll.status === 'Draft' || payroll.status === 'Processing') && (
                      <button
                        onClick={() => handleProcessPayroll(payroll)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium"
                        title="Process Payroll"
                      >
                        Process
                      </button>
                    )}

                    {(payroll.status === 'Completed' || payroll.status === 'Paid') && (
                      <button
                        onClick={() => handleViewPayslips(payroll)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium"
                        title="View Payslips"
                      >
                        Payslips
                      </button>
                    )}

                    <div className="relative group">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 hidden group-hover:block z-10">
                        {payroll.status === 'Completed' && (
                          <button
                            onClick={() => handleUpdateStatus(payroll.payroll_id, 'Paid')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition"
                          >
                            Mark as Paid
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePayroll(payroll.payroll_id, `${getMonthName(payroll.payroll_month)} ${payroll.payroll_year}`)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          Delete Payroll
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
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
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreatePayrollModal
          organizations={organizations}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchPayrolls();
          }}
        />
      )}

      {isProcessModalOpen && selectedPayroll && (
        <ProcessPayrollModal
          payroll={selectedPayroll}
          onClose={() => {
            setIsProcessModalOpen(false);
            setSelectedPayroll(null);
          }}
          onSuccess={() => {
            setIsProcessModalOpen(false);
            setSelectedPayroll(null);
            fetchPayrolls();
          }}
        />
      )}

      {isDetailsModalOpen && selectedPayroll && (
        <PayrollDetailsModal
          payroll={selectedPayroll}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedPayroll(null);
          }}
          onRefresh={fetchPayrolls}
        />
      )}

      {isPayslipsModalOpen && selectedPayroll && (
        <PayslipsListModal
          payroll={selectedPayroll}
          onClose={() => {
            setIsPayslipsModalOpen(false);
            setSelectedPayroll(null);
          }}
        />
      )}
    </div>
  );
};

export default Payroll;
