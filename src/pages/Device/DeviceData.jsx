import React, { useState, useEffect } from 'react';
import { 
  FiActivity, 
  FiDatabase, 
  FiDownload, 
  FiSend,
  FiRefreshCw,
  FiFilter,
  FiCalendar,
  FiLayers
} from 'react-icons/fi';
import { 
  IoStatsChart,
  IoSpeedometer,
  IoWifiOutline
} from 'react-icons/io5';
import { lorawanAPI } from '../../services/lorawanAPI';
import TelemetryChart from '../../components/device/TelemetryChart';
import DeviceDataTable from '../../components/device/DeviceDataTable';
import DownlinkModal from '../../components/device/DownlinkModal';
import Pagination from '../../components/Pagination';

const DeviceData = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [telemetryData, setTelemetryData] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [latestTelemetry, setLatestTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry', 'raw', 'charts'
  const [dateRange, setDateRange] = useState({
    from_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0],
  });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [isDownlinkModalOpen, setIsDownlinkModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    totalItems: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceData();
      fetchLatestTelemetry();
    }
  }, [selectedDevice, dateRange, pagination.page]);

  useEffect(() => {
    let interval;
    if (autoRefresh && selectedDevice) {
      interval = setInterval(() => {
        fetchDeviceData();
        fetchLatestTelemetry();
      }, refreshInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, selectedDevice, refreshInterval]);

  const fetchDevices = async () => {
    try {
      const response = await lorawanAPI.getAllDevices({ pageSize: 1000 });
      const devicesData = response.data || response || [];
      setDevices(Array.isArray(devicesData) ? devicesData : []);
      if (devicesData.length > 0) {
        setSelectedDevice(devicesData[0]);
      }
    } catch (err) {
      console.error('Error fetching devices:', err);
    }
  };

  const fetchDeviceData = async () => {
    if (!selectedDevice) return;

    try {
      setLoading(true);
      setError(null);

      const params = {
        device_id: selectedDevice.device_id,
        from_date: dateRange.from_date,
        to_date: dateRange.to_date,
        page: pagination.page,
        pageSize: pagination.pageSize,
      };

      // Fetch telemetry
      const telemetryResponse = await lorawanAPI.getDeviceTelemetry(params);
      const telemetryDataArray = telemetryResponse.data || telemetryResponse || [];
      setTelemetryData(Array.isArray(telemetryDataArray) ? telemetryDataArray : []);

      // Fetch raw data
      const rawDataResponse = await lorawanAPI.getDeviceData(params);
      const rawDataArray = rawDataResponse.data || rawDataResponse || [];
      setRawData(Array.isArray(rawDataArray) ? rawDataArray : []);

      if (rawDataResponse.pagination) {
        setPagination(prev => ({
          ...prev,
          ...rawDataResponse.pagination,
        }));
      }
    } catch (err) {
      console.error('Fetch device data error:', err);
      setError(err.message || 'Failed to fetch device data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestTelemetry = async () => {
    if (!selectedDevice) return;

    try {
      const response = await lorawanAPI.getLatestTelemetry(selectedDevice.device_id);
      setLatestTelemetry(response.data);
    } catch (err) {
      console.error('Error fetching latest telemetry:', err);
    }
  };

  const handleExport = async (format) => {
    if (!selectedDevice) {
      alert('Please select a device first');
      return;
    }

    try {
      await lorawanAPI.exportDeviceData({
        device_id: selectedDevice.device_id,
        from_date: dateRange.from_date,
        to_date: dateRange.to_date,
        format: format,
      });
      alert(`✅ Export started in ${format.toUpperCase()} format`);
    } catch (err) {
      console.error('Export error:', err);
      alert(`❌ ${err.message || 'Failed to export data'}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getSignalQuality = (rssi) => {
    if (rssi >= -70) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (rssi >= -85) return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (rssi >= -100) return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { label: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-secondary-700 flex items-center gap-3">
                <FiDatabase className="text-primary-500" />
                Device Data & Telemetry
              </h1>
              <p className="text-sm text-gray-500 mt-1 ml-11">
                Real-time monitoring and historical data analysis
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDownlinkModalOpen(true)}
                disabled={!selectedDevice}
                className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition font-medium flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend />
                Send Downlink
              </button>
              <div className="relative">
                <button
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
                  onClick={() => document.getElementById('export-menu').classList.toggle('hidden')}
                >
                  <FiDownload />
                  Export Data
                </button>
                <div
                  id="export-menu"
                  className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10"
                >
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition first:rounded-t-lg"
                  >
                    📄 Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition"
                  >
                    📋 Export as JSON
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition last:rounded-b-lg"
                  >
                    📊 Export as Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Device Selector & Controls */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Device Selector */}
            <div className="flex-1 min-w-[300px]">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                Select Device
              </label>
              <select
                value={selectedDevice?.device_id || ''}
                onChange={(e) => {
                  const device = devices.find(d => d.device_id === parseInt(e.target.value));
                  setSelectedDevice(device);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
              >
                {devices.map(device => (
                  <option key={device.device_id} value={device.device_id}>
                    {device.device_name} ({device.dev_eui})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="flex gap-2 items-end">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                  <FiCalendar className="inline mr-1" />
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.from_date}
                  onChange={(e) => setDateRange({ ...dateRange, from_date: e.target.value })}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.to_date}
                  onChange={(e) => setDateRange({ ...dateRange, to_date: e.target.value })}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Auto Refresh */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Auto-refresh</span>
              </label>
              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                  <option value={60000}>1m</option>
                  <option value={300000}>5m</option>
                </select>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => {
                fetchDeviceData();
                fetchLatestTelemetry();
              }}
              disabled={loading}
              className="px-4 py-2.5 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Latest Telemetry Cards */}
        {latestTelemetry && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
            {latestTelemetry.temperature !== null && latestTelemetry.temperature !== undefined && (
              <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-bl-full"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg text-xl">
                      🌡️
                    </div>
                    <IoStatsChart className="text-orange-500 text-xl" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Temperature</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900">{latestTelemetry.temperature.toFixed(1)}</p>
                    <span className="text-xs text-gray-600">°C</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(latestTelemetry.timestamp)}</p>
                </div>
              </div>
            )}

            {latestTelemetry.humidity !== null && latestTelemetry.humidity !== undefined && (
              <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-bl-full"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg text-xl">
                      💧
                    </div>
                    <IoStatsChart className="text-blue-500 text-xl" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Humidity</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900">{latestTelemetry.humidity.toFixed(1)}</p>
                    <span className="text-xs text-gray-600">%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(latestTelemetry.timestamp)}</p>
                </div>
              </div>
            )}

            {latestTelemetry.pressure !== null && latestTelemetry.pressure !== undefined && (
              <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-bl-full"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg text-xl">
                      📊
                    </div>
                    <IoSpeedometer className="text-purple-500 text-xl" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Pressure</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900">{latestTelemetry.pressure.toFixed(0)}</p>
                    <span className="text-xs text-gray-600">hPa</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(latestTelemetry.timestamp)}</p>
                </div>
              </div>
            )}

            {latestTelemetry.battery_level !== null && latestTelemetry.battery_level !== undefined && (
              <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-bl-full"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg text-xl">
                      🔋
                    </div>
                    <FiActivity className="text-green-500 text-xl" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Battery</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900">{latestTelemetry.battery_level}</p>
                    <span className="text-xs text-gray-600">%</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                      style={{ width: `${latestTelemetry.battery_level}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {latestTelemetry.latitude !== null && latestTelemetry.longitude !== null && (
              <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-bl-full"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg text-xl">
                      📍
                    </div>
                    <IoWifiOutline className="text-red-500 text-xl" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Location</p>
                  <div className="text-xs text-gray-900">
                    <p className="font-mono">{latestTelemetry.latitude.toFixed(4)}</p>
                    <p className="font-mono">{latestTelemetry.longitude.toFixed(4)}</p>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${latestTelemetry.latitude},${latestTelemetry.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-red-600 hover:text-red-700 mt-1 inline-block"
                  >
                    View Map →
                  </a>
                </div>
              </div>
            )}

            <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-bl-full"></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <FiLayers className="text-white text-xl" />
                  </div>
                  <FiActivity className="text-indigo-500 text-xl" />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Records</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900">{pagination.totalItems || 0}</p>
                </div>
                <p className="text-xs text-indigo-600 mt-1 font-medium">Data points</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
                activeTab === 'telemetry'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FiActivity />
              Telemetry Data
              {telemetryData.length > 0 && (
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                  {telemetryData.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
                activeTab === 'raw'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FiDatabase />
              Raw Data
              {rawData.length > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {rawData.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
                activeTab === 'charts'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <IoStatsChart />
              Charts & Analytics
            </button>
          </div>

          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="text-gray-500 ml-3">Loading data...</p>
              </div>
            ) : !selectedDevice ? (
              <div className="text-center py-12">
                <FiFilter className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No device selected</p>
                <p className="text-gray-400 text-sm mt-1">Please select a device to view its data</p>
              </div>
            ) : (
              <>
                {/* Telemetry Tab */}
                {activeTab === 'telemetry' && (
                  <DeviceDataTable 
                    data={telemetryData} 
                    type="telemetry"
                    formatDate={formatDate}
                  />
                )}

                {/* Raw Data Tab */}
                {activeTab === 'raw' && (
                  <DeviceDataTable 
                    data={rawData} 
                    type="raw"
                    formatDate={formatDate}
                    getSignalQuality={getSignalQuality}
                  />
                )}

                {/* Charts Tab */}
                {activeTab === 'charts' && (
                  <TelemetryChart 
                    data={telemetryData}
                    deviceName={selectedDevice?.device_name}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && activeTab === 'raw' && (
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

      {/* Downlink Modal */}
      {isDownlinkModalOpen && selectedDevice && (
        <DownlinkModal
          device={selectedDevice}
          onClose={() => setIsDownlinkModalOpen(false)}
          onSuccess={() => {
            setIsDownlinkModalOpen(false);
            alert('✅ Downlink message queued successfully');
          }}
        />
      )}
    </div>
  );
};

export default DeviceData;
