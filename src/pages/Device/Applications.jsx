import React, { useState, useEffect } from 'react';
import { 
  FiPackage, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiCode,
  FiLink,
  FiSettings,
  FiUsers,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { 
  IoAppsOutline,
  IoCodeSlashOutline,
  IoGlobeOutline,
  IoLayersOutline
} from 'react-icons/io5';
import { lorawanAPI } from '../../services/lorawanAPI';
import { organizationAPI } from '../../services/organizationAPI';
import ApplicationModal from '../../components/LoRaWAN/ApplicationModal';
import ApplicationDetailsModal from '../../components/LoRaWAN/ApplicationDetailsModal';
import AssignDeviceModal from '../../components/LoRaWAN/AssignDeviceModal';
import Pagination from '../../components/Pagination';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAssignDeviceModalOpen, setIsAssignDeviceModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
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
    fetchApplications();
  }, [pagination.page, filterOrganization, filterStatus]);

  const fetchOrganizations = async () => {
    try {
      const response = await organizationAPI.getAllOrganizations({ pageSize: 100 });
      setOrganizations(response.data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchApplications = async () => {
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
      if (filterStatus !== 'all') {
        params.is_active = filterStatus === 'true';
      }

      const response = await lorawanAPI.getAllApplications(params);
      
      const applicationsData = response.data || response || [];
      setApplications(Array.isArray(applicationsData) ? applicationsData : []);

      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
        }));
      }
    } catch (err) {
      console.error('Fetch applications error:', err);
      setError(err.message || 'Failed to fetch applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (application) => {
    try {
      const response = await lorawanAPI.getApplicationById(application.application_id);
      setSelectedApplication(response.data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Error fetching application details:', err);
      alert(`❌ ${err.message || 'Failed to fetch application details'}`);
    }
  };

  const handleEditApplication = (application) => {
    setSelectedApplication(application);
    setIsApplicationModalOpen(true);
  };

  const handleDeleteApplication = async (applicationId, applicationName) => {
    if (window.confirm(`Delete application "${applicationName}"?\n\nThis action cannot be undone and will:\n• Remove all device assignments\n• Delete application configuration\n• Stop all data forwarding\n\nAre you sure?`)) {
      try {
        await lorawanAPI.deleteApplication(applicationId);
        alert('✅ Application deleted successfully');
        fetchApplications();
      } catch (err) {
        console.error('Delete error:', err);
        alert(`❌ ${err.message || 'Failed to delete application'}`);
      }
    }
  };

  const handleAssignDevices = (application) => {
    setSelectedApplication(application);
    setIsAssignDeviceModalOpen(true);
  };

  const getCodecIcon = (codec) => {
    const icons = {
      'CUSTOM': <IoCodeSlashOutline className="text-purple-600" />,
      'CAYENNE_LPP': <IoLayersOutline className="text-blue-600" />,
      'JSON': <FiCode className="text-green-600" />,
      'NONE': <FiXCircle className="text-gray-400" />,
    };
    return icons[codec] || <FiCode className="text-gray-600" />;
  };

  const getCodecColor = (codec) => {
    const colors = {
      'CUSTOM': 'bg-purple-100 text-purple-800',
      'CAYENNE_LPP': 'bg-blue-100 text-blue-800',
      'JSON': 'bg-green-100 text-green-800',
      'NONE': 'bg-gray-100 text-gray-800',
    };
    return colors[codec] || 'bg-gray-100 text-gray-800';
  };

  const filteredApplications = applications.filter(app => {
    if (searchTerm) {
      const name = (app.application_name || '').toLowerCase();
      const desc = (app.application_description || '').toLowerCase();
      if (!name.includes(searchTerm.toLowerCase()) && 
          !desc.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  const totalDevices = applications.reduce((sum, app) => sum + (app.device_count || 0), 0);
  const activeApps = applications.filter(app => app.is_active).length;
  const appsWithWebhook = applications.filter(app => app.webhook_url).length;
  const appsWithMQTT = applications.filter(app => app.mqtt_topic_prefix).length;

  if (loading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading applications...</p>
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
                <IoAppsOutline className="text-primary-500" />
                LoRaWAN Applications
              </h1>
              <p className="text-sm text-gray-500 mt-1 ml-11">
                Manage applications, integrations, and device assignments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchApplications}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50"
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={() => {
                  setSelectedApplication(null);
                  setIsApplicationModalOpen(true);
                }}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <FiPlus />
                New Application
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Applications */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-primary-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <IoAppsOutline className="text-2xl text-white" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <FiPackage className="text-primary-600" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Applications</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
                <span className="text-xs text-gray-400">apps</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary-600">
                <FiCheckCircle className="text-sm" />
                <span className="font-medium">All applications</span>
              </div>
            </div>
          </div>

          {/* Active Applications */}
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
                <p className="text-3xl font-bold text-gray-900">{activeApps}</p>
                <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                  {applications.length > 0 ? ((activeApps / applications.length) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                <FiCheckCircle className="text-sm" />
                <span className="font-medium">Running apps</span>
              </div>
            </div>
          </div>

          {/* Total Devices */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiUsers className="text-2xl text-white" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <IoLayersOutline className="text-blue-600" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Devices</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{totalDevices}</p>
                <span className="text-xs text-gray-400">devices</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-blue-600">
                <FiSettings className="text-sm" />
                <span className="font-medium">Assigned devices</span>
              </div>
            </div>
          </div>

          {/* Integrations */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiLink className="text-2xl text-white" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <IoGlobeOutline className="text-purple-600" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Integrations</p>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-lg font-bold text-gray-900">{appsWithWebhook}</p>
                  <p className="text-xs text-gray-500">Webhooks</p>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{appsWithMQTT}</p>
                  <p className="text-xs text-gray-500">MQTT</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-purple-600">
                <FiLink className="text-sm" />
                <span className="font-medium">Active connections</span>
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
                placeholder="Search applications by name or description..."
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

            {(searchTerm || filterOrganization !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterOrganization('all');
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

        {/* Applications Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <IoAppsOutline className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No applications found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm ? 'Try adjusting your search or filters' : 'Click "New Application" to create your first application'}
                </p>
              </div>
            ) : (
              filteredApplications.map((app) => (
                <div
                  key={app.application_id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-primary-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-md">
                          <IoAppsOutline className="text-white text-xl" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition">
                            {app.application_name}
                          </h3>
                          <p className="text-xs text-gray-500">{app.organization_name}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        app.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {app.is_active ? '● Active' : '○ Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Description */}
                    {app.application_description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {app.application_description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <FiUsers className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Devices</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{app.device_count || 0}</span>
                    </div>

                    {/* Codec */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Payload Codec:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getCodecColor(app.payload_codec)}`}>
                        {getCodecIcon(app.payload_codec)}
                        {app.payload_codec || 'NONE'}
                      </span>
                    </div>

                    {/* Integrations */}
                    <div className="flex flex-wrap gap-2">
                      {app.webhook_url && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs">
                          <FiLink className="text-sm" />
                          Webhook
                        </div>
                      )}
                      {app.mqtt_topic_prefix && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                          <IoLayersOutline className="text-sm" />
                          MQTT
                        </div>
                      )}
                      {!app.webhook_url && !app.mqtt_topic_prefix && (
                        <span className="text-xs text-gray-400">No integrations</span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(app)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAssignDevices(app)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Assign Devices"
                      >
                        <FiUsers className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditApplication(app)}
                        className="p-2 text-secondary-600 hover:bg-secondary-50 rounded-lg transition"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteApplication(app.application_id, app.application_name)}
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
          /* List View */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary-50 to-purple-50 border-b-2 border-primary-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Application</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Devices</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Codec</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Integrations</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <IoAppsOutline className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No applications found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchTerm ? 'Try adjusting your search or filters' : 'Click "New Application" to create your first application'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr key={app.application_id} className="hover:bg-blue-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                              <IoAppsOutline className="text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{app.application_name}</div>
                              {app.application_description && (
                                <div className="text-xs text-gray-500 line-clamp-1">{app.application_description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{app.organization_name}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                            {app.device_count || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getCodecColor(app.payload_codec)}`}>
                            {getCodecIcon(app.payload_codec)}
                            {app.payload_codec || 'NONE'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {app.webhook_url && (
                              <FiLink className="text-orange-600" title="Webhook" />
                            )}
                            {app.mqtt_topic_prefix && (
                              <IoLayersOutline className="text-green-600" title="MQTT" />
                            )}
                            {!app.webhook_url && !app.mqtt_topic_prefix && (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {app.is_active ? (
                            <FiCheckCircle className="text-green-600 mx-auto text-xl" />
                          ) : (
                            <FiXCircle className="text-gray-400 mx-auto text-xl" />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetails(app)}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAssignDevices(app)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Assign Devices"
                            >
                              <FiUsers className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditApplication(app)}
                              className="p-2 text-secondary-600 hover:bg-secondary-50 rounded-lg transition"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteApplication(app.application_id, app.application_name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
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
      {isApplicationModalOpen && (
        <ApplicationModal
          application={selectedApplication}
          organizations={organizations}
          onClose={() => {
            setIsApplicationModalOpen(false);
            setSelectedApplication(null);
          }}
          onSuccess={() => {
            setIsApplicationModalOpen(false);
            setSelectedApplication(null);
            fetchApplications();
          }}
        />
      )}

      {isDetailsModalOpen && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedApplication(null);
          }}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            setIsApplicationModalOpen(true);
          }}
          onRefresh={fetchApplications}
        />
      )}

      {isAssignDeviceModalOpen && selectedApplication && (
        <AssignDeviceModal
          application={selectedApplication}
          onClose={() => {
            setIsAssignDeviceModalOpen(false);
            setSelectedApplication(null);
          }}
          onSuccess={() => {
            setIsAssignDeviceModalOpen(false);
            setSelectedApplication(null);
            fetchApplications();
          }}
        />
      )}
    </div>
  );
};

export default Applications;
