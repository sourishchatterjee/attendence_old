import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../../services/attendanceAPI';
import { employeeAPI } from '../../services/employeeAPI';
import { departmentAPI } from '../../services/departmentAPI';
import { organizationAPI } from '../../services/organizationAPI';
import AttendanceDetailsModal from '../../components/Attendance/AttendanceDetailsModal';
import ManualAttendanceModal from '../../components/Attendance/ManualAttendanceModal';
import CheckInModal from '../../components/Attendance/CheckInModal';
import ExportAttendanceModal from '../../components/Attendance/ExportAttendanceModal';
import Pagination from '../../components/Pagination';

const Attendance = () => {
  const [activeTab, setActiveTab] = useState('records'); // 'records' or 'today'
  const [attendance, setAttendance] = useState([]);
  const [todayData, setTodayData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
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
    
    // Set default date range (last 7 days)
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    setToDate(formatDateForInput(today));
    setFromDate(formatDateForInput(lastWeek));
  }, []);

  useEffect(() => {
    if (activeTab === 'records') {
      fetchAttendance();
    } else {
      fetchTodayAttendance();
    }
  }, [activeTab, pagination.page, filterEmployee, filterDepartment, filterOrganization, filterStatus, fromDate, toDate]);

  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

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
      const response = await employeeAPI.getAllEmployees({ pageSize: 100 });
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchAttendance = async () => {
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
      if (filterDepartment !== 'all') {
        params.department_id = parseInt(filterDepartment, 10);
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

      const response = await attendanceAPI.getAllAttendance(params);
      
      const attendanceData = response.data || response || [];
      setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
      
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
        }));
      }
    } catch (err) {
      console.error('Fetch attendance error:', err);
      setError(err.message || 'Failed to fetch attendance');
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      
      if (filterOrganization !== 'all') {
        params.organization_id = parseInt(filterOrganization, 10);
      }
      if (filterDepartment !== 'all') {
        params.department_id = parseInt(filterDepartment, 10);
      }

      const response = await attendanceAPI.getTodayAttendance(params);
      setTodayData(response.data || null);
    } catch (err) {
      console.error('Fetch today attendance error:', err);
      setError(err.message || 'Failed to fetch today\'s attendance');
      setTodayData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedAttendance(record);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = async (attendanceId, employeeName) => {
    if (window.confirm(`Delete attendance record for ${employeeName}?`)) {
      try {
        await attendanceAPI.deleteAttendance(attendanceId);
        showNotification('Attendance record deleted successfully', 'success');
        fetchAttendance();
      } catch (err) {
        console.error('Delete error:', err);
        showNotification(err.message || 'Failed to delete attendance', 'error');
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
      'Present': 'bg-green-100 text-green-800',
      'Absent': 'bg-red-100 text-red-800',
      'Half Day': 'bg-yellow-100 text-yellow-800',
      'On Leave': 'bg-blue-100 text-blue-800',
      'Week Off': 'bg-purple-100 text-purple-800',
      'Holiday': 'bg-indigo-100 text-indigo-800',
    };
    return statuses[status] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (datetime) => {
    if (!datetime) return 'N/A';
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
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

  const formatHours = (hours) => {
    if (!hours && hours !== 0) return 'N/A';
    return `${hours.toFixed(1)}h`;
  };

  const filteredAttendance = attendance.filter(record =>
    record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTodayList = todayData?.attendance_list?.filter(record =>
    record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading && attendance.length === 0 && !todayData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading attendance...</p>
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
              <h1 className="text-2xl font-bold text-secondary-700">Attendance Management</h1>
              <p className="text-sm text-gray-500 mt-1">Track and manage employee attendance</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsCheckInModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Check In/Out
              </button>
              <button
                onClick={() => setIsManualModalOpen(true)}
                className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition font-medium flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Manual Entry
              </button>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('records');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'records'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Attendance Records
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('today');
              }}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'today'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Today's Attendance
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
                  placeholder="Search employees..."
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

            {activeTab === 'records' && (
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
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Half Day">Half Day</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Week Off">Week Off</option>
                  <option value="Holiday">Holiday</option>
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

            {activeTab === 'today' && (
              <>
                <select
                  value={filterOrganization}
                  onChange={(e) => setFilterOrganization(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
                >
                  <option value="all">All Organizations</option>
                  {organizations.map(org => (
                    <option key={org.organization_id} value={org.organization_id}>
                      {org.organization_name}
                    </option>
                  ))}
                </select>
              </>
            )}

            <select
              value={filterDepartment}
              onChange={(e) => {
                setFilterDepartment(e.target.value);
                if (activeTab === 'records') {
                  setPagination(prev => ({ ...prev, page: 1 }));
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.department_id} value={dept.department_id}>
                  {dept.department_name}
                </option>
              ))}
            </select>

            <button
              onClick={activeTab === 'records' ? fetchAttendance : fetchTodayAttendance}
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
        {activeTab === 'records' ? (
          /* Attendance Records Table */
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Check In</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Check Out</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Working Hrs</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Late</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAttendance.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-12 text-center">
                          <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="text-gray-500 text-sm">No attendance records found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredAttendance.map((record) => (
                        <tr key={record.attendance_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{record.employee_name}</p>
                              <p className="text-xs text-gray-500">{record.employee_code}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatDate(record.attendance_date)}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{formatTime(record.checkin_time)}</div>
                            {record.checkin_location && (
                              <div className="text-xs text-gray-500 truncate max-w-[120px]">{record.checkin_location}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{formatTime(record.checkout_time)}</div>
                            {record.checkout_location && (
                              <div className="text-xs text-gray-500 truncate max-w-[120px]">{record.checkout_location}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{formatHours(record.working_hours)}</div>
                            {record.overtime_hours > 0 && (
                              <div className="text-xs text-green-600">+{formatHours(record.overtime_hours)} OT</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {record.is_late ? (
                              <span className="inline-flex px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                                {record.late_by_minutes}m
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewDetails(record)}
                                className="p-1.5 text-accent-blue hover:bg-blue-50 rounded transition"
                                title="View Details"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(record.attendance_id, record.employee_name)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
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
          /* Today's Attendance Dashboard */
          <>
            {todayData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Total Employees</p>
                        <p className="text-2xl font-bold text-gray-900">{todayData.summary.total_employees}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Present</p>
                        <p className="text-2xl font-bold text-green-600">{todayData.summary.present}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Absent</p>
                        <p className="text-2xl font-bold text-red-600">{todayData.summary.absent}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Late Arrivals</p>
                        <p className="text-2xl font-bold text-yellow-600">{todayData.summary.late}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Attendance %</p>
                        <p className="text-2xl font-bold text-purple-600">{todayData.summary.present_percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Today's List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900">Today's Attendance List - {formatDate(todayData.date)}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Check In Time</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Late</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredTodayList.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-4 py-12 text-center">
                              <p className="text-gray-500 text-sm">No attendance records for today</p>
                            </td>
                          </tr>
                        ) : (
                          filteredTodayList.map((record, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{record.employee_name}</p>
                                  <p className="text-xs text-gray-500">{record.employee_code}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{record.department_name || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{record.checkin_time || 'Not checked in'}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(record.status)}`}>
                                  {record.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {record.is_late ? (
                                  <span className="inline-flex items-center gap-1 text-red-600 text-sm font-semibold">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Late
                                  </span>
                                ) : (
                                  <span className="text-green-600 text-sm font-semibold">On Time</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {isDetailsModalOpen && selectedAttendance && (
        <AttendanceDetailsModal
          attendance={selectedAttendance}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedAttendance(null);
          }}
          onRefresh={fetchAttendance}
        />
      )}

      {isManualModalOpen && (
        <ManualAttendanceModal
          employees={employees}
          onClose={() => setIsManualModalOpen(false)}
          onSuccess={() => {
            setIsManualModalOpen(false);
            fetchAttendance();
          }}
        />
      )}

      {isCheckInModalOpen && (
        <CheckInModal
          onClose={() => setIsCheckInModalOpen(false)}
          onSuccess={() => {
            setIsCheckInModalOpen(false);
            fetchAttendance();
            if (activeTab === 'today') {
              fetchTodayAttendance();
            }
          }}
        />
      )}

      {isExportModalOpen && (
        <ExportAttendanceModal
          employees={employees}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Attendance;
