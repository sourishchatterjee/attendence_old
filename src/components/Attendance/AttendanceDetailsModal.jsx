import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../../services/attendanceAPI';

const AttendanceDetailsModal = ({ attendance, onClose, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    checkout_time: '',
    working_hours: '',
    status: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [detailedData, setDetailedData] = useState(null);

  useEffect(() => {
    if (attendance?.attendance_id) {
      fetchDetailedAttendance();
    }
  }, [attendance]);

  const fetchDetailedAttendance = async () => {
    try {
      const response = await attendanceAPI.getAttendanceById(attendance.attendance_id);
      setDetailedData(response.data);
    } catch (err) {
      console.error('Error fetching attendance details:', err);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      checkout_time: detailedData?.checkout_time ? new Date(detailedData.checkout_time).toISOString().slice(0, 16) : '',
      working_hours: detailedData?.working_hours || '',
      status: detailedData?.status || '',
      remarks: detailedData?.remarks || '',
    });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updateData = {
        ...(formData.checkout_time && { checkout_time: formData.checkout_time }),
        ...(formData.working_hours && { working_hours: parseFloat(formData.working_hours) }),
        status: formData.status,
        remarks: formData.remarks || null,
      };

      await attendanceAPI.updateAttendance(attendance.attendance_id, updateData);
      alert('✅ Attendance updated successfully');
      setIsEditing(false);
      fetchDetailedAttendance();
      onRefresh();
    } catch (err) {
      console.error('Update error:', err);
      alert(`❌ ${err.message || 'Failed to update attendance'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return 'N/A';
    const date = new Date(datetime);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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

  if (!detailedData) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50"></div>
          <div className="relative bg-white rounded-xl p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Loading details...</p>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary-700">{detailedData.employee_name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {detailedData.employee_code} • {formatDateTime(detailedData.attendance_date)}
                </p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="px-3 py-1.5 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition text-sm font-medium"
              >
                Edit
              </button>
            )}
          </div>

          {/* Status */}
          <div className="mb-6">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(detailedData.status)}`}>
              {detailedData.status}
            </span>
          </div>

          {isEditing ? (
            /* Edit Form */
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Half Day">Half Day</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Week Off">Week Off</option>
                    <option value="Holiday">Holiday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Working Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.working_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, working_hours: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Details View */
            <>
              {/* Time Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-xs font-semibold text-green-900">Check In</span>
                  </div>
                  <p className="text-lg font-bold text-green-900">{formatTime(detailedData.checkin_time)}</p>
                </div>

                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-xs font-semibold text-red-900">Check Out</span>
                  </div>
                  <p className="text-lg font-bold text-red-900">{formatTime(detailedData.checkout_time)}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-semibold text-blue-900">Working Hours</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">{detailedData.working_hours?.toFixed(1) || 0}h</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-xs font-semibold text-purple-900">Overtime</span>
                  </div>
                  <p className="text-lg font-bold text-purple-900">{detailedData.overtime_hours?.toFixed(1) || 0}h</p>
                </div>
              </div>

              {/* Shift Information */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Shift Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Shift Name</p>
                    <p className="font-semibold text-gray-900">{detailedData.shift_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Break Hours</p>
                    <p className="font-semibold text-gray-900">{detailedData.break_hours?.toFixed(1) || 0}h</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Late By</p>
                    <p className={`font-semibold ${detailedData.is_late ? 'text-red-600' : 'text-green-600'}`}>
                      {detailedData.is_late ? `${detailedData.late_by_minutes} min` : 'On Time'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Early Leave</p>
                    <p className={`font-semibold ${detailedData.early_leave ? 'text-orange-600' : 'text-green-600'}`}>
                      {detailedData.early_leave ? `${detailedData.early_leave_minutes} min` : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Check In Location */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Check In Location
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-green-700 font-medium">Coordinates</p>
                      <p className="text-green-900 font-mono text-xs">
                        {detailedData.checkin_latitude?.toFixed(6)}, {detailedData.checkin_longitude?.toFixed(6)}
                      </p>
                    </div>
                    {detailedData.checkin_address && (
                      <div>
                        <p className="text-green-700 font-medium">Address</p>
                        <p className="text-green-900">{detailedData.checkin_address}</p>
                      </div>
                    )}
                    {detailedData.checkin_latitude && detailedData.checkin_longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${detailedData.checkin_latitude},${detailedData.checkin_longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-700 hover:text-green-800 font-medium"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View on Map
                      </a>
                    )}
                  </div>
                </div>

                {/* Check Out Location */}
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Check Out Location
                  </h4>
                  {detailedData.checkout_latitude && detailedData.checkout_longitude ? (
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-red-700 font-medium">Coordinates</p>
                        <p className="text-red-900 font-mono text-xs">
                          {detailedData.checkout_latitude?.toFixed(6)}, {detailedData.checkout_longitude?.toFixed(6)}
                        </p>
                      </div>
                      {detailedData.checkout_address && (
                        <div>
                          <p className="text-red-700 font-medium">Address</p>
                          <p className="text-red-900">{detailedData.checkout_address}</p>
                        </div>
                      )}
                      <a
                        href={`https://www.google.com/maps?q=${detailedData.checkout_latitude},${detailedData.checkout_longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-red-700 hover:text-red-800 font-medium"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View on Map
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-red-700">Not checked out yet</p>
                  )}
                </div>
              </div>

              {/* Images */}
              {(detailedData.checkin_image_url || detailedData.checkout_image_url) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {detailedData.checkin_image_url && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Check In Photo</p>
                      <img 
                        src={detailedData.checkin_image_url} 
                        alt="Check In" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  {detailedData.checkout_image_url && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Check Out Photo</p>
                      <img 
                        src={detailedData.checkout_image_url} 
                        alt="Check Out" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Remarks */}
              {detailedData.remarks && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2">Remarks</h4>
                  <p className="text-sm text-yellow-800">{detailedData.remarks}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetailsModal;
