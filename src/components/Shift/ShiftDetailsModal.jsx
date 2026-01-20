import React, { useState, useEffect } from 'react';
import { shiftAPI } from '../../services/shiftAPI';
import ShiftAssignmentModal from './ShiftAssignmentModal';

const ShiftDetailsModal = ({ shift, onClose, onEdit, onDelete, onRefresh }) => {
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  useEffect(() => {
    if (shift?.shift_id) {
      fetchAssignments();
    }
  }, [shift]);

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const response = await shiftAPI.getShiftAssignments(shift.shift_id);
      setAssignments(response.data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId, employeeName) => {
    if (window.confirm(`Remove shift assignment for ${employeeName}?`)) {
      try {
        await shiftAPI.removeShiftAssignment(assignmentId);
        alert('✅ Assignment removed successfully');
        fetchAssignments();
        onRefresh();
      } catch (err) {
        console.error('Error removing assignment:', err);
        alert(`❌ ${err.message || 'Failed to remove assignment'}`);
      }
    }
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Ongoing';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWeekOffDaysText = (weekOffDays) => {
    if (!weekOffDays || weekOffDays.length === 0) return 'None';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekOffDays.map(day => days[day]).join(', ');
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
        <div className="relative inline-block w-full max-w-5xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
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
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-secondary-700">{shift.shift_name}</h3>
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-mono">
                    {shift.shift_code}
                  </span>
                  {shift.is_flexible && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      Flexible
                    </span>
                  )}
                  {shift.is_night_shift && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                      Night
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{shift.organization_name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="px-3 py-1.5 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Shift Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold text-blue-900">Shift Timing</span>
              </div>
              <p className="text-lg font-bold text-blue-900">
                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold text-green-900">Full Day</span>
              </div>
              <p className="text-lg font-bold text-green-900">{shift.full_day_duration_hours} hours</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold text-purple-900">Half Day</span>
              </div>
              <p className="text-lg font-bold text-purple-900">{shift.half_day_duration_hours} hours</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs font-semibold text-orange-900">Employees</span>
              </div>
              <p className="text-lg font-bold text-orange-900">{shift.employee_count || 0}</p>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Time Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Grace Time:</span>
                  <span className="font-semibold text-gray-900">{shift.grace_time_minutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Break Time:</span>
                  <span className="font-semibold text-gray-900">{shift.break_time_minutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    shift.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {shift.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Week Off Days</h4>
              <p className="text-sm text-gray-900 font-semibold">
                {getWeekOffDaysText(shift.week_off_days)}
              </p>
            </div>
          </div>

          {/* Description */}
          {shift.description && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Description</h4>
              <p className="text-sm text-blue-800">{shift.description}</p>
            </div>
          )}

          {/* Employee Assignments */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">Employee Assignments</h4>
              <button
                onClick={() => setIsAssignmentModalOpen(true)}
                className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Assign Employee
              </button>
            </div>

            {loadingAssignments ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                <p className="text-gray-500 text-sm mt-2">Loading assignments...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500 text-sm">No employees assigned to this shift</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Effective From</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Effective To</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {assignments.map((assignment) => (
                      <tr key={assignment.employee_shift_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{assignment.employee_name}</p>
                            <p className="text-xs text-gray-500">{assignment.employee_code}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{assignment.department_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatDate(assignment.effective_from)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatDate(assignment.effective_to)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            assignment.is_current 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {assignment.is_current ? 'Current' : 'Ended'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {assignment.is_current && (
                            <button
                              onClick={() => handleRemoveAssignment(assignment.employee_shift_id, assignment.employee_name)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {isAssignmentModalOpen && (
        <ShiftAssignmentModal
          shift={shift}
          onClose={() => setIsAssignmentModalOpen(false)}
          onSuccess={() => {
            setIsAssignmentModalOpen(false);
            fetchAssignments();
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default ShiftDetailsModal;
