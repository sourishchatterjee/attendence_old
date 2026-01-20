import React, { useState, useEffect } from 'react';
import { lorawanAPI } from '../../services/lorawanAPI';
import { siteAPI } from '../../services/siteAPI';
import { locationAPI } from '../../services/locationAPI';

const GatewayModal = ({ gateway, organizations, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'location', 'technical'
  const [sites, setSites] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    organization_id: '',
    site_id: '',
    gateway_eui: '',
    gateway_name: '',
    gateway_description: '',
    location_id: '',
    latitude: '',
    longitude: '',
    altitude: '',
    stats_interval: 30,
    gateway_model: '',
    gateway_board: '',
    antenna_type: '',
    antenna_gain: '',
    tags: {},
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (gateway) {
      setFormData({
        organization_id: gateway.organization_id || '',
        site_id: gateway.site_id || '',
        gateway_eui: gateway.gateway_eui || '',
        gateway_name: gateway.gateway_name || '',
        gateway_description: gateway.gateway_description || '',
        location_id: gateway.location_id || '',
        latitude: gateway.latitude || '',
        longitude: gateway.longitude || '',
        altitude: gateway.altitude || '',
        stats_interval: gateway.stats_interval || 30,
        gateway_model: gateway.gateway_model || '',
        gateway_board: gateway.gateway_board || '',
        antenna_type: gateway.antenna_type || '',
        antenna_gain: gateway.antenna_gain || '',
        tags: gateway.tags || {},
      });
      
      if (gateway.organization_id) {
        fetchSites(gateway.organization_id);
      }
      if (gateway.site_id) {
        fetchLocations(gateway.site_id);
      }
    }
  }, [gateway]);

  useEffect(() => {
    if (formData.organization_id) {
      fetchSites(formData.organization_id);
    } else {
      setSites([]);
      setFormData(prev => ({ ...prev, site_id: '', location_id: '' }));
    }
  }, [formData.organization_id]);

  useEffect(() => {
    if (formData.site_id) {
      fetchLocations(formData.site_id);
    } else {
      setLocations([]);
      setFormData(prev => ({ ...prev, location_id: '' }));
    }
  }, [formData.site_id]);

  const fetchSites = async (orgId) => {
    try {
      const response = await siteAPI.getAllSites({ 
        organization_id: orgId,
        pageSize: 100 
      });
      setSites(response.data || []);
    } catch (err) {
      console.error('Error fetching sites:', err);
    }
  };

  const fetchLocations = async (siteId) => {
    try {
      const response = await locationAPI.getAllLocations({ 
        site_id: siteId,
        pageSize: 100 
      });
      setLocations(response.data || []);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }
    if (!formData.gateway_eui || formData.gateway_eui.trim() === '') {
      newErrors.gateway_eui = 'Gateway EUI is required';
    } else if (!/^[0-9A-Fa-f]{16}$/.test(formData.gateway_eui.replace(/:/g, ''))) {
      newErrors.gateway_eui = 'Gateway EUI must be 16 hex characters';
    }
    if (!formData.gateway_name || formData.gateway_name.trim() === '') {
      newErrors.gateway_name = 'Gateway name is required';
    }
    if (formData.latitude && (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }
    if (formData.longitude && (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }
    if (formData.altitude && isNaN(formData.altitude)) {
      newErrors.altitude = 'Altitude must be a number';
    }
    if (formData.stats_interval && (isNaN(formData.stats_interval) || formData.stats_interval < 1)) {
      newErrors.stats_interval = 'Stats interval must be at least 1 second';
    }
    if (formData.antenna_gain && isNaN(formData.antenna_gain)) {
      newErrors.antenna_gain = 'Antenna gain must be a number';
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
        site_id: formData.site_id ? parseInt(formData.site_id, 10) : null,
        gateway_eui: formData.gateway_eui.replace(/:/g, '').toUpperCase(),
        gateway_name: formData.gateway_name.trim(),
        gateway_description: formData.gateway_description.trim() || null,
        location_id: formData.location_id ? parseInt(formData.location_id, 10) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        altitude: formData.altitude ? parseFloat(formData.altitude) : null,
        stats_interval: parseInt(formData.stats_interval, 10),
        gateway_model: formData.gateway_model.trim() || null,
        gateway_board: formData.gateway_board.trim() || null,
        antenna_type: formData.antenna_type.trim() || null,
        antenna_gain: formData.antenna_gain ? parseFloat(formData.antenna_gain) : null,
        tags: formData.tags,
      };

      if (gateway) {
        await lorawanAPI.updateGateway(gateway.gateway_id, submitData);
        alert('✅ Gateway updated successfully');
      } else {
        await lorawanAPI.createGateway(submitData);
        alert('✅ Gateway created successfully');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to save gateway'}`);
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

  const formatEUI = (value) => {
    // Remove all non-hex characters
    const cleaned = value.replace(/[^0-9A-Fa-f]/g, '');
    // Add colons every 2 characters
    const formatted = cleaned.match(/.{1,2}/g)?.join(':') || cleaned;
    return formatted.toUpperCase();
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

          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">
              {gateway ? 'Edit Gateway' : 'Add New Gateway'}
            </h3>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'basic'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'location'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Location
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'technical'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Technical
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
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
                    disabled={!!gateway}
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

                {/* Site */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Site
                  </label>
                  <select
                    name="site_id"
                    value={formData.site_id}
                    onChange={handleChange}
                    disabled={!formData.organization_id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:bg-gray-100"
                  >
                    <option value="">Select Site (Optional)</option>
                    {sites.map(site => (
                      <option key={site.site_id} value={site.site_id}>
                        {site.site_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gateway EUI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Gateway EUI <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="gateway_eui"
                    value={formData.gateway_eui}
                    onChange={(e) => {
                      const formatted = formatEUI(e.target.value);
                      setFormData({ ...formData, gateway_eui: formatted });
                      if (errors.gateway_eui) {
                        setErrors({ ...errors, gateway_eui: '' });
                      }
                    }}
                    disabled={!!gateway}
                    placeholder="00:00:00:00:00:00:00:01"
                    maxLength={23}
                    className={`w-full px-3 py-2 border ${
                      errors.gateway_eui ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm font-mono disabled:bg-gray-100`}
                  />
                  {errors.gateway_eui && (
                    <p className="text-red-500 text-xs mt-1">{errors.gateway_eui}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">16 hexadecimal characters (e.g., 0000000000000001)</p>
                </div>

                {/* Gateway Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Gateway Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="gateway_name"
                    value={formData.gateway_name}
                    onChange={handleChange}
                    placeholder="e.g., Main Office Gateway"
                    className={`w-full px-3 py-2 border ${
                      errors.gateway_name ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  />
                  {errors.gateway_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.gateway_name}</p>
                  )}
                </div>

                {/* Gateway Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="gateway_description"
                    value={formData.gateway_description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the gateway location and purpose..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm resize-none"
                  />
                </div>
              </>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <>
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location
                  </label>
                  <select
                    name="location_id"
                    value={formData.location_id}
                    onChange={handleChange}
                    disabled={!formData.site_id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:bg-gray-100"
                  >
                    <option value="">Select Location (Optional)</option>
                    {locations.map(location => (
                      <option key={location.location_id} value={location.location_id}>
                        {location.location_name}
                      </option>
                    ))}
                  </select>
                  {!formData.site_id && (
                    <p className="text-xs text-gray-500 mt-1">Select a site first to choose a location</p>
                  )}
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Latitude
                    </label>
                    <input
                      type="number"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      step="0.000001"
                      min="-90"
                      max="90"
                      placeholder="19.0760"
                      className={`w-full px-3 py-2 border ${
                        errors.latitude ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    />
                    {errors.latitude && (
                      <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Longitude
                    </label>
                    <input
                      type="number"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      step="0.000001"
                      min="-180"
                      max="180"
                      placeholder="72.8777"
                      className={`w-full px-3 py-2 border ${
                        errors.longitude ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    />
                    {errors.longitude && (
                      <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>
                    )}
                  </div>
                </div>

                {/* Altitude */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Altitude (meters)
                  </label>
                  <input
                    type="number"
                    name="altitude"
                    value={formData.altitude}
                    onChange={handleChange}
                    step="0.1"
                    placeholder="10"
                    className={`w-full px-3 py-2 border ${
                      errors.altitude ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  />
                  {errors.altitude && (
                    <p className="text-red-500 text-xs mt-1">{errors.altitude}</p>
                  )}
                </div>

                {/* Location Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-blue-800">
                      <p className="font-semibold">GPS Coordinates</p>
                      <p className="mt-0.5">• Latitude range: -90 to 90 (North/South)</p>
                      <p>• Longitude range: -180 to 180 (East/West)</p>
                      <p>• Altitude in meters above sea level</p>
                      <p>• These coordinates help with coverage mapping</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Technical Tab */}
            {activeTab === 'technical' && (
              <>
                {/* Gateway Model & Board */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Gateway Model
                    </label>
                    <input
                      type="text"
                      name="gateway_model"
                      value={formData.gateway_model}
                      onChange={handleChange}
                      placeholder="e.g., RAK7249"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Gateway Board
                    </label>
                    <input
                      type="text"
                      name="gateway_board"
                      value={formData.gateway_board}
                      onChange={handleChange}
                      placeholder="e.g., SX1302, SX1301"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                    />
                  </div>
                </div>

                {/* Antenna Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Antenna Type
                    </label>
                    <input
                      type="text"
                      name="antenna_type"
                      value={formData.antenna_type}
                      onChange={handleChange}
                      placeholder="e.g., Outdoor Omni, Directional"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Antenna Gain (dBi)
                    </label>
                    <input
                      type="number"
                      name="antenna_gain"
                      value={formData.antenna_gain}
                      onChange={handleChange}
                      step="0.1"
                      placeholder="3.0"
                      className={`w-full px-3 py-2 border ${
                        errors.antenna_gain ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    />
                    {errors.antenna_gain && (
                      <p className="text-red-500 text-xs mt-1">{errors.antenna_gain}</p>
                    )}
                  </div>
                </div>

                {/* Stats Interval */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Statistics Interval (seconds)
                  </label>
                  <input
                    type="number"
                    name="stats_interval"
                    value={formData.stats_interval}
                    onChange={handleChange}
                    min="1"
                    placeholder="30"
                    className={`w-full px-3 py-2 border ${
                      errors.stats_interval ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  />
                  {errors.stats_interval && (
                    <p className="text-red-500 text-xs mt-1">{errors.stats_interval}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">How often the gateway reports statistics</p>
                </div>

                {/* Technical Info Box */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-purple-800">
                      <p className="font-semibold">Technical Specifications</p>
                      <p className="mt-0.5">• Gateway model and board help with troubleshooting</p>
                      <p>• Antenna gain affects coverage calculations</p>
                      <p>• Stats interval determines monitoring frequency</p>
                      <p>• Common boards: SX1301, SX1302, SX1303</p>
                    </div>
                  </div>
                </div>
              </>
            )}

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
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium disabled:opacity-50 text-sm"
              >
                {loading ? 'Saving...' : gateway ? 'Update Gateway' : 'Add Gateway'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GatewayModal;
