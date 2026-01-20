import React from 'react';

const GatewayDetailsModal = ({ gateway, onClose, onEdit, onRefresh }) => {
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

  const getStatusColor = (minutesSinceSeen) => {
    if (minutesSinceSeen === null || minutesSinceSeen === undefined) {
      return 'bg-gray-400 text-white';
    }
    if (minutesSinceSeen < 5) return 'bg-green-500 text-white';
    if (minutesSinceSeen < 15) return 'bg-yellow-500 text-white';
    if (minutesSinceSeen < 60) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getStatusText = (minutesSinceSeen) => {
    if (minutesSinceSeen === null || minutesSinceSeen === undefined) {
      return 'Never Seen';
    }
    if (minutesSinceSeen < 5) return 'Online';
    if (minutesSinceSeen < 15) return 'Recently Active';
    if (minutesSinceSeen < 60) return 'Inactive';
    return 'Offline';
  };

  const minutesSinceSeen = gateway.minutes_since_seen;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{gateway.gateway_name || 'Gateway Details'}</h3>
                <p className="text-sm text-gray-600 font-mono mt-1">{gateway.gateway_eui || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${getStatusColor(minutesSinceSeen)} animate-pulse`}></div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(minutesSinceSeen)}`}>
                  {getStatusText(minutesSinceSeen)}
                </span>
                {gateway.is_active ? (
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-400 text-white rounded-full text-xs font-semibold">
                    Inactive
                  </span>
                )}
              </div>
            </div>
            {gateway.gateway_description && (
              <p className="text-sm text-gray-600">{gateway.gateway_description}</p>
            )}
          </div>

          {/* Organization & Site Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">Organization & Site</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700">Organization</p>
                <p className="font-semibold text-blue-900">{gateway.organization_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-blue-700">Site</p>
                <p className="font-semibold text-blue-900">{gateway.site_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-blue-700">Gateway ID</p>
                <p className="font-semibold text-blue-900">{gateway.gateway_id}</p>
              </div>
              <div>
                <p className="text-blue-700">Last Seen</p>
                <p className="font-semibold text-blue-900">{formatDate(gateway.last_seen_at)}</p>
              </div>
            </div>
          </div>

          {/* Location Information */}
          {(gateway.latitude || gateway.longitude || gateway.altitude) && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-6">
              <h4 className="text-sm font-semibold text-green-900 mb-3">Location Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {gateway.latitude && (
                  <div>
                    <p className="text-green-700">Latitude</p>
                    <p className="font-semibold text-green-900">{gateway.latitude.toFixed(6)}</p>
                  </div>
                )}
                {gateway.longitude && (
                  <div>
                    <p className="text-green-700">Longitude</p>
                    <p className="font-semibold text-green-900">{gateway.longitude.toFixed(6)}</p>
                  </div>
                )}
                {gateway.altitude !== null && gateway.altitude !== undefined && (
                  <div>
                    <p className="text-green-700">Altitude</p>
                    <p className="font-semibold text-green-900">{gateway.altitude} meters</p>
                  </div>
                )}
              </div>
              {gateway.latitude && gateway.longitude && (
                <div className="mt-3">
                  <a
                    href={`https://www.google.com/maps?q=${gateway.latitude},${gateway.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-900 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    View on Google Maps
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Technical Specifications */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mb-6">
            <h4 className="text-sm font-semibold text-purple-900 mb-3">Technical Specifications</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {gateway.gateway_model && (
                <div>
                  <p className="text-purple-700">Gateway Model</p>
                  <p className="font-semibold text-purple-900">{gateway.gateway_model}</p>
                </div>
              )}
              {gateway.gateway_board && (
                <div>
                  <p className="text-purple-700">Gateway Board</p>
                  <p className="font-semibold text-purple-900">{gateway.gateway_board}</p>
                </div>
              )}
              <div>
                <p className="text-purple-700">Stats Interval</p>
                <p className="font-semibold text-purple-900">{gateway.stats_interval || 30}s</p>
              </div>
              {gateway.antenna_type && (
                <div>
                  <p className="text-purple-700">Antenna Type</p>
                  <p className="font-semibold text-purple-900">{gateway.antenna_type}</p>
                </div>
              )}
              {gateway.antenna_gain && (
                <div>
                  <p className="text-purple-700">Antenna Gain</p>
                  <p className="font-semibold text-purple-900">{gateway.antenna_gain} dBi</p>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {gateway.tags && Object.keys(gateway.tags).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(gateway.tags).map(([key, value]) => (
                  <span key={key} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                    <span className="font-semibold">{key}:</span> {value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {gateway.metadata && Object.keys(gateway.metadata).length > 0 && (
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 mb-6">
              <h4 className="text-sm font-semibold text-indigo-900 mb-3">Metadata</h4>
              <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(gateway.metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* System Information */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">System Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Created At</p>
                <p className="font-semibold text-gray-900">{formatDate(gateway.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-semibold text-gray-900">{gateway.is_active ? 'Active' : 'Inactive'}</p>
              </div>
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
              Edit Gateway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GatewayDetailsModal;
