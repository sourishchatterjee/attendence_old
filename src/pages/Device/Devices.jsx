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
  FiXCircle,
  FiSearch,
  FiRefreshCw,
  FiDownload,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiBarChart2,
  FiMapPin,
  FiUser,
  FiAlertCircle,
  FiThermometer,
  FiDroplet,
  FiWind,
  FiNavigation,
  FiClock
} from 'react-icons/fi';
import { 
  IoStatsChart, 
  IoHardwareChipOutline,
  IoBusiness,
  IoLocationSharp,
  IoWater,
  IoFlame
} from 'react-icons/io5';
import { 
  HiViewGrid,
  HiViewList 
} from 'react-icons/hi';
import {
  MdDoorFront,
  MdSensors,
  MdDevices,
  MdSpeed
} from 'react-icons/md';
import {
  BsLightningChargeFill
} from 'react-icons/bs';
import { HiMiniSignal } from "react-icons/hi2";
import {
  GiWalk
} from 'react-icons/gi';
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
      alert(`Failed to fetch device details: ${err.message}`);
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
        alert('Device deleted successfully');
        fetchDevices();
      } catch (err) {
        console.error('Delete error:', err);
        alert(`Failed to delete device: ${err.message}`);
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

  // Replace emoji icons with React Icons
  const getDeviceTypeIcon = (type) => {
    const iconMap = {
      'Temperature': <FiThermometer className="text-2xl" />,
      'Humidity': <FiDroplet className="text-2xl" />,
      'Pressure': <MdSpeed className="text-2xl" />,
      'Gas': <FiWind className="text-2xl" />,
      'Motion': <GiWalk className="text-2xl" />,
      'Door': <MdDoorFront className="text-2xl" />,
      'Water': <IoWater className="text-2xl" />,
      'Smoke': <IoFlame className="text-2xl" />,
      'GPS': <FiNavigation className="text-2xl" />,
      'Electricity': <BsLightningChargeFill className="text-2xl" />,
      'Other': <MdDevices className="text-2xl" />,
    };
    return iconMap[type] || <MdSensors className="text-2xl" />;
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
                <FiDownload className="w-5 h-5" />
                Export CSV
              </button>
              <button
                onClick={() => {
                  setSelectedDevice(null);
                  setIsDeviceModalOpen(true);
                }}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <FiPlus className="w-5 h-5" />
                Add Device
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
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

        {/* Advanced Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
          <div className="flex flex-wrap gap-3 items-center mb-3">
            {/* Search */}
            <div className="flex-1 min-w-[300px] relative">
              <input
                type="text"
                placeholder="Search by name, EUI, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                title="Grid View"
              >
                <HiViewGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md transition text-sm ${
                  viewMode === 'list' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List View"
              >
                <HiViewList className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={fetchDevices}
              disabled={loading}
              className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Second Row Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <IoBusiness className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={filterOrganization}
                onChange={(e) => {
                  setFilterOrganization(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
              >
                <option value="all">All Organizations</option>
                {organizations.map(org => (
                  <option key={org.organization_id} value={org.organization_id}>
                    {org.organization_name}
                  </option>
                ))}
              </select>
            </div>

            {filterOrganization !== 'all' && (
              <>
                <div className="relative">
                  <IoLocationSharp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={filterSite}
                    onChange={(e) => {
                      setFilterSite(e.target.value);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
                  >
                    <option value="all">All Sites</option>
                    {sites.map(site => (
                      <option key={site.site_id} value={site.site_id}>
                        {site.site_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={filterEmployee}
                    onChange={(e) => {
                      setFilterEmployee(e.target.value);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
                  >
                    <option value="all">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.first_name} {emp.last_name} ({emp.employee_code})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="relative">
              <MdSensors className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={filterProfile}
                onChange={(e) => {
                  setFilterProfile(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
              >
                <option value="all">All Profiles</option>
                {profiles.map(profile => (
                  <option key={profile.profile_id} value={profile.profile_id}>
                    {profile.profile_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <MdDevices className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
              >
                <option value="all">All Types</option>
                {deviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <HiMiniSignal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={filterConnectivity}
                onChange={(e) => setFilterConnectivity(e.target.value)}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
              >
                <option value="all">All Connectivity</option>
                <option value="online">Online Only</option>
                <option value="offline">Offline Only</option>
              </select>
            </div>

            <div className="relative">
              <FiPower className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

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
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-medium flex items-center gap-1"
              >
                <FiXCircle className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Results Summary */}
        {filteredDevices.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4 flex items-center justify-between">
            <span className="text-sm text-blue-800 flex items-center gap-2">
              <FiBarChart2 className="w-4 h-4" />
              Showing <strong>{filteredDevices.length}</strong> of <strong>{devices.length}</strong> devices
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
                <MdDevices className="text-6xl mx-auto mb-4 text-gray-300" />
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
                        <div className="text-primary-600">
                          {getDeviceTypeIcon(device.device_type)}
                        </div>
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
                        <FiUser className="w-4 h-4 text-purple-600" />
                        <span className="text-purple-900 font-medium truncate text-xs">
                          {device.employee_name}
                        </span>
                      </div>
                    )}

                    {/* Site */}
                    {device.site_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <FiMapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 truncate text-xs">{device.site_name}</span>
                      </div>
                    )}

                    {/* Last Seen */}
                    <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded p-2">
                      <div className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        <span>Last Seen:</span>
                      </div>
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
                        className="px-2 py-1.5 text-primary-600 hover:bg-primary-50 rounded transition text-xs font-medium flex items-center gap-1"
                        title="View Details"
                      >
                        <FiEye className="w-3 h-3" />
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
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                        title="Analytics"
                      >
                        <FiBarChart2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditDevice(device)}
                        className="p-1.5 text-secondary-500 hover:bg-secondary-50 rounded transition"
                        title="Edit"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDevice(device.device_id, device.device_name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
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
                        <MdDevices className="text-6xl mx-auto mb-4 text-gray-300" />
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
                            <div className="text-gray-600">
                              {getDeviceTypeIcon(device.device_type)}
                            </div>
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
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {device.employee_name ? (
                            <div className="flex items-center gap-1">
                              <FiUser className="w-3 h-3 text-gray-400" />
                              {device.employee_name}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {device.site_name ? (
                            <div className="flex items-center gap-1">
                              <FiMapPin className="w-3 h-3 text-gray-400" />
                              {device.site_name}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FiClock className="w-3 h-3 text-gray-400" />
                            {formatLastSeen(device.last_seen_at, device.minutes_since_seen)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleViewDetails(device)}
                              className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleViewAnalytics(device)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                              title="Analytics"
                            >
                              <FiBarChart2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditDevice(device)}
                              className="p-1.5 text-secondary-500 hover:bg-secondary-50 rounded transition"
                              title="Edit"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDevice(device.device_id, device.device_name)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
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
