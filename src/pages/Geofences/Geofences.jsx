import React, { useState, useEffect } from 'react';
import { 
  FiMapPin, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye,
  FiRefreshCw,
  FiSearch,
  FiGrid,
  FiList,
  FiMap,
  FiCircle,
  FiLayers,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiUsers
} from 'react-icons/fi';
import { 
  IoLocationOutline,
  IoShapesOutline,
  IoNavigateCircleOutline
} from 'react-icons/io5';
import { lorawanAPI } from '../../services/lorawanAPI';
import { organizationAPI } from '../../services/organizationAPI';
import GeofenceModal from '../../components/Geofence/GeofenceModal';
import GeofenceDetailsModal from '../../components/Geofence/GeofenceDetailsModal';
import GeofenceMapModal from '../../components/Geofence/GeofenceMapModal';
import AssignGeofenceModal from '../../components/Geofence/AssignGeofenceModal';
import Pagination from '../../components/Pagination';

const Geofences = () => {
  const [geofences, setGeofences] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isGeofenceModalOpen, setIsGeofenceModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedGeofence, setSelectedGeofence] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    fetchGeofences();
  }, [pagination.page, filterOrganization, filterType, filterStatus]);

  const fetchOrganizations = async () => {
    try {
      const response = await organizationAPI.getAllOrganizations({ pageSize: 100 });
      setOrganizations(response.data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchGeofences = async () => {
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
      if (filterType !== 'all') {
        params.geofence_type = filterType;
      }
      if (filterStatus !== 'all') {
        params.is_active = filterStatus === 'true';
      }

      const response = await lorawanAPI.getAllGeofences(params);
      
      const geofencesData = response.data || response || [];
      setGeofences(Array.isArray(geofencesData) ? geofencesData : []);

      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
        }));
      }
    } catch (err) {
      console.error('Fetch geofences error:', err);
      setError(err.message || 'Failed to fetch geofences');
      setGeofences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (geofence) => {
    try {
      const response = await lorawanAPI.getGeofenceById(geofence.geofence_id);
      setSelectedGeofence(response.data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Error fetching geofence details:', err);
      alert(`❌ ${err.message || 'Failed to fetch geofence details'}`);
    }
  };

  const handleViewMap = (geofence) => {
    setSelectedGeofence(geofence);
    setIsMapModalOpen(true);
  };

  const handleEditGeofence = (geofence) => {
    setSelectedGeofence(geofence);
    setIsGeofenceModalOpen(true);
  };

  const handleDeleteGeofence = async (geofenceId, geofenceName) => {
    if (window.confirm(`Delete geofence "${geofenceName}"?\n\nThis action cannot be undone and will:\n• Remove all device assignments\n• Delete geofence configuration\n• Stop all geofence alerts\n\nAre you sure?`)) {
      try {
        await lorawanAPI.deleteGeofence(geofenceId);
        alert('✅ Geofence deleted successfully');
        fetchGeofences();
      } catch (err) {
        console.error('Delete error:', err);
        alert(`❌ ${err.message || 'Failed to delete geofence'}`);
      }
    }
  };

  const handleAssignDevices = (geofence) => {
    setSelectedGeofence(geofence);
    setIsAssignModalOpen(true);
  };

  const getGeofenceIcon = (type) => {
    return type === 'Circle' ? <FiCircle /> : <IoShapesOutline />;
  };

  const getGeofenceColor = (type) => {
    return type === 'Circle' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  const filteredGeofences = geofences.filter(geo => {
    if (searchTerm) {
      const name = (geo.geofence_name || '').toLowerCase();
      if (!name.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  const totalDevices = geofences.reduce((sum, geo) => sum + (geo.device_count || 0), 0);
  const activeGeofences = geofences.filter(geo => geo.is_active).length;
  const circleGeofences = geofences.filter(geo => geo.geofence_type === 'Circle').length;
  const polygonGeofences = geofences.filter(geo => geo.geofence_type === 'Polygon').length;

  if (loading && geofences.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading geofences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-secondary-700 flex items-center gap-3">
                <IoLocationOutline className="text-primary-500" />
                Geofence Management
              </h1>
              <p className="text-sm text-gray-500 mt-1 ml-11">
                Create and manage location-based zones with alerts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchGeofences}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50"
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={() => {
                  setSelectedGeofence(null);
                  setIsGeofenceModalOpen(true);
                }}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <FiPlus />
                New Geofence
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Geofences */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-primary-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <IoLocationOutline className="text-2xl text-white" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <FiMapPin className="text-primary-600" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Geofences</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{geofences.length}</p>
                <span className="text-xs text-gray-400">zones</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary-600">
                <FiCheckCircle className="text-sm" />
                <span className="font-medium">All zones</span>
              </div>
            </div>
          </div>

          {/* Active Geofences */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiCheckCircle className="text-2xl text-white" />
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Active</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{activeGeofences}</p>
                <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                  {geofences.length > 0 ? ((activeGeofences / geofences.length) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                <FiCheckCircle className="text-sm" />
                <span className="font-medium">Monitoring zones</span>
              </div>
            </div>
          </div>

          {/* Geofence Types */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <IoShapesOutline className="text-2xl text-white" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <FiLayers className="text-blue-600" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Types</p>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-lg font-bold text-gray-900">{circleGeofences}</p>
                  <p className="text-xs text-gray-500">Circle</p>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{polygonGeofences}</p>
                  <p className="text-xs text-gray-500">Polygon</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-blue-600">
                <FiLayers className="text-sm" />
                <span className="font-medium">Zone types</span>
              </div>
            </div>
          </div>

          {/* Total Devices */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiUsers className="text-2xl text-white" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <IoNavigateCircleOutline className="text-purple-600" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tracked Devices</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{totalDevices}</p>
                <span className="text-xs text-gray-400">devices</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-purple-600">
                <FiUsers className="text-sm" />
                <span className="font-medium">In geofences</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[300px] relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search geofences by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
              />
            </div>

            {/* Organization Filter */}
            <select
              value={filterOrganization}
              onChange={(e) => {
                setFilterOrganization(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">🏢 All Organizations</option>
              {organizations.map(org => (
                <option key={org.organization_id} value={org.organization_id}>
                  {org.organization_name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">🗺️ All Types</option>
              <option value="Circle">⭕ Circle</option>
              <option value="Polygon">🔷 Polygon</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">⚙️ All Status</option>
              <option value="true">✓ Active</option>
              <option value="false">✗ Inactive</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md transition text-sm ${
                  viewMode === 'grid' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md transition text-sm ${
                  viewMode === 'list' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>

            {(searchTerm || filterOrganization !== 'all' || filterType !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterOrganization('all');
                  setFilterType('all');
                  setFilterStatus('all');
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <FiXCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Geofences Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGeofences.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <IoLocationOutline className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No geofences found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm ? 'Try adjusting your search or filters' : 'Click "New Geofence" to create your first zone'}
                </p>
              </div>
            ) : (
              filteredGeofences.map((geofence) => (
                <div
                  key={geofence.geofence_id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-md">
                          {geofenceIcon(geofence.geofence_type)}
                          <IoLocationOutline className="text-white text-xl" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition">
                            {geofence.geofence_name}
                          </h3>
                          <p className="text-xs text-gray-500">{geofence.organization_name}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        geofence.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {geofence.is_active ? '● Active' : '○ Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Type & Location */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getGeofenceColor(geofence.geofence_type)}`}>
                          {getGeofenceIcon(geofence.geofence_type)}
                          {geofence.geofence_type}
                        </span>
                      </div>

                      {geofence.geofence_type === 'Circle' && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Radius:</span>
                            <span className="font-semibold text-gray-900">{geofence.radius_meters}m</span>
                          </div>
                          <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 font-mono">
                            📍 {geofence.center_latitude?.toFixed(4)}, {geofence.center_longitude?.toFixed(4)}
                          </div>
                        </>
                      )}

                      {geofence.geofence_type === 'Polygon' && (
                        <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                          🔷 {geofence.polygon_coordinates?.length || 0} vertices
                        </div>
                      )}
                    </div>

                    {/* Devices */}
                    <div className="flex items-center justify-between py-3 px-4 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2">
                        <FiUsers className="text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">Devices</span>
                      </div>
                      <span className="text-lg font-bold text-purple-600">{geofence.device_count || 0}</span>
                    </div>

                    {/* Alerts */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {geofence.alert_on_enter && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                          <FiAlertCircle className="text-sm" />
                          Enter Alert
                        </div>
                      )}
                      {geofence.alert_on_exit && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs">
                          <FiAlertCircle className="text-sm" />
                          Exit Alert
                        </div>
                      )}
                      {!geofence.alert_on_enter && !geofence.alert_on_exit && (
                        <span className="text-xs text-gray-400">No alerts</span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(geofence)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleViewMap(geofence)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View on Map"
                      >
                        <FiMap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAssignDevices(geofence)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Assign Devices"
                      >
                        <FiUsers className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditGeofence(geofence)}
                        className="p-2 text-secondary-600 hover:bg-secondary-50 rounded-lg transition"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGeofence(geofence.geofence_id, geofence.geofence_name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* List View - Continue in next part */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* List view table here */}
          </div>
        )}

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
      {isGeofenceModalOpen && (
        <GeofenceModal
          geofence={selectedGeofence}
          organizations={organizations}
          onClose={() => {
            setIsGeofenceModalOpen(false);
            setSelectedGeofence(null);
          }}
          onSuccess={() => {
            setIsGeofenceModalOpen(false);
            setSelectedGeofence(null);
            fetchGeofences();
          }}
        />
      )}

      {isDetailsModalOpen && selectedGeofence && (
        <GeofenceDetailsModal
          geofence={selectedGeofence}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedGeofence(null);
          }}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            setIsGeofenceModalOpen(true);
          }}
          onRefresh={fetchGeofences}
        />
      )}

      {isMapModalOpen && selectedGeofence && (
        <GeofenceMapModal
          geofence={selectedGeofence}
          onClose={() => {
            setIsMapModalOpen(false);
            setSelectedGeofence(null);
          }}
        />
      )}

      {isAssignModalOpen && selectedGeofence && (
        <AssignGeofenceModal
          geofence={selectedGeofence}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedGeofence(null);
          }}
          onSuccess={() => {
            setIsAssignModalOpen(false);
            setSelectedGeofence(null);
            fetchGeofences();
          }}
        />
      )}
    </div>
  );
};

export default Geofences;
