import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shiftAPI } from '../../services/shiftAPI';
import { organizationAPI } from '../../services/organizationAPI';
import ShiftModal from '../../components/Shift/ShiftModal';
import ShiftDetailsModal from '../../components/Shift/ShiftDetailsModal';
import Pagination from '../../components/Pagination';

const Shifts = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [pagination.page, filterActive, filterOrganization]);

  const fetchOrganizations = async () => {
    try {
      const response = await organizationAPI.getAllOrganizations({ pageSize: 100 });
      setOrganizations(response.data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      
      if (filterActive !== 'all') {
        params.is_active = filterActive === 'active';
      }

      if (filterOrganization !== 'all') {
        params.organization_id = parseInt(filterOrganization, 10);
      }

      const response = await shiftAPI.getAllShifts(params);
      
      const shiftsData = response.data || response || [];
      setShifts(Array.isArray(shiftsData) ? shiftsData : []);
      
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
        }));
      }
    } catch (err) {
      console.error('Fetch shifts error:', err);
      setError(err.message || 'Failed to fetch shifts');
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCreate = () => {
    setSelectedShift(null);
    setIsModalOpen(true);
  };

  const handleEdit = (shift) => {
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  const handleView = (shift) => {
    setSelectedShift(shift);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = async (shiftId, shiftName) => {
    if (window.confirm(`Are you sure you want to delete shift "${shiftName}"?`)) {
      try {
        await shiftAPI.deleteShift(shiftId);
        showNotification('Shift deleted successfully', 'success');
        fetchShifts();
      } catch (err) {
        console.error('Delete shift error:', err);
        showNotification(err.message || 'Failed to delete shift', 'error');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedShift(null);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setSelectedShift(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setSelectedShift(null);
    fetchShifts();
  };

  const showNotification = (message, type) => {
    if (type === 'error') {
      alert(`❌ ${message}`);
    } else {
      alert(`✅ ${message}`);
    }
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getShiftTypeBadge = (shift) => {
    if (shift.is_flexible) {
      return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">Flexible</span>;
    }
    if (shift.is_night_shift) {
      return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">Night</span>;
    }
    return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Regular</span>;
  };

  const getWeekOffDaysText = (weekOffDays) => {
    if (!weekOffDays || weekOffDays.length === 0) return 'None';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return weekOffDays.map(day => days[day]).join(', ');
  };

  const filteredShifts = shifts.filter(shift =>
    shift.shift_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shift.shift_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shift.organization_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && shifts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading shifts...</p>
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
              <h1 className="text-2xl font-bold text-secondary-700">Shift Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage work shifts and employee assignments</p>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Shift
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
                  placeholder="Search shifts..."
                  value={searchTerm}
                  onChange={handleSearch}
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

            {/* Organization Filter */}
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

            {/* Status Filter */}
            <select
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Refresh */}
            <button
              onClick={fetchShifts}
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

        {/* Shifts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShifts.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">No shifts found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm ? 'Try adjusting your search' : 'Click "Add Shift" to create your first shift'}
              </p>
            </div>
          ) : (
            filteredShifts.map((shift) => (
              <div
                key={shift.shift_id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {shift.shift_name}
                        </h3>
                        {getShiftTypeBadge(shift)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-mono">
                          {shift.shift_code}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            shift.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {shift.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Organization */}
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-600">{shift.organization_name || 'N/A'}</span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-900 font-semibold">
                      {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="text-blue-600 font-medium">Full Day</p>
                      <p className="text-blue-900 font-bold">{shift.full_day_duration_hours}h</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                      <p className="text-green-600 font-medium">Half Day</p>
                      <p className="text-green-900 font-bold">{shift.half_day_duration_hours}h</p>
                    </div>
                  </div>

                  {/* Grace Time & Break */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-gray-600">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Grace: {shift.grace_time_minutes}m
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                      </svg>
                      Break: {shift.break_time_minutes}m
                    </div>
                  </div>

                  {/* Week Off */}
                  <div className="flex items-center gap-2 text-xs">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">Week Off: {getWeekOffDaysText(shift.week_off_days)}</span>
                  </div>

                  {/* Employee Count */}
                  <div className="flex items-center gap-2 text-sm bg-primary-50 rounded-lg p-2">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-primary-900 font-semibold">
                      {shift.employee_count || 0} Employees
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => handleView(shift)}
                    className="text-sm text-accent-blue hover:text-accent-teal transition font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(shift)}
                      className="p-1.5 text-secondary-500 hover:bg-secondary-50 rounded transition"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(shift.shift_id, shift.shift_name)}
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
      {isModalOpen && (
        <ShiftModal
          shift={selectedShift}
          organizations={organizations}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {isDetailsModalOpen && selectedShift && (
        <ShiftDetailsModal
          shift={selectedShift}
          onClose={handleDetailsModalClose}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            handleEdit(selectedShift);
          }}
          onDelete={() => {
            setIsDetailsModalOpen(false);
            handleDelete(selectedShift.shift_id, selectedShift.shift_name);
          }}
          onRefresh={fetchShifts}
        />
      )}
    </div>
  );
};

export default Shifts;
