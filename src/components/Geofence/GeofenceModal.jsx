import React, { useState, useEffect } from 'react';
import { 
  FiMapPin, 
  FiCircle,
  FiAlertCircle,
  FiSettings
} from 'react-icons/fi';
import { 
  IoLocationOutline,
  IoShapesOutline
} from 'react-icons/io5';
import { MapContainer, TileLayer, Circle, Polygon, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { lorawanAPI } from '../../services/lorawanAPI';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GeofenceModal = ({ geofence, organizations, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'map'
  const [formData, setFormData] = useState({
    organization_id: '',
    geofence_name: '',
    geofence_type: 'Circle',
    center_latitude: 19.0760,
    center_longitude: 72.8777,
    radius_meters: 500,
    polygon_coordinates: [],
    alert_on_enter: true,
    alert_on_exit: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]);
  const [circleCenter, setCircleCenter] = useState([19.0760, 72.8777]);
  const [polygonPoints, setPolygonPoints] = useState([]);

  useEffect(() => {
    if (geofence) {
      const coords = geofence.geofence_type === 'Circle' 
        ? [geofence.center_latitude, geofence.center_longitude]
        : geofence.polygon_coordinates?.[0] 
          ? [geofence.polygon_coordinates[0].lat, geofence.polygon_coordinates[0].lng]
          : [19.0760, 72.8777];

      setMapCenter(coords);
      setCircleCenter(coords);

      if (geofence.geofence_type === 'Polygon' && geofence.polygon_coordinates) {
        setPolygonPoints(geofence.polygon_coordinates.map(coord => [coord.lat, coord.lng]));
      }

      setFormData({
        organization_id: geofence.organization_id || '',
        geofence_name: geofence.geofence_name || '',
        geofence_type: geofence.geofence_type || 'Circle',
        center_latitude: geofence.center_latitude || 19.0760,
        center_longitude: geofence.center_longitude || 72.8777,
        radius_meters: geofence.radius_meters || 500,
        polygon_coordinates: geofence.polygon_coordinates || [],
        alert_on_enter: geofence.alert_on_enter !== undefined ? geofence.alert_on_enter : true,
        alert_on_exit: geofence.alert_on_exit !== undefined ? geofence.alert_on_exit : true,
      });
    }
  }, [geofence]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }
    if (!formData.geofence_name || formData.geofence_name.trim() === '') {
      newErrors.geofence_name = 'Geofence name is required';
    }
    if (formData.geofence_type === 'Circle') {
      if (!formData.radius_meters || formData.radius_meters < 10) {
        newErrors.radius_meters = 'Radius must be at least 10 meters';
      }
      if (!formData.center_latitude || !formData.center_longitude) {
        newErrors.center = 'Center coordinates are required';
      }
    }
    if (formData.geofence_type === 'Polygon') {
      if (!polygonPoints || polygonPoints.length < 3) {
        newErrors.polygon = 'Polygon must have at least 3 points';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        organization_id: parseInt(formData.organization_id, 10),
        geofence_name: formData.geofence_name.trim(),
        geofence_type: formData.geofence_type,
        alert_on_enter: formData.alert_on_enter,
        alert_on_exit: formData.alert_on_exit,
      };

      if (formData.geofence_type === 'Circle') {
        submitData.center_latitude = parseFloat(circleCenter[0]);
        submitData.center_longitude = parseFloat(circleCenter[1]);
        submitData.radius_meters = parseInt(formData.radius_meters, 10);
      } else {
        submitData.polygon_coordinates = polygonPoints.map(point => ({
          lat: parseFloat(point[0]),
          lng: parseFloat(point[1]),
        }));
      }

      if (geofence) {
        await lorawanAPI.updateGeofence(geofence.geofence_id, submitData);
        alert('✅ Geofence updated successfully');
      } else {
        await lorawanAPI.createGeofence(submitData);
        alert('✅ Geofence created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to save geofence'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (formData.geofence_type === 'Circle') {
          setCircleCenter([e.latlng.lat, e.latlng.lng]);
          setFormData({
            ...formData,
            center_latitude: e.latlng.lat,
            center_longitude: e.latlng.lng,
          });
        } else {
          setPolygonPoints([...polygonPoints, [e.latlng.lat, e.latlng.lng]]);
        }
      },
    });
    return null;
  };

  const clearPolygonPoints = () => {
    setPolygonPoints([]);
  };

  const removeLastPoint = () => {
    setPolygonPoints(polygonPoints.slice(0, -1));
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
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <IoLocationOutline className="text-2xl text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-secondary-700">
              {geofence ? 'Edit Geofence' : 'Create New Geofence'}
            </h3>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'details'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiSettings />
              Details
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'map'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiMapPin />
              Map Configuration
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <>
                {/* Organization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Organization <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="organization_id"
                    value={formData.organization_id}
                    onChange={handleChange}
                    disabled={!!geofence}
                    className={`w-full px-3 py-2 border ${
                      errors.organization_id ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:bg-gray-100`}
                  >
                    <option value="">Select Organization</option>
                    {organizations.map(org => (
                      <option key={org.organization_id} value={org.organization_id}>
                        {org.organization_name}
                      </option>
                    ))}
                  </select>
                  {errors.organization_id && (
                    <p className="text-red-500 text-xs mt-1">{errors.organization_id}</p>
                  )}
                </div>

                {/* Geofence Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Geofence Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="geofence_name"
                    value={formData.geofence_name}
                    onChange={handleChange}
                    placeholder="e.g., Office Zone"
                    className={`w-full px-3 py-2 border ${
                      errors.geofence_name ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  />
                  {errors.geofence_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.geofence_name}</p>
                  )}
                </div>

                {/* Geofence Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Geofence Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                        formData.geofence_type === 'Circle'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="geofence_type"
                        value="Circle"
                        checked={formData.geofence_type === 'Circle'}
                        onChange={handleChange}
                        className="mt-1"
                      />
                      <div className="flex items-center gap-2">
                        <FiCircle className="text-blue-600 text-xl" />
                        <div>
                          <div className="font-semibold text-gray-900">Circle</div>
                          <div className="text-xs text-gray-600 mt-1">Define a circular zone with center and radius</div>
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                        formData.geofence_type === 'Polygon'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="geofence_type"
                        value="Polygon"
                        checked={formData.geofence_type === 'Polygon'}
                        onChange={handleChange}
                        className="mt-1"
                      />
                      <div className="flex items-center gap-2">
                        <IoShapesOutline className="text-purple-600 text-xl" />
                        <div>
                          <div className="font-semibold text-gray-900">Polygon</div>
                          <div className="text-xs text-gray-600 mt-1">Define a custom zone with multiple points</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Circle-specific fields */}
                {formData.geofence_type === 'Circle' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        name="center_latitude"
                        value={circleCenter[0]}
                        onChange={(e) => {
                          const lat = parseFloat(e.target.value);
                          setCircleCenter([lat, circleCenter[1]]);
                          setFormData({ ...formData, center_latitude: lat });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        name="center_longitude"
                        value={circleCenter[1]}
                        onChange={(e) => {
                          const lng = parseFloat(e.target.value);
                          setCircleCenter([circleCenter[0], lng]);
                          setFormData({ ...formData, center_longitude: lng });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Radius (meters) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="radius_meters"
                        value={formData.radius_meters}
                        onChange={handleChange}
                        min="10"
                        className={`w-full px-3 py-2 border ${
                          errors.radius_meters ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm`}
                      />
                      {errors.radius_meters && (
                        <p className="text-red-500 text-xs mt-1">{errors.radius_meters}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Polygon-specific info */}
                {formData.geofence_type === 'Polygon' && (
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                    <div className="flex items-start gap-3">
                      <FiAlertCircle className="text-purple-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-purple-800">
                        <p className="font-semibold mb-1">Polygon Configuration</p>
                        <p>Click on the map to add points for your polygon. You need at least 3 points. Current points: <strong>{polygonPoints.length}</strong></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alerts */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Settings
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      name="alert_on_enter"
                      checked={formData.alert_on_enter}
                      onChange={handleChange}
                      className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Alert on Enter</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Trigger an alert when a device enters this geofence
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      name="alert_on_exit"
                      checked={formData.alert_on_exit}
                      onChange={handleChange}
                      className="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Alert on Exit</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Trigger an alert when a device exits this geofence
                      </div>
                    </div>
                  </label>
                </div>
              </>
            )}

            {/* Map Tab */}
            {activeTab === 'map' && (
              <>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Map Instructions</p>
                      <ul className="list-disc list-inside space-y-1">
                        {formData.geofence_type === 'Circle' ? (
                          <li>Click on the map to set the center point of your circular geofence</li>
                        ) : (
                          <>
                            <li>Click on the map to add points for your polygon</li>
                            <li>Add at least 3 points to create a valid polygon</li>
                            <li>The polygon will automatically close when you have 3+ points</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {formData.geofence_type === 'Polygon' && (
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      type="button"
                      onClick={removeLastPoint}
                      disabled={polygonPoints.length === 0}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove Last Point
                    </button>
                    <button
                      type="button"
                      onClick={clearPolygonPoints}
                      disabled={polygonPoints.length === 0}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Clear All Points
                    </button>
                    <span className="text-sm text-gray-600 ml-auto">
                      Points: <strong>{polygonPoints.length}</strong>
                    </span>
                  </div>
                )}

                {/* Map */}
                <div className="h-[500px] rounded-lg overflow-hidden border-2 border-gray-300">
                  <MapContainer
                    center={mapCenter}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler />
                    
                    {formData.geofence_type === 'Circle' && (
                      <>
                        <Marker position={circleCenter} />
                        <Circle
                          center={circleCenter}
                          radius={formData.radius_meters || 500}
                          pathOptions={{
                            color: '#3b82f6',
                            fillColor: '#3b82f6',
                            fillOpacity: 0.2,
                          }}
                        />
                      </>
                    )}

                    {formData.geofence_type === 'Polygon' && polygonPoints.length > 0 && (
                      <>
                        {polygonPoints.map((point, idx) => (
                          <Marker key={idx} position={point} />
                        ))}
                        {polygonPoints.length >= 3 && (
                          <Polygon
                            positions={polygonPoints}
                            pathOptions={{
                              color: '#a855f7',
                              fillColor: '#a855f7',
                              fillOpacity: 0.2,
                            }}
                          />
                        )}
                      </>
                    )}
                  </MapContainer>
                </div>

                {errors.polygon && (
                  <p className="text-red-500 text-sm mt-2">{errors.polygon}</p>
                )}
              </>
            )}

            {/* Footer */}
            <div className="flex gap-3 pt-6 border-t mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiMapPin />
                    {geofence ? 'Update Geofence' : 'Create Geofence'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GeofenceModal;
