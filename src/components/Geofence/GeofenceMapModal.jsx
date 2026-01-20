import React from 'react';
import { MapContainer, TileLayer, Circle, Polygon, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FiMapPin, FiCircle } from 'react-icons/fi';
import { IoLocationOutline, IoShapesOutline } from 'react-icons/io5';

const GeofenceMapModal = ({ geofence, onClose }) => {
  const getMapCenter = () => {
    if (geofence.geofence_type === 'Circle') {
      return [geofence.center_latitude, geofence.center_longitude];
    } else if (geofence.polygon_coordinates && geofence.polygon_coordinates.length > 0) {
      return [geofence.polygon_coordinates[0].lat, geofence.polygon_coordinates[0].lng];
    }
    return [19.0760, 72.8777]; // Default
  };

  const getPolygonPositions = () => {
    if (geofence.polygon_coordinates) {
      return geofence.polygon_coordinates.map(coord => [coord.lat, coord.lng]);
    }
    return [];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition bg-white rounded-full p-2 shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-lg">
                <IoLocationOutline className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{geofence.geofence_name}</h3>
                <p className="text-sm text-gray-500">
                  {geofence.geofence_type === 'Circle' ? (
                    <span className="flex items-center gap-1">
                      <FiCircle className="text-blue-600" />
                      Circle • {geofence.radius_meters}m radius
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <IoShapesOutline className="text-purple-600" />
                      Polygon • {geofence.polygon_coordinates?.length} vertices
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="h-[600px] rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg">
            <MapContainer
              center={getMapCenter()}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {geofence.geofence_type === 'Circle' && (
                <>
                  <Marker position={[geofence.center_latitude, geofence.center_longitude]}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">{geofence.geofence_name}</p>
                        <p className="text-xs text-gray-600">Center Point</p>
                        <p className="text-xs font-mono">
                          {geofence.center_latitude.toFixed(6)}, {geofence.center_longitude.toFixed(6)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[geofence.center_latitude, geofence.center_longitude]}
                    radius={geofence.radius_meters}
                    pathOptions={{
                      color: '#3b82f6',
                      fillColor: '#3b82f6',
                      fillOpacity: 0.2,
                      weight: 3,
                    }}
                  />
                </>
              )}

              {geofence.geofence_type === 'Polygon' && (
                <>
                  {getPolygonPositions().map((point, idx) => (
                    <Marker key={idx} position={point}>
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold">Point {idx + 1}</p>
                          <p className="text-xs font-mono">
                            {point[0].toFixed(6)}, {point[1].toFixed(6)}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  <Polygon
                    positions={getPolygonPositions()}
                    pathOptions={{
                      color: '#a855f7',
                      fillColor: '#a855f7',
                      fillOpacity: 0.2,
                      weight: 3,
                    }}
                  />
                </>
              )}
            </MapContainer>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <FiMapPin className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Geofence Type</span>
              </div>
              <p className="text-lg font-bold text-blue-900">{geofence.geofence_type}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <FiCircle className="text-green-600" />
                <span className="text-sm font-semibold text-green-900">
                  {geofence.geofence_type === 'Circle' ? 'Radius' : 'Vertices'}
                </span>
              </div>
              <p className="text-lg font-bold text-green-900">
                {geofence.geofence_type === 'Circle' 
                  ? `${geofence.radius_meters}m` 
                  : geofence.polygon_coordinates?.length}
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <IoLocationOutline className="text-purple-600" />
                <span className="text-sm font-semibold text-purple-900">Status</span>
              </div>
              <p className={`text-lg font-bold ${geofence.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                {geofence.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 mt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm"
            >
              Close Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeofenceMapModal;
