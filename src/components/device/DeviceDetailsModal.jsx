import React from 'react';

const DeviceDetailsModal = ({ device, onClose, onEdit, onRefresh }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
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

  const minutesSinceSeen = device.minutes_since_seen;
  const isDisabled = device.is_disabled;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-5xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
          <div className="absolute top-4 right-4 z-10">
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
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="text-5xl">{getDeviceTypeIcon(device.device_type)}</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{device.device_name || 'Device Details'}</h3>
                  <p className="text-sm text-gray-600 font-mono mt-1">{device.dev_eui || 'N/A'}</p>
                  <p className="text-sm text-gray-600 mt-1">{device.organization_name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${getStatusColor(minutesSinceSeen, isDisabled)} ${!isDisabled && 'animate-pulse'}`}></div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(minutesSinceSeen, isDisabled)}`}>
                    {getStatusText(minutesSinceSeen, isDisabled)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    device.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                  }`}>
                    {device.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {device.device_type || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            {device.device_description && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded p-3 border border-gray-200">
                {device.device_description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Basic Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Device ID:</span>
                    <span className="font-semibold text-blue-900">{device.device_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Device EUI:</span>
                    <span className="font-semibold text-blue-900 font-mono text-xs">{device.dev_eui || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Device Address:</span>
                    <span className="font-semibold text-blue-900 font-mono">{device.dev_addr || 'Not Activated'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Device Type:</span>
                    <span className="font-semibold text-blue-900">{device.device_type || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Created:</span>
                    <span className="font-semibold text-blue-900">{formatDate(device.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Last Seen:</span>
                    <span className="font-semibold text-blue-900">{formatDate(device.last_seen_at)}</span>
                  </div>
                </div>
              </div>

              {/* Organization & Assignment */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Organization & Assignment
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-700">Organization:</span>
                    <span className="font-semibold text-purple-900">{device.organization_name || 'N/A'}</span>
                  </div>
                  {device.site_name && (
                    <div className="flex justify-between">
                      <span className="text-purple-700">Site:</span>
                      <span className="font-semibold text-purple-900">{device.site_name}</span>
                    </div>
                  )}
                  {device.employee_name && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Assigned To:</span>
                        <span className="font-semibold text-purple-900">{device.employee_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Employee Code:</span>
                        <span className="font-semibold text-purple-900">{device.employee_code}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Device Profile */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Device Profile
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Profile Name:</span>
                    <span className="font-semibold text-green-900">{device.profile_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">LoRaWAN Region:</span>
                    <span className="font-semibold text-green-900">{device.lorawan_region || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">LoRaWAN Version:</span>
                    <span className="font-semibold text-green-900">{device.lorawan_version || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Latest Telemetry */}
              {device.latest_telemetry && Object.keys(device.latest_telemetry).length > 0 && (
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h4 className="text-sm font-semibold text-orange-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Latest Telemetry
                  </h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(device.latest_telemetry).map(([key, value]) => {
                      if (key === 'timestamp') {
                        return (
                          <div key={key} className="flex justify-between border-t border-orange-300 pt-2 mt-2">
                            <span className="text-orange-700">Timestamp:</span>
                            <span className="font-semibold text-orange-900 text-xs">{formatDate(value)}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={key} className="flex justify-between">
                          <span className="text-orange-700 capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="font-semibold text-orange-900">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Security Settings */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Security Settings
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-red-700">Frame Counter Check:</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      device.skip_fcnt_check 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {device.skip_fcnt_check ? 'Disabled ⚠️' : 'Enabled ✓'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-700">Device Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      device.is_disabled 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {device.is_disabled ? 'Disabled' : 'Enabled'}
                    </span>
                  </div>
                  <div className="text-xs text-red-700 bg-red-100 rounded p-2 mt-2">
                    🔒 Security keys are hidden. Use "View Keys" button to access them.
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <h4 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Advanced Settings
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-indigo-700">Reference Altitude:</span>
                    <span className="font-semibold text-indigo-900">
                      {device.reference_altitude !== null && device.reference_altitude !== undefined 
                        ? `${device.reference_altitude}m` 
                        : '0m'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {device.tags && Object.keys(device.tags).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(device.tags).map(([key, value]) => (
                      <span key={key} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                        <span className="font-semibold">{key}:</span> {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Variables */}
              {device.variables && Object.keys(device.variables).length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-3">Variables</h4>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(device.variables, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-6 border-t mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
            >
              Close
            </button>
            <button
              onClick={() => {
                onEdit();
              }}
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm"
            >
              Edit Device
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailsModal;
