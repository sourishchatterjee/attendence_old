import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/leaveAPI';

const LeaveCalendarModal = ({ departments, leaveTypes, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterLeaveType, setFilterLeaveType] = useState('all');
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    fetchCalendarData();
  }, [selectedMonth, selectedYear, filterDepartment, filterLeaveType]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        month: selectedMonth,
        year: selectedYear,
      };
      
      if (filterDepartment !== 'all') {
        params.department_id = parseInt(filterDepartment, 10);
      }
      if (filterLeaveType !== 'all') {
        params.leave_type_id = parseInt(filterLeaveType, 10);
      }

      const response = await leaveAPI.getLeaveCalendar(params);
      setCalendarData(response.data);
    } catch (err) {
      console.error('Error fetching calendar:', err);
      setError(err.message || 'Failed to fetch calendar data');
      setCalendarData(null);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getLeaveForDate = (date) => {
    if (!calendarData?.leaves) return null;
    return calendarData.leaves.find(l => l.date === date);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];
    const weeks = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-100 border border-gray-200"></div>);
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const leaveData = getLeaveForDate(dateStr);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 p-2 overflow-y-auto ${
            isToday ? 'bg-blue-50 border-blue-400' : leaveData?.employees_on_leave?.length > 0 ? 'bg-yellow-50' : 'bg-white'
          } hover:bg-gray-50 transition`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
              {day}
            </span>
            {leaveData?.employees_on_leave?.length > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
                {leaveData.employees_on_leave.length}
              </span>
            )}
          </div>
          
          {leaveData?.employees_on_leave && leaveData.employees_on_leave.length > 0 && (
            <div className="space-y-1">
              {leaveData.employees_on_leave.slice(0, 2).map((emp, idx) => (
                <div
                  key={idx}
                  className={`text-xs p-1 rounded truncate ${
                    emp.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    emp.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                  title={`${emp.employee_name} - ${emp.leave_type} (${emp.status})`}
                >
                  {emp.employee_name}
                </div>
              ))}
              {leaveData.employees_on_leave.length > 2 && (
                <div className="text-xs text-gray-500 font-medium pl-1">
                  +{leaveData.employees_on_leave.length - 2} more
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Group days into weeks
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(
        <div key={`week-${i}`} className="grid grid-cols-7">
          {days.slice(i, i + 7)}
        </div>
      );
    }

    return weeks;
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const getTotalEmployeesOnLeave = () => {
    if (!calendarData?.leaves) return 0;
    const uniqueEmployees = new Set();
    calendarData.leaves.forEach(leave => {
      leave.employees_on_leave?.forEach(emp => {
        uniqueEmployees.add(emp.employee_id);
      });
    });
    return uniqueEmployees.size;
  };

  const getTotalLeaveDays = () => {
    if (!calendarData?.leaves) return 0;
    return calendarData.leaves.reduce((sum, leave) => {
      return sum + (leave.employees_on_leave?.length || 0);
    }, 0);
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
        <div className="relative inline-block w-full max-w-7xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
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
            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">Leave Calendar</h3>
          </div>

          {/* Controls */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              {/* Month/Year Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 transition"
                  title="Previous Month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white text-sm font-medium"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.name}</option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white text-sm font-medium"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 transition"
                  title="Next Month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white text-sm"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterLeaveType}
                  onChange={(e) => setFilterLeaveType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white text-sm"
                >
                  <option value="all">All Leave Types</option>
                  {leaveTypes.map(type => (
                    <option key={type.leave_type_id} value={type.leave_type_id}>
                      {type.leave_type_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          {!loading && calendarData && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <p className="text-sm text-blue-700 mb-1">Month/Year</p>
                <p className="text-xl font-bold text-blue-900">
                  {months.find(m => m.value === selectedMonth)?.name} {selectedYear}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                <p className="text-sm text-purple-700 mb-1">Employees on Leave</p>
                <p className="text-xl font-bold text-purple-900">{getTotalEmployeesOnLeave()}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                <p className="text-sm text-orange-700 mb-1">Total Leave Days</p>
                <p className="text-xl font-bold text-orange-900">{getTotalLeaveDays()}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <p className="text-gray-500 ml-3">Loading calendar...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Calendar Grid */}
          {!loading && !error && calendarData && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <div key={day} className="py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              {renderCalendar()}
            </div>
          )}

          {/* Legend */}
          <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Legend</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border-2 border-blue-400 rounded"></div>
                <span className="text-gray-700">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-50 border border-gray-200 rounded"></div>
                <span className="text-gray-700">Has Leaves</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span className="text-gray-700">Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                <span className="text-gray-700">Pending</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveCalendarModal;
