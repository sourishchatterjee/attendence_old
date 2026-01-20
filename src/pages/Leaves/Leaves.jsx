import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/leaveAPI';
import { employeeAPI } from '../../services/employeeAPI';
import { departmentAPI } from '../../services/departmentAPI';
import { organizationAPI } from '../../services/organizationAPI';
import LeaveTypeModal from '../../components/Leave/LeaveTypeModal';
import LeaveApplicationModal from '../../components/Leave/LeaveApplicationModal';
import LeaveDetailsModal from '../../components/Leave/LeaveDetailsModal';
import LeaveBalanceModal from '../../components/Leave/LeaveBalanceModal';
import LeaveCalendarModal from '../../components/Leave/LeaveCalendarModal';
import Pagination from '../../components/Pagination';

const Leaves = () => {
  const [activeTab, setActiveTab] = useState('applications'); // 'applications', 'types'
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterLeaveType, setFilterLeaveType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isLeaveTypeModalOpen, setIsLeaveTypeModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 15,
    totalItems: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchOrganizations();
    fetchDepartments();
    fetchEmployees();
    fetchLeaveTypes();
  }, []);

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchLeaveApplications();
    } else {
      fetchLeaveTypes();
    }
  }, [activeTab, pagination.page, filterEmployee, filterLeaveType, filterStatus, filterOrganization, fromDate, toDate]);

  const fetchOrganizations = async () => {
    try {
      const response = await organizationAPI.getAllOrganizations({ pageSize: 100 });
      setOrganizations(response.data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAllDepartments({ pageSize: 100 });
      setDepartments(response.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAllEmployees({ pageSize: 1000 });
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: activeTab === 'types' ? pagination.page : 1,
        pageSize: activeTab === 'types' ? pagination.pageSize : 100,
      };
      
      if (filterOrganization !== 'all') {
        params.organization_id = parseInt(filterOrganization, 10);
      }

      const response = await leaveAPI.getAllLeaveTypes(params);
      
      const leaveTypesData = response.data || response || [];
      setLeaveTypes(Array.isArray(leaveTypesData) ? leaveTypesData : []);
      
      if (activeTab === 'types' && response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
        }));
      }
    } catch (err) {
      console.error('Fetch leave types error:', err);
      setError(err.message || 'Failed to fetch leave types');
      setLeaveTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      
      if (filterEmployee !== 'all') {
        params.employee_id = parseInt(filterEmployee, 10);
      }
      if (filterLeaveType !== 'all') {
        params.leave_type_id = parseInt(filterLeaveType, 10);
      }
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      if (fromDate) {
        params.from_date = fromDate;
      }
      if (toDate) {
        params.to_date = toDate;
      }

      const response = await leaveAPI.getAllLeaveApplications(params);
      
      const applicationsData = response.data || response || [];
      setLeaveApplications(Array.isArray(applicationsData) ? applicationsData : []);
      
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
        }));
      }
    } catch (err) {
      console.error('Fetch leave applications error:', err);
      setError(err.message || 'Failed to fetch leave applications');
      setLeaveApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setIsDetailsModalOpen(true);
  };

  const handleEditLeaveType = (leaveType) => {
    setSelectedLeaveType(leaveType);
    setIsLeaveTypeModalOpen(true);
  };

  const handleDeleteLeaveType = async (leaveTypeId, leaveTypeName) => {
    if (window.confirm(`Delete leave type "${leaveTypeName}"?`)) {
      try {
        await leaveAPI.deleteLeaveType(leaveTypeId);
        showNotification('Leave type deleted successfully', 'success');
        fetchLeaveTypes();
      } catch (err) {
        console.error('Delete error:', err);
        showNotification(err.message || 'Failed to delete leave type', 'error');
      }
    }
  };

  const showNotification = (message, type) => {
    if (type === 'error') {
      alert(`❌ ${message}`);
    } else {
      alert(`✅ ${message}`);
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800',
    };
    return statuses[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const filteredApplications = leaveApplications.filter(app =>
    app.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.leave_type_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeaveTypes = leaveTypes.filter(type =>
    type.leave_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.leave_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && (leaveApplications.length === 0 && leaveTypes.length === 0)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading leaves...</p>
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
              <h1 className="text-2xl font-bold text-secondary-700">Leave Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage leave types and applications</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsBalanceModalOpen(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Balance
              </button>
              <button
                onClick={() => setIsCalendarModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar
              </button>
              {activeTab === 'applications' ? (
                <button
                  onClick={() => setIsApplicationModalOpen(true)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Apply Leave
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedLeaveType(null);
                    setIsLeaveTypeModalOpen(true);
                  }}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Leave Type
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('applications');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'applications'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Leave Applications
                {leaveApplications.length > 0 && (
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                    {pagination.totalItems || leaveApplications.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('types');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'types'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Leave Types
              </div>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'applications' ? 'applications' : 'leave types'}...`}
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
            </div>

            {activeTab === 'applications' && (
              <>
                <select
                  value={filterEmployee}
                  onChange={(e) => {
                    setFilterEmployee(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
                >
                  <option value="all">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_code})
                    </option>
                  ))}
                </select>

                <select
                  value={filterLeaveType}
                  onChange={(e) => {
                    setFilterLeaveType(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
                >
                  <option value="all">All Leave Types</option>
                  {leaveTypes.map(type => (
                    <option key={type.leave_type_id} value={type.leave_type_id}>
                      {type.leave_type_name} ({type.leave_code})
                    </option>
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
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
                />
              </>
            )}

            {activeTab === 'types' && (
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
            )}

            <button
              onClick={activeTab === 'applications' ? fetchLeaveApplications : fetchLeaveTypes}
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

        {/* Content */}
        {activeTab === 'applications' ? (
          /* Leave Applications Table */
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Leave Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">From Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">To Date</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Days</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Applied Date</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-12 text-center">
                          <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-500 text-sm">No leave applications found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((application) => (
                        <tr key={application.leave_application_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{application.employee_name}</p>
                              <p className="text-xs text-gray-500">{application.employee_code} • {application.department_name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                              {application.leave_type_name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatDate(application.from_date)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatDate(application.to_date)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 text-sm font-bold">
                              {application.total_days}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(application.status)}`}>
                              {application.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatDate(application.applied_date)}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleViewDetails(application)}
                              className="p-1.5 text-accent-blue hover:bg-blue-50 rounded transition"
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-3">
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
          </>
        ) : (
          /* Leave Types Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeaveTypes.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No leave types found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm ? 'Try adjusting your search' : 'Click "Add Leave Type" to create your first leave type'}
                </p>
              </div>
            ) : (
              filteredLeaveTypes.map((leaveType) => (
                <div
                  key={leaveType.leave_type_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden"
                >
                  {/* Leave Type Card Header */}
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {leaveType.leave_type_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-mono">
                            {leaveType.leave_code}
                          </span>
                          {leaveType.is_paid && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              Paid
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Leave Type Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Organization */}
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-gray-600">{leaveType.organization_name || 'N/A'}</span>
                    </div>

                    {/* Days Allocation */}
                    <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg p-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-blue-900 font-semibold">
                        {leaveType.total_days_per_year} days/year
                      </span>
                    </div>

                    {/* Carry Forward */}
                    {leaveType.is_carry_forward && (
                      <div className="flex items-center gap-2 text-sm bg-purple-50 rounded-lg p-2">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className="text-purple-900 font-semibold">
                          Carry forward: {leaveType.max_carry_forward_days} days
                        </span>
                      </div>
                    )}

                    {/* Approval Required */}
                    {leaveType.requires_approval && (
                      <div className="flex items-center gap-2 text-sm text-orange-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="font-medium">Requires Approval</span>
                      </div>
                    )}

                    {/* Description */}
                    {leaveType.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {leaveType.description}
                      </p>
                    )}
                  </div>

                  {/* Leave Type Card Actions */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <span className={`text-xs font-semibold ${
                      leaveType.is_active ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {leaveType.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditLeaveType(leaveType)}
                        className="p-1.5 text-secondary-500 hover:bg-secondary-50 rounded transition"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteLeaveType(leaveType.leave_type_id, leaveType.leave_type_name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {isLeaveTypeModalOpen && (
        <LeaveTypeModal
          leaveType={selectedLeaveType}
          organizations={organizations}
          onClose={() => {
            setIsLeaveTypeModalOpen(false);
            setSelectedLeaveType(null);
          }}
          onSuccess={() => {
            setIsLeaveTypeModalOpen(false);
            setSelectedLeaveType(null);
            fetchLeaveTypes();
          }}
        />
      )}

      {isApplicationModalOpen && (
        <LeaveApplicationModal
          employees={employees}
          leaveTypes={leaveTypes}
          onClose={() => setIsApplicationModalOpen(false)}
          onSuccess={() => {
            setIsApplicationModalOpen(false);
            fetchLeaveApplications();
          }}
        />
      )}

      {isDetailsModalOpen && selectedApplication && (
        <LeaveDetailsModal
          application={selectedApplication}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedApplication(null);
          }}
          onRefresh={fetchLeaveApplications}
        />
      )}

      {isBalanceModalOpen && (
        <LeaveBalanceModal
          employees={employees}
          onClose={() => setIsBalanceModalOpen(false)}
        />
      )}

      {isCalendarModalOpen && (
        <LeaveCalendarModal
          departments={departments}
          leaveTypes={leaveTypes}
          onClose={() => setIsCalendarModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Leaves;
