import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../../services/attendanceAPI';
import { locationAPI } from '../../services/locationAPI';

const CheckInModal = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState('checkin'); // 'checkin' or 'checkout'
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    location_id: '',
    address: '',
    image_url: '',
  });
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [errors, setErrors] = useState({});
  const [nearbyLocation, setNearbyLocation] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await locationAPI.getAllLocations({ 
        is_active: true,
        pageSize: 100 
      });
      setLocations(response.data || []);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('❌ Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        setFormData(prev => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lon.toFixed(6),
        }));
        
        // Find nearby location
        findNearbyLocation(lat, lon);
        
        setGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGettingLocation(false);
        alert('❌ Unable to get current location. Please enable location access.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const findNearbyLocation = (lat, lon) => {
    if (locations.length === 0) return;

    // Calculate distance to each location
    const locationsWithDistance = locations.map(loc => {
      const distance = calculateDistance(lat, lon, loc.latitude, loc.longitude);
      return { ...loc, distance };
    });

    // Sort by distance and find the nearest one within radius
    const sorted = locationsWithDistance.sort((a, b) => a.distance - b.distance);
    const nearest = sorted[0];

    if (nearest && nearest.distance <= nearest.radius_meters) {
      setNearbyLocation(nearest);
      setFormData(prev => ({
        ...prev,
        location_id: nearest.location_id,
      }));
    } else {
      setNearbyLocation(null);
      alert('⚠️ You are not within any registered location zone');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula to calculate distance in meters
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.latitude) {
      newErrors.latitude = 'Location is required';
    }
    if (!formData.longitude) {
      newErrors.longitude = 'Location is required';
    }
    if (mode === 'checkin' && !formData.location_id) {
      newErrors.location_id = 'You must be within a registered location';
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
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        ...(mode === 'checkin' ? {
          location_id: parseInt(formData.location_id, 10),
          checkin_address: formData.address || null,
          checkin_image_url: formData.image_url || null,
        } : {
          checkout_address: formData.address || null,
          checkout_image_url: formData.image_url || null,
        })
      };

      if (mode === 'checkin') {
        const response = await attendanceAPI.checkIn(submitData);
        const data = response.data;
        
        let message = '✅ Check-in successful!';
        if (data.is_late) {
          message += `\n⏰ You are ${data.late_by_minutes} minutes late`;
        }
        alert(message);
      } else {
        const response = await attendanceAPI.checkOut(submitData);
        const data = response.data;
        
        let message = '✅ Check-out successful!';
        message += `\n⏱️ Working hours: ${data.working_hours.toFixed(1)}h`;
        if (data.overtime_hours > 0) {
          message += `\n⚡ Overtime: ${data.overtime_hours.toFixed(1)}h`;
        }
        alert(message);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || `Failed to ${mode === 'checkin' ? 'check in' : 'check out'}`}`);
      }
    } finally {
      setLoading(false);
    }
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
        <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
              mode === 'checkin' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <svg className={`w-6 h-6 ${mode === 'checkin' ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">
              Attendance {mode === 'checkin' ? 'Check In' : 'Check Out'}
            </h3>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode('checkin')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition ${
                mode === 'checkin'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Check In
            </button>
            <button
              type="button"
              onClick={() => setMode('checkout')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition ${
                mode === 'checkout'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Check Out
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Get Location Button */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {gettingLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Getting Location...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Get Current Location
                  </>
                )}
              </button>
              <p className="text-xs text-blue-700 mt-2 text-center">
                Click to detect your current GPS location
              </p>
            </div>

            {/* GPS Coordinates */}
            {formData.latitude && formData.longitude && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Your Location</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Latitude</p>
                    <p className="text-sm font-mono font-semibold text-gray-900">{formData.latitude}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Longitude</p>
                    <p className="text-sm font-mono font-semibold text-gray-900">{formData.longitude}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nearby Location Info */}
            {nearbyLocation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-900">Location Detected</h4>
                    <p className="text-sm text-green-800 mt-1">{nearbyLocation.location_name}</p>
                    <p className="text-xs text-green-700 mt-1">
                      Zone: {nearbyLocation.zone_name} • Distance: {Math.round(nearbyLocation.distance)}m
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.location_id && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-red-900">Location Error</h4>
                    <p className="text-sm text-red-800 mt-1">{errors.location_id}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Location Selection (fallback) */}
            {mode === 'checkin' && !nearbyLocation && formData.latitude && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Select Location Manually
                </label>
                <select
                  value={formData.location_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, location_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                >
                  <option value="">Select a location</option>
                  {locations.map(loc => (
                    <option key={loc.location_id} value={loc.location_id}>
                      {loc.location_name} - {loc.zone_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Address (Optional)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                placeholder="Enter your current address"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Photo URL (Optional)
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                placeholder="https://example.com/photo.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload photo to your server and paste the URL here
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-yellow-800">
                  <p className="font-semibold mb-1">Important:</p>
                  <p>• You must be within a registered location zone to check in</p>
                  <p className="mt-0.5">• Check out can be done from anywhere</p>
                  <p className="mt-0.5">• Make sure your device location is enabled</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.latitude || (mode === 'checkin' && !formData.location_id)}
                className={`flex-1 px-4 py-2.5 rounded-lg transition font-medium text-sm disabled:opacity-50 text-white ${
                  mode === 'checkin' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  mode === 'checkin' ? 'Check In' : 'Check Out'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckInModal;
