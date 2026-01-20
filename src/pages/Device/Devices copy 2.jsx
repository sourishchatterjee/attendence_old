import React, { useState, useEffect } from 'react';
import { lorawanAPI } from '../../services/lorawanAPI';
import { organizationAPI } from '../../services/organizationAPI';
import { siteAPI } from '../../services/siteAPI';
import { employeeAPI } from '../../services/employeeAPI';
import DeviceModal from '../../components/device/DeviceModal';
import DeviceDetailsModal from '../../components/device/DeviceDetailsModal';
import DeviceKeysModal from '../../components/device/DeviceKeysModal';
import DeviceAnalyticsModal from '../../components/device/DeviceAnalyticsModal';
import Pagination from '../../components/Pagination';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [sites, setSites] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [filterSite, setFilterSite] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterProfile, setFilterProfile] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterConnectivity, setFilterConnectivity] = useState('all'); // 'online', 'offline', 'all'
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isKeysModalOpen, setIsKeysModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0,
  });

  const deviceTypes = [
    'Temperature', 'Humidity', 'Pressure', 'Gas', 'Motion', 
    'Door', 'Water', 'Smoke', 'GPS', 'Electricity', 'Other'
  ];

  useEffect(() => {
    fetchOrganizations();
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (filterOrganization !== 'all') {
      fetchSites();
      fetchEmployees();
    } else {
      setSites([]);
      setEmployees([]);
      setFilterSite('all');
      setFilterEmployee('all');
    }
  }, [filterOrganization]);

  useEffect(() => {
    fetchDevices();
  }, [pagination.page, filterOrganization, filterSite, filterEmployee, filterProfile, filterType, filterStatus]);

  const fetchOrganizations = async () => {
    try {
      const response = await organizationAPI.getAllOrganizations({ pageSize: 100 });
      setOrganizations(response.data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await siteAPI.getAllSites({ 
        organization_id: filterOrganization,
        pageSize: 100 
      });
      setSites(response.data || []);
    } catch (err) {
      console.error('Error fetching sites:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAllEmployees({ 
        organization_id: filterOrganization,
        pageSize: 1000 
      });
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchProfiles = async () => {
    try {
      const response = await lorawanAPI.getAllProfiles({ pageSize: 100 });
      setProfiles(response.data || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    }
  };

  const fetchDevices = async () => {
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
      if (filterSite !== 'all') {
        params.site_id = parseInt(filterSite, 10);
      }
      if (filterEmployee !== 'all') {
        params.employee_id = parseInt(filterEmployee, 10);
      }
      if (filterProfile !== 'all') {
        params.device_profile_id = parseInt(filterProfile, 10);
      }
      if (filterType !== 'all') {
        params.device_type = filterType;
      }
      if (filterStatus !== 'all') {
        params.is_active = filterStatus === 'true';
      }

      const response = await lorawanAPI.getAllDevices(params);
      
      const devicesData = response.data || response || [];
      setDevices(Array.isArray(devicesData) ? devicesData : []);
      
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
        }));
      }
    } catch (err) {
      console.error('Fetch devices error:', err);
      setError(err.message || 'Failed to fetch devices');
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (device) => {
    try {
      const response = await lorawanAPI.getDeviceById(device.device_id);
      setSelectedDevice(response.data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Error fetching device details:', err);
      alert(`❌ ${err.message || 'Failed to fetch device details'}`);
    }
  };

  const handleViewKeys = (device) => {
    setSelectedDevice(device);
    setIsKeysModalOpen(true);
  };

  const handleViewAnalytics = (device) => {
    setSelectedDevice(device);
    setIsAnalyticsModalOpen(true);
  };

  const handleEditDevice = (device) => {
    setSelectedDevice(device);
    setIsDeviceModalOpen(true);
  };

  const handleDeleteDevice = async (deviceId, deviceName) => {
    if (window.confirm(`Delete device "${deviceName}"?\n\nThis action cannot be undone and will remove all associated data including:\n• Device telemetry history\n• Device configuration\n• Device keys\n\nAre you sure?`)) {
      try {
        await lorawanAPI.deleteDevice(deviceId);
        alert('✅ Device deleted successfully');
        fetchDevices();
      } catch (err) {
        console.error('Delete error:', err);
        alert(`❌ ${err.message || 'Failed to delete device'}`);
      }
    }
  };

  const handleBulkExport = () => {
    const csvContent = [
      ['Device Name', 'Device EUI', 'Type', 'Status', 'Organization', 'Site', 'Employee', 'Profile', 'Last Seen'].join(','),
      ...filteredDevices.map(device => [
        device.device_name,
        device.dev_eui,
        device.device_type,
        getStatusText(device.minutes_since_seen, device.is_disabled),
        device.organization_name || '',
        device.site_name || '',
        device.employee_name || '',
        device.profile_name || '',
        device.last_seen_at || 'Never'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devices_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (minutesSinceSeen, isDisabled) => {
    if (isDisabled) return 'bg-gray-400 text-white';
    if (minutesSinceSeen === null || minutesSinceSeen === undefined) {
      return 'bg-gray-400 text-white';
    }
    if (minutesSinceSeen < 10) return 'bg-green-500 text-white';
    if (minutesSinceSeen < 30) return 'bg-yellow-500 text-white';
    if (minutesSinceSeen < 120) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getStatusText = (minutesSinceSeen, isDisabled) => {
    if (isDisabled) return 'Disabled';
    if (minutesSinceSeen === null || minutesSinceSeen === undefined) {
      return 'Never Seen';
    }
    if (minutesSinceSeen < 10) return 'Online';
    if (minutesSinceSeen < 30) return 'Active';
    if (minutesSinceSeen < 120) return 'Inactive';
    return 'Offline';
  };

  const formatLastSeen = (dateString, minutesSinceSeen) => {
    if (!dateString) return 'Never';
    if (minutesSinceSeen < 1) return 'Just now';
    if (minutesSinceSeen < 60) return `${Math.floor(minutesSinceSeen)}m ago`;
    
    const hours = Math.floor(minutesSinceSeen / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getDeviceTypeIcon = (type) => {
    const icons = {
      'Temperature': '🌡️',
      'Humidity': '💧',
      'Pressure': '📊',
      'Gas': '💨',
      'Motion': '🚶',
      'Door': '🚪',
      'Water': '🌊',
      'Smoke': '🔥',
      'GPS': '📍',
      'Electricity': '⚡',
      'Other': '📱',
    };
    return icons[type] || '📱';
  };

  const filteredDevices = devices.filter(device => {
    // Search filter
    if (searchTerm) {
      const name = (device.device_name || '').toLowerCase();
      const eui = (device.dev_eui || '').toLowerCase();
      const type = (device.device_type || '').toLowerCase();
      if (!name.includes(searchTerm.toLowerCase()) && 
          !eui.includes(searchTerm.toLowerCase()) &&
          !type.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    // Connectivity filter
    if (filterConnectivity === 'online' && (device.is_disabled || device.minutes_since_seen === null || device.minutes_since_seen >= 10)) {
      return false;
    }
    if (filterConnectivity === 'offline' && !device.is_disabled && device.minutes_since_seen !== null && device.minutes_since_seen < 10) {
      return false;
    }

    return true;
  });

  const onlineDevices = devices.filter(d => !d.is_disabled && d.minutes_since_seen !== null && d.minutes_since_seen < 10);
  const offlineDevices = devices.filter(d => !d.is_disabled && (d.minutes_since_seen === null || d.minutes_since_seen >= 120));
  const disabledDevices = devices.filter(d => d.is_disabled);
  const activeDevices = devices.filter(d => !d.is_disabled && d.minutes_since_seen !== null && d.minutes_since_seen >= 10 && d.minutes_since_seen < 120);

  if (loading && devices.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading devices...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">IoT Device Management</h1>
              <p className="text-sm text-gray-500 mt-1">Monitor, manage, and analyze your connected devices</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBulkExport}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={() => {
                  setSelectedDevice(null);
                  setIsDeviceModalOpen(true);
                }}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Device
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">📱</div>
              <div className="h-8 w-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-blue-100 mb-1">Total Devices</p>
            <p className="text-3xl font-bold">{devices.length}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">✅</div>
              <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
            </div>
            <p className="text-sm text-green-100 mb-1">Online</p>
            <p className="text-3xl font-bold">{onlineDevices.length}</p>
            <p className="text-xs text-green-100 mt-1">
              {devices.length > 0 ? ((onlineDevices.length / devices.length) * 100).toFixed(1) : 0}% connected
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">⚡</div>
              <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
            </div>
            <p className="text-sm text-yellow-100 mb-1">Active</p>
            <p className="text-3xl font-bold">{activeDevices.length}</p>
            <p className="text-xs text-yellow-100 mt-1">Recently seen</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">❌</div>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm text-red-100 mb-1">Offline</p>
            <p className="text-3xl font-bold">{offlineDevices.length}</p>
            <p className="text-xs text-red-100 mt-1">Need attention</p>
          </div>

          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">🚫</div>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <p className="text-sm text-gray-100 mb-1">Disabled</p>
            <p className="text-3xl font-bold">{disabledDevices.length}</p>
            <p className="text-xs text-gray-100 mt-1">Inactive units</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">📊</div>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-purple-100 mb-1">Uptime</p>
            <p className="text-3xl font-bold">
              {devices.length > 0 ? ((onlineDevices.length / devices.length) * 100).toFixed(0) : 0}%
            </p>
            <p className="text-xs text-purple-100 mt-1">Network health</p>
          </div>
        </div>

        {/* Advanced Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
          <div className="flex flex-wrap gap-3 items-center mb-3">
            {/* Search */}
            <div className="flex-1 min-w-[300px] relative">
              <input
                type="text"
                placeholder="🔍 Search by name, EUI, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md transition text-sm ${
                  viewMode === 'list' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <button
              onClick={fetchDevices}
              disabled={loading}
              className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Second Row Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={filterOrganization}
              onChange={(e) => {
                setFilterOrganization(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">🏢 All Organizations</option>
              {organizations.map(org => (
                <option key={org.organization_id} value={org.organization_id}>
                  {org.organization_name}
                </option>
              ))}
            </select>

            {filterOrganization !== 'all' && (
              <>
                <select
                  value={filterSite}
                  onChange={(e) => {
                    setFilterSite(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
                >
                  <option value="all">📍 All Sites</option>
                  {sites.map(site => (
                    <option key={site.site_id} value={site.site_id}>
                      {site.site_name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterEmployee}
                  onChange={(e) => {
                    setFilterEmployee(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
                >
                  <option value="all">👤 All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_code})
                    </option>
                  ))}
                </select>
              </>
            )}

            <select
              value={filterProfile}
              onChange={(e) => {
                setFilterProfile(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">📋 All Profiles</option>
              {profiles.map(profile => (
                <option key={profile.profile_id} value={profile.profile_id}>
                  {profile.profile_name}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">🔧 All Types</option>
              {deviceTypes.map(type => (
                <option key={type} value={type}>{getDeviceTypeIcon(type)} {type}</option>
              ))}
            </select>

            <select
              value={filterConnectivity}
              onChange={(e) => setFilterConnectivity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">📶 All Connectivity</option>
              <option value="online">✅ Online Only</option>
              <option value="offline">❌ Offline Only</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">⚙️ All Status</option>
              <option value="true">✓ Active</option>
              <option value="false">✗ Inactive</option>
            </select>

            {(searchTerm || filterOrganization !== 'all' || filterSite !== 'all' || filterEmployee !== 'all' || 
              filterProfile !== 'all' || filterType !== 'all' || filterConnectivity !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterOrganization('all');
                  setFilterSite('all');
                  setFilterEmployee('all');
                  setFilterProfile('all');
                  setFilterType('all');
                  setFilterConnectivity('all');
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Results Summary */}
        {filteredDevices.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4 flex items-center justify-between">
            <span className="text-sm text-blue-800">
              📊 Showing <strong>{filteredDevices.length}</strong> of <strong>{devices.length}</strong> devices
            </span>
            {filteredDevices.length !== devices.length && (
              <span className="text-xs text-blue-600">
                {devices.length - filteredDevices.length} filtered out
              </span>
            )}
          </div>
        )}

        {/* Devices Grid/List View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDevices.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-gray-500 text-lg font-medium">No devices found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm ? 'Try adjusting your search or filters' : 'Click "Add Device" to register your first IoT device'}
                </p>
              </div>
            ) : (
              filteredDevices.map((device) => (
                <div
                  key={device.device_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group"
                >
                  {/* Device Card Header */}
                  <div className={`px-4 py-3 border-b border-gray-200 ${
                    device.is_disabled ? 'bg-gray-100' : 'bg-gradient-to-r from-blue-50 to-purple-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="text-3xl">{getDeviceTypeIcon(device.device_type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(device.minutes_since_seen, device.is_disabled)} ${!device.is_disabled && 'animate-pulse'}`}></div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(device.minutes_since_seen, device.is_disabled)}`}>
                              {getStatusText(device.minutes_since_seen, device.is_disabled)}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-primary-600 transition">
                            {device.device_name || 'Unnamed Device'}
                          </h3>
                          <p className="text-xs text-gray-600 font-mono mt-0.5 truncate">{device.dev_eui || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Device Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Type & Profile */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {device.device_type || 'N/A'}
                      </span>
                      <span className="text-xs text-gray-600 truncate ml-2">{device.profile_name || 'No Profile'}</span>
                    </div>

                    {/* Employee */}
                    {device.employee_name && (
                      <div className="flex items-center gap-2 text-sm bg-purple-50 rounded p-2">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-purple-900 font-medium truncate text-xs">
                          {device.employee_name}
                        </span>
                      </div>
                    )}

                    {/* Site */}
                    {device.site_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-600 truncate text-xs">{device.site_name}</span>
                      </div>
                    )}

                    {/* Last Seen */}
                    <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded p-2">
                      <span>Last Seen:</span>
                      <span className="font-semibold">{formatLastSeen(device.last_seen_at, device.minutes_since_seen)}</span>
                    </div>

                    {/* Dev Addr */}
                    {device.dev_addr && (
                      <div className="text-xs text-gray-600 font-mono bg-gray-100 rounded p-2 text-center">
                        DevAddr: {device.dev_addr}
                      </div>
                    )}
                  </div>

                  {/* Device Card Actions */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewDetails(device)}
                        className="px-2 py-1.5 text-primary-600 hover:bg-primary-50 rounded transition text-xs font-medium"
                        title="View Details"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleViewKeys(device)}
                        className="px-2 py-1.5 text-blue-600 hover:bg-blue-50 rounded transition text-xs font-medium"
                        title="View Keys"
                      >
                        Keys
                      </button>
                      <button
                        onClick={() => handleViewAnalytics(device)}
                        className="px-2 py-1.5 text-green-600 hover:bg-green-50 rounded transition text-xs font-medium"
                        title="Analytics"
                      >
                        📊
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditDevice(device)}
                        className="p-1.5 text-secondary-500 hover:bg-secondary-50 rounded transition"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteDevice(device.device_id, device.device_name)}
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
        ) : (
          /* List View */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Device</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Profile</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Site</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Seen</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDevices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <div className="text-6xl mb-4">📱</div>
                        <p className="text-gray-500 text-lg font-medium">No devices found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchTerm ? 'Try adjusting your search or filters' : 'Click "Add Device" to register your first IoT device'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredDevices.map((device) => (
                      <tr key={device.device_id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${getStatusColor(device.minutes_since_seen, device.is_disabled)} ${!device.is_disabled && 'animate-pulse'}`}></div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(device.minutes_since_seen, device.is_disabled)}`}>
                              {getStatusText(device.minutes_since_seen, device.is_disabled)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="text-2xl">{getDeviceTypeIcon(device.device_type)}</div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{device.device_name || 'Unnamed'}</div>
                              <div className="text-xs text-gray-600 font-mono">{device.dev_eui}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                            {device.device_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{device.profile_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{device.employee_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{device.site_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatLastSeen(device.last_seen_at, device.minutes_since_seen)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleViewDetails(device)}
                              className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition"
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleViewAnalytics(device)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                              title="Analytics"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEditDevice(device)}
                              className="p-1.5 text-secondary-500 hover:bg-secondary-50 rounded transition"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteDevice(device.device_id, device.device_name)}
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
      {isDeviceModalOpen && (
        <DeviceModal
          device={selectedDevice}
          organizations={organizations}
          profiles={profiles}
          onClose={() => {
            setIsDeviceModalOpen(false);
            setSelectedDevice(null);
          }}
          onSuccess={() => {
            setIsDeviceModalOpen(false);
            setSelectedDevice(null);
            fetchDevices();
          }}
        />
      )}

      {isDetailsModalOpen && selectedDevice && (
        <DeviceDetailsModal
          device={selectedDevice}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedDevice(null);
          }}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            setIsDeviceModalOpen(true);
          }}
          onRefresh={fetchDevices}
        />
      )}

      {isKeysModalOpen && selectedDevice && (
        <DeviceKeysModal
          device={selectedDevice}
          onClose={() => {
            setIsKeysModalOpen(false);
            setSelectedDevice(null);
          }}
        />
      )}

      {isAnalyticsModalOpen && selectedDevice && (
        <DeviceAnalyticsModal
          device={selectedDevice}
          onClose={() => {
            setIsAnalyticsModalOpen(false);
            setSelectedDevice(null);
          }}
        />
      )}
    </div>
  );
};

export default Devices;
