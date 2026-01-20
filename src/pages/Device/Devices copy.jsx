import React, { useState, useEffect } from 'react';
import { 
  FiZap, 
  FiWifi, 
  FiWifiOff, 
  FiPower, 
  FiActivity, 
  FiTrendingUp,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle
} from 'react-icons/fi';
import { 
  IoStatsChart, 
  IoHardwareChipOutline 
} from 'react-icons/io5';
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
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [filterSite, setFilterSite] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterProfile, setFilterProfile] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterConnectivity, setFilterConnectivity] = useState('all');
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

  // ... (keep all your existing useEffect and fetch functions)

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

  // ... (keep all your existing handler functions)

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
  const uptimePercentage = devices.length > 0 ? ((onlineDevices.length / devices.length) * 100).toFixed(1) : 0;

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
              <h1 className="text-3xl font-bold text-secondary-700 flex items-center gap-3">
                <IoHardwareChipOutline className="text-primary-500" />
                IoT Device Management
              </h1>
              <p className="text-sm text-gray-500 mt-1 ml-11">Monitor, manage, and analyze your connected devices</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBulkExport}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
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
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Device
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards with React Icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {/* Total Devices Card */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-primary-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <IoHardwareChipOutline className="text-2xl text-white" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <FiActivity className="text-primary-600" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Devices</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{devices.length}</p>
                <span className="text-xs text-gray-400">units</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary-600">
                <FiTrendingUp className="text-sm" />
                <span className="font-medium">All connected devices</span>
              </div>
            </div>
          </div>

          {/* Online Devices Card */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiWifi className="text-2xl text-white" />
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Online Now</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{onlineDevices.length}</p>
                <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                  {((onlineDevices.length / (devices.length || 1)) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                <FiCheckCircle className="text-sm" />
                <span className="font-medium">Active connections</span>
              </div>
            </div>
          </div>

          {/* Active Devices Card */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiZap className="text-2xl text-white" />
                </div>
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse shadow-lg shadow-yellow-500/50"></div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Recently Active</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{activeDevices.length}</p>
                <span className="text-xs text-gray-400">units</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-yellow-600">
                <FiActivity className="text-sm" />
                <span className="font-medium">Last 2 hours</span>
              </div>
            </div>
          </div>

          {/* Offline Devices Card */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiWifiOff className="text-2xl text-white" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <FiAlertTriangle className="text-red-600" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Offline</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{offlineDevices.length}</p>
                <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full">
                  Alert
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-red-600">
                <FiXCircle className="text-sm" />
                <span className="font-medium">Need attention</span>
              </div>
            </div>
          </div>

          {/* Disabled Devices Card */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-500/10 to-gray-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiPower className="text-2xl text-white" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <FiXCircle className="text-gray-600" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Disabled</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{disabledDevices.length}</p>
                <span className="text-xs text-gray-400">units</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-gray-600">
                <FiPower className="text-sm" />
                <span className="font-medium">Inactive units</span>
              </div>
            </div>
          </div>

          {/* Network Uptime Card */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <IoStatsChart className="text-2xl text-white" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <FiTrendingUp className="text-purple-600" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Network Uptime</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{uptimePercentage}%</p>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${uptimePercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-purple-600 mt-1 font-medium">Network health</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of your component remains the same... */}
        {/* Advanced Filters Bar, Devices Grid/List, Pagination, Modals, etc. */}
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
