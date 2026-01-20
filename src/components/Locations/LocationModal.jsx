import React, { useState, useEffect } from 'react';
import { locationAPI } from '../../services/locationAPI';

const LocationModal = ({ location, zones, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    zone_id: '',
    location_name: '',
    latitude: '',
    longitude: '',
    radius_meters: 100,
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (location) {
      setFormData({
        zone_id: location.zone_id || '',
        location_name: location.location_name || '',
        latitude: location.latitude || '',
        longitude: location.longitude || '',
        radius_meters: location.radius_meters || 100,
        address: location.address || '',
      });
    }
  }, [location]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.zone_id) {
      newErrors.zone_id = 'Zone is required';
    }
    if (!formData.location_name.trim()) {
      newErrors.location_name = 'Location name is required';
    }
    if (!formData.latitude) {
      newErrors.latitude = 'Latitude is required';
    } else if (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }
    if (!formData.longitude) {
      newErrors.longitude = 'Longitude is required';
    } else if (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }
    if (!formData.radius_meters || formData.radius_meters <= 0) {
      newErrors.radius_meters = 'Radius must be greater than 0';
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
        zone_id: parseInt(formData.zone_id, 10),
        location_name: formData.location_name.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius_meters: parseInt(formData.radius_meters, 10),
        address: formData.address.trim() || null,
      };

      if (location) {
        await locationAPI.updateLocation(location.location_id, submitData);
        alert('✅ Location updated successfully');
      } else {
        await locationAPI.createLocation(submitData);
        alert('✅ Location created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to save location'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('❌ Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setIsGettingLocation(false);
        alert('✅ Current location detected successfully');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGettingLocation(false);
        alert('❌ Unable to get current location. Please enable location access.');
      }
    );
  };

  const openInGoogleMaps = () => {
    if (formData.latitude && formData.longitude) {
      window.open(
        `https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`,
        '_blank'
      );
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
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">
              {location ? 'Edit Location' : 'Add New Location'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Zone Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Zone <span className="text-red-500">*</span>
              </label>
              <select
                name="zone_id"
                value={formData.zone_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.zone_id ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
              >
                <option value="">Select Zone</option>
                {zones.map(zone => (
                  <option key={zone.zone_id} value={zone.zone_id}>
                    {zone.zone_name} - {zone.organization_name}
                  </option>
                ))}
              </select>
              {errors.zone_id && (
                <p className="text-red-500 text-xs mt-1">{errors.zone_id}</p>
              )}
            </div>

            {/* Location Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Location Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location_name"
                value={formData.location_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.location_name ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                placeholder="Main Office Entrance"
              />
              {errors.location_name && (
                <p className="text-red-500 text-xs mt-1">{errors.location_name}</p>
              )}
            </div>

            {/* GPS Coordinates */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-blue-900">GPS Coordinates</h4>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {isGettingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Getting...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      Use Current Location
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-blue-900 mb-1">
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    step="0.000001"
                    min="-90"
                    max="90"
                    className={`w-full px-3 py-2 border ${
                      errors.latitude ? 'border-red-500' : 'border-blue-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm bg-white`}
                    placeholder="19.0760"
                  />
                  {errors.latitude && (
                    <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-blue-900 mb-1">
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    step="0.000001"
                    min="-180"
                    max="180"
                    className={`w-full px-3 py-2 border ${
                      errors.longitude ? 'border-red-500' : 'border-blue-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm bg-white`}
                    placeholder="72.8777"
                  />
                  {errors.longitude && (
                    <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>
                  )}
                </div>
              </div>

              {formData.latitude && formData.longitude && (
                <button
                  type="button"
                  onClick={openInGoogleMaps}
                  className="mt-3 text-xs text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View on Google Maps
                </button>
              )}
            </div>

            {/* Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Radius (meters) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="radius_meters"
                  value={formData.radius_meters}
                  onChange={handleChange}
                  min="1"
                  max="10000"
                  className={`w-full px-3 py-2 border ${
                    errors.radius_meters ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  placeholder="100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  meters
                </span>
              </div>
              {errors.radius_meters && (
                <p className="text-red-500 text-xs mt-1">{errors.radius_meters}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Geofence radius around the coordinates (recommended: 50-200 meters)
              </p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none text-sm"
                placeholder="Corporate Tower, Main Entrance, Mumbai"
              />
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-yellow-800">
                  <p className="font-semibold mb-1">GPS Accuracy Tips:</p>
                  <p>• Use the "Current Location" button for accurate coordinates</p>
                  <p className="mt-0.5">• Set appropriate radius based on area size</p>
                  <p className="mt-0.5">• Verify location on Google Maps before saving</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
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
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium disabled:opacity-50 text-sm"
              >
                {loading ? 'Saving...' : location ? 'Update Location' : 'Create Location'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
