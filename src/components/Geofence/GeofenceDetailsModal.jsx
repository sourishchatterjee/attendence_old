import React from 'react';
import { 
  FiMapPin, 
  FiEdit2,
  FiAlertCircle,
  FiCheckCircle,
  FiCircle,
  FiUsers
} from 'react-icons/fi';
import { 
  IoLocationOutline,
  IoShapesOutline
} from 'react-icons/io5';


const GeofenceDetailsModal = ({ geofence, onClose, onEdit, onRefresh }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'N/A';
    }
  };


  const getGeofenceIcon = () => {
    return geofence.geofence_type === 'Circle' 
      ? { icon: <FiCircle />, color: 'text-blue-600', bg: 'bg-blue-100' }
      : { icon: <IoShapesOutline />, color: 'text-purple-600', bg: 'bg-purple-100' };
  };


  const typeIcon = getGeofenceIcon();


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
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <IoLocationOutline className="text-3xl text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{geofence.geofence_name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{geofence.organization_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  geofence.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {geofence.is_active ? '● Active' : '○ Inactive'}
                </span>
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  Basic Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Geofence ID:</span>
                    <span className="font-semibold text-blue-900">{geofence.geofence_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Type:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${typeIcon.bg} ${typeIcon.color}`}>
                      {typeIcon.icon}
                      {geofence.geofence_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Organization:</span>
                    <span className="font-semibold text-blue-900">{geofence.organization_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Created:</span>
                    <span className="font-semibold text-blue-900">{formatDate(geofence.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Status:</span>
                    <span className={`font-semibold ${geofence.is_active ? 'text-green-700' : 'text-gray-700'}`}>
                      {geofence.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>


              {/* Location Details */}
              {geofence.geofence_type === 'Circle' && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <FiCircle className="w-4 h-4" />
                    Circle Configuration
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-green-700 mb-1">Center Coordinates:</p>
                      <code className="block bg-white px-3 py-2 rounded text-sm font-mono text-gray-900 border border-green-300">
                        {geofence.center_latitude?.toFixed(6)}, {geofence.center_longitude?.toFixed(6)}
                      </code>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 mb-1">Radius:</p>
                      <div className="bg-white px-3 py-2 rounded border border-green-300">
                        <span className="text-2xl font-bold text-green-900">{geofence.radius_meters}</span>
                        <span className="text-sm text-green-700 ml-2">meters</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 mb-1">Approximate Area:</p>
                      <div className="bg-white px-3 py-2 rounded border border-green-300">
                        <span className="text-lg font-bold text-green-900">
                          {(Math.PI * Math.pow(geofence.radius_meters, 2)).toFixed(0)}
                        </span>
                        <span className="text-sm text-green-700 ml-2">square meters</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {geofence.geofence_type === 'Polygon' && geofence.polygon_coordinates && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <IoShapesOutline className="w-4 h-4" />
                    Polygon Configuration
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-purple-700 mb-1">Total Vertices:</p>
                      <div className="bg-white px-3 py-2 rounded border border-purple-300">
                        <span className="text-2xl font-bold text-purple-900">{geofence.polygon_coordinates.length}</span>
                        <span className="text-sm text-purple-700 ml-2">points</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-purple-700 mb-2">Coordinates:</p>
                      <div className="bg-white rounded border border-purple-300 max-h-48 overflow-y-auto">
                        {geofence.polygon_coordinates.map((coord, idx) => (
                          <div key={idx} className="px-3 py-2 border-b border-purple-100 last:border-b-0">
                            <span className="text-xs font-semibold text-purple-900">Point {idx + 1}:</span>
                            <code className="text-xs text-gray-700 ml-2">
                              {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>


            {/* Right Column */}
            <div className="space-y-6">
              {/* Assigned Devices */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h4 className="text-sm font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <FiUsers className="w-4 h-4" />
                  Assigned Devices
                </h4>
                <div className="text-center py-4">
                  <div className="text-5xl font-bold text-orange-600 mb-2">
                    {geofence.device_count || 0}
                  </div>
                  <p className="text-sm text-orange-700">Devices monitoring this zone</p>
                </div>
              </div>


              {/* Alert Settings */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <FiAlertCircle className="w-4 h-4" />
                  Alert Configuration
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded border border-red-300">
                    <div className="flex items-center gap-2">
                      <FiAlertCircle className={geofence.alert_on_enter ? 'text-green-600' : 'text-gray-400'} />
                      <span className="text-sm font-medium text-gray-900">Alert on Enter</span>
                    </div>
                    {geofence.alert_on_enter ? (
                      <FiCheckCircle className="text-green-600 text-xl" />
                    ) : (
                      <span className="text-xs text-gray-500">Disabled</span>
                    )}
                  </div>


                  <div className="flex items-center justify-between p-3 bg-white rounded border border-red-300">
                    <div className="flex items-center gap-2">
                      <FiAlertCircle className={geofence.alert_on_exit ? 'text-orange-600' : 'text-gray-400'} />
                      <span className="text-sm font-medium text-gray-900">Alert on Exit</span>
                    </div>
                    {geofence.alert_on_exit ? (
                      <FiCheckCircle className="text-green-600 text-xl" />
                    ) : (
                      <span className="text-xs text-gray-500">Disabled</span>
                    )}
                  </div>
                </div>
              </div>


              {/* Map Preview Info */}
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <h4 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  Map Information
                </h4>
                <div className="space-y-2 text-sm text-indigo-800">
                  <p>• Click "View on Map" to see the geofence visualization</p>
                  <p>• Real-time device locations shown within the zone</p>
                  <p>• Interactive map with zoom and pan controls</p>
                  {geofence.geofence_type === 'Circle' && (
                    <p>• Circular boundary with {geofence.radius_meters}m radius</p>
                  )}
                  {geofence.geofence_type === 'Polygon' && (
                    <p>• Custom polygon with {geofence.polygon_coordinates?.length} vertices</p>
                  )}
                </div>
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
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm flex items-center justify-center gap-2"
            >
              <FiEdit2 />
              Edit Geofence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default GeofenceDetailsModal;
