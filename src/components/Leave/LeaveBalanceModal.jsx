import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/leaveAPI';

const LeaveBalanceModal = ({ employees, onClose }) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    if (selectedEmployee) {
      fetchLeaveBalance();
    }
  }, [selectedEmployee, selectedYear]);

  const fetchLeaveBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await leaveAPI.getLeaveBalance({
        employee_id: selectedEmployee,
        year: selectedYear,
      });
      
      setLeaveBalance(response.data || []);
    } catch (err) {
      console.error('Error fetching leave balance:', err);
      setError(err.message || 'Failed to fetch leave balance');
      setLeaveBalance([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployeeData = employees.find(e => e.employee_id === parseInt(selectedEmployee, 10));

  const getTotalAllocated = () => {
    return leaveBalance.reduce((sum, lb) => sum + (lb.total_allocated || 0), 0);
  };

  const getTotalUsed = () => {
    return leaveBalance.reduce((sum, lb) => sum + (lb.used_leaves || 0), 0);
  };

  const getTotalAvailable = () => {
    return leaveBalance.reduce((sum, lb) => sum + (lb.available_leaves || 0), 0);
  };

  const getUtilizationPercentage = (used, total) => {
    if (total === 0) return 0;
    return ((used / total) * 100).toFixed(1);
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
        <div className="relative inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
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
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">Leave Balance</h3>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Employee <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
              >
                <option value="">Choose an employee</option>
                {employees.map(emp => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                disabled={!selectedEmployee}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm disabled:opacity-50"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Employee Info */}
          {selectedEmployeeData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-700">
                    {selectedEmployeeData.first_name.charAt(0)}{selectedEmployeeData.last_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-900">
                    {selectedEmployeeData.first_name} {selectedEmployeeData.last_name}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {selectedEmployeeData.employee_code} • {selectedEmployeeData.department_name || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <p className="text-gray-500 ml-3">Loading leave balance...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* No Employee Selected */}
          {!selectedEmployee && !loading && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">Select an employee to view leave balance</p>
            </div>
          )}

          {/* Leave Balance Display */}
          {!loading && !error && selectedEmployee && leaveBalance.length > 0 && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-700">Total Allocated</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{getTotalAllocated()}</p>
                  <p className="text-xs text-blue-600 mt-1">days</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-red-700">Used</span>
                  </div>
                  <p className="text-3xl font-bold text-red-900">{getTotalUsed()}</p>
                  <p className="text-xs text-red-600 mt-1">days</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-green-700">Available</span>
                  </div>
                  <p className="text-3xl font-bold text-green-900">{getTotalAvailable()}</p>
                  <p className="text-xs text-green-600 mt-1">days</p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Leave Type Breakdown</h4>
                
                {leaveBalance.map((balance) => (
                  <div
                    key={balance.leave_type_id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-semibold text-gray-900">{balance.leave_type_name}</h5>
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-mono">
                            {balance.leave_code}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Year: {balance.year}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {balance.available_leaves}
                        </div>
                        <p className="text-xs text-gray-500">available</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Utilization</span>
                        <span>{getUtilizationPercentage(balance.used_leaves, balance.total_allocated)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(getUtilizationPercentage(balance.used_leaves, balance.total_allocated), 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div className="bg-white rounded p-2 border border-gray-200">
                        <p className="text-xs text-gray-600">Allocated</p>
                        <p className="text-lg font-bold text-gray-900">{balance.total_allocated}</p>
                      </div>
                      <div className="bg-white rounded p-2 border border-gray-200">
                        <p className="text-xs text-gray-600">Used</p>
                        <p className="text-lg font-bold text-red-600">{balance.used_leaves}</p>
                      </div>
                      <div className="bg-white rounded p-2 border border-gray-200">
                        <p className="text-xs text-gray-600">Available</p>
                        <p className="text-lg font-bold text-green-600">{balance.available_leaves}</p>
                      </div>
                      <div className="bg-white rounded p-2 border border-gray-200">
                        <p className="text-xs text-gray-600">Carried</p>
                        <p className="text-lg font-bold text-blue-600">{balance.carry_forward || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* No Balance Data */}
          {!loading && !error && selectedEmployee && leaveBalance.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">No leave balance found</p>
              <p className="text-gray-400 text-sm mt-1">This employee has no leave allocations for {selectedYear}</p>
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
  );
};

export default LeaveBalanceModal;
