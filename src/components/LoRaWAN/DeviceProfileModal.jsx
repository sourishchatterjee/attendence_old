import React, { useState, useEffect } from 'react';
import { lorawanAPI } from '../../services/lorawanAPI';

const DeviceProfileModal = ({ profile, organizations, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'lorawan', 'codec'
  const [formData, setFormData] = useState({
    organization_id: '',
    profile_name: '',
    profile_description: '',
    lorawan_version: '1.0.3',
    lorawan_region: 'IN865',
    mac_version: '1.0.3',
    reg_params_revision: 'A',
    supports_otaa: true,
    supports_class_b: false,
    supports_class_c: false,
    max_eirp: 16,
    rx_delay_1: 1,
    rx_dr_offset_1: 0,
    rx_data_rate_2: 0,
    rx_freq_2: 0,
    adr_algorithm_id: 'default',
    payload_codec: 'CUSTOM',
    payload_decoder_script: '',
    payload_encoder_script: '',
    tags: {},
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const lorawanVersions = ['1.0.0', '1.0.1', '1.0.2', '1.0.3', '1.0.4', '1.1.0'];
  const lorawanRegions = [
    { value: 'AS923', name: 'AS923 (Asia)' },
    { value: 'AU915', name: 'AU915 (Australia)' },
    { value: 'CN470', name: 'CN470 (China)' },
    { value: 'EU868', name: 'EU868 (Europe)' },
    { value: 'IN865', name: 'IN865 (India)' },
    { value: 'KR920', name: 'KR920 (Korea)' },
    { value: 'US915', name: 'US915 (USA)' },
  ];
  const payloadCodecs = [
    { value: 'NONE', name: 'None' },
    { value: 'CAYENNE_LPP', name: 'Cayenne LPP' },
    { value: 'CUSTOM', name: 'Custom JavaScript' },
    { value: 'JSON', name: 'JSON' },
  ];

  useEffect(() => {
    if (profile) {
      setFormData({
        organization_id: profile.organization_id || '',
        profile_name: profile.profile_name || '',
        profile_description: profile.profile_description || '',
        lorawan_version: profile.lorawan_version || '1.0.3',
        lorawan_region: profile.lorawan_region || 'IN865',
        mac_version: profile.mac_version || '1.0.3',
        reg_params_revision: profile.reg_params_revision || 'A',
        supports_otaa: profile.supports_otaa !== false,
        supports_class_b: profile.supports_class_b || false,
        supports_class_c: profile.supports_class_c || false,
        max_eirp: profile.max_eirp || 16,
        rx_delay_1: profile.rx_delay_1 || 1,
        rx_dr_offset_1: profile.rx_dr_offset_1 || 0,
        rx_data_rate_2: profile.rx_data_rate_2 || 0,
        rx_freq_2: profile.rx_freq_2 || 0,
        adr_algorithm_id: profile.adr_algorithm_id || 'default',
        payload_codec: profile.payload_codec || 'CUSTOM',
        payload_decoder_script: profile.payload_decoder_script || '',
        payload_encoder_script: profile.payload_encoder_script || '',
        tags: profile.tags || {},
      });
    }
  }, [profile]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }
    if (!formData.profile_name || formData.profile_name.trim() === '') {
      newErrors.profile_name = 'Profile name is required';
    }
    if (!formData.lorawan_version) {
      newErrors.lorawan_version = 'LoRaWAN version is required';
    }
    if (!formData.lorawan_region) {
      newErrors.lorawan_region = 'LoRaWAN region is required';
    }
    if (!formData.mac_version) {
      newErrors.mac_version = 'MAC version is required';
    }
    if (formData.max_eirp < 0 || formData.max_eirp > 30) {
      newErrors.max_eirp = 'Max EIRP must be between 0 and 30';
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
        profile_name: formData.profile_name.trim(),
        profile_description: formData.profile_description.trim(),
        lorawan_version: formData.lorawan_version,
        lorawan_region: formData.lorawan_region,
        mac_version: formData.mac_version,
        reg_params_revision: formData.reg_params_revision,
        supports_otaa: formData.supports_otaa,
        supports_class_b: formData.supports_class_b,
        supports_class_c: formData.supports_class_c,
        max_eirp: parseInt(formData.max_eirp, 10),
        rx_delay_1: parseInt(formData.rx_delay_1, 10),
        rx_dr_offset_1: parseInt(formData.rx_dr_offset_1, 10),
        rx_data_rate_2: parseInt(formData.rx_data_rate_2, 10),
        rx_freq_2: parseInt(formData.rx_freq_2, 10),
        adr_algorithm_id: formData.adr_algorithm_id,
        payload_codec: formData.payload_codec,
        payload_decoder_script: formData.payload_decoder_script || null,
        payload_encoder_script: formData.payload_encoder_script || null,
        tags: formData.tags,
      };

      if (profile) {
        await lorawanAPI.updateProfile(profile.profile_id, submitData);
        alert('✅ Device profile updated successfully');
      } else {
        await lorawanAPI.createProfile(submitData);
        alert('✅ Device profile created successfully');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to save device profile'}`);
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">
              {profile ? 'Edit Device Profile' : 'Create Device Profile'}
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
              onClick={() => setActiveTab('lorawan')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'lorawan'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              LoRaWAN Config
            </button>
            <button
              onClick={() => setActiveTab('codec')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'codec'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Payload Codec
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
                    disabled={!!profile}
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

                {/* Profile Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Profile Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="profile_name"
                    value={formData.profile_name}
                    onChange={handleChange}
                    placeholder="e.g., Temperature Sensor Profile"
                    className={`w-full px-3 py-2 border ${
                      errors.profile_name ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  />
                  {errors.profile_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.profile_name}</p>
                  )}
                </div>

                {/* Profile Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="profile_description"
                    value={formData.profile_description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the device profile and its use cases..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm resize-none"
                  />
                </div>

                {/* Region and Versions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      LoRaWAN Region <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="lorawan_region"
                      value={formData.lorawan_region}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.lorawan_region ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    >
                      {lorawanRegions.map(region => (
                        <option key={region.value} value={region.value}>{region.name}</option>
                      ))}
                    </select>
                    {errors.lorawan_region && (
                      <p className="text-red-500 text-xs mt-1">{errors.lorawan_region}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      LoRaWAN Version <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="lorawan_version"
                      value={formData.lorawan_version}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.lorawan_version ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    >
                      {lorawanVersions.map(version => (
                        <option key={version} value={version}>{version}</option>
                      ))}
                    </select>
                    {errors.lorawan_version && (
                      <p className="text-red-500 text-xs mt-1">{errors.lorawan_version}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      MAC Version <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="mac_version"
                      value={formData.mac_version}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.mac_version ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    >
                      {lorawanVersions.map(version => (
                        <option key={version} value={version}>{version}</option>
                      ))}
                    </select>
                    {errors.mac_version && (
                      <p className="text-red-500 text-xs mt-1">{errors.mac_version}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Regional Parameters Revision
                    </label>
                    <input
                      type="text"
                      name="reg_params_revision"
                      value={formData.reg_params_revision}
                      onChange={handleChange}
                      placeholder="A"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {/* LoRaWAN Config Tab */}
            {activeTab === 'lorawan' && (
              <>
                {/* Device Class Support */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">Device Capabilities</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="supports_otaa"
                        checked={formData.supports_otaa}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Supports OTAA</span>
                        <p className="text-xs text-gray-600">Over-The-Air Activation</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="supports_class_b"
                        checked={formData.supports_class_b}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Supports Class B</span>
                        <p className="text-xs text-gray-600">Beacon for synchronized downlinks</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="supports_class_c"
                        checked={formData.supports_class_c}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Supports Class C</span>
                        <p className="text-xs text-gray-600">Continuous listening mode</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Radio Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Max EIRP (dBm)
                    </label>
                    <input
                      type="number"
                      name="max_eirp"
                      value={formData.max_eirp}
                      onChange={handleChange}
                      min="0"
                      max="30"
                      className={`w-full px-3 py-2 border ${
                        errors.max_eirp ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    />
                    {errors.max_eirp && (
                      <p className="text-red-500 text-xs mt-1">{errors.max_eirp}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      ADR Algorithm
                    </label>
                    <input
                      type="text"
                      name="adr_algorithm_id"
                      value={formData.adr_algorithm_id}
                      onChange={handleChange}
                      placeholder="default"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                    />
                  </div>
                </div>

                {/* RX Windows */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="text-sm font-semibold text-purple-900 mb-3">RX Window Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-purple-700 mb-1">
                        RX Delay 1 (seconds)
                      </label>
                      <input
                        type="number"
                        name="rx_delay_1"
                        value={formData.rx_delay_1}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-purple-700 mb-1">
                        RX DR Offset 1
                      </label>
                      <input
                        type="number"
                        name="rx_dr_offset_1"
                        value={formData.rx_dr_offset_1}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-purple-700 mb-1">
                        RX Data Rate 2
                      </label>
                      <input
                        type="number"
                        name="rx_data_rate_2"
                        value={formData.rx_data_rate_2}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-purple-700 mb-1">
                        RX Frequency 2 (Hz)
                      </label>
                      <input
                        type="number"
                        name="rx_freq_2"
                        value={formData.rx_freq_2}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Payload Codec Tab */}
            {activeTab === 'codec' && (
              <>
                {/* Codec Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Payload Codec
                  </label>
                  <select
                    name="payload_codec"
                    value={formData.payload_codec}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                  >
                    {payloadCodecs.map(codec => (
                      <option key={codec.value} value={codec.value}>{codec.name}</option>
                    ))}
                  </select>
                </div>

                {formData.payload_codec === 'CUSTOM' && (
                  <>
                    {/* Decoder Script */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Decoder Script (JavaScript)
                      </label>
                      <textarea
                        name="payload_decoder_script"
                        value={formData.payload_decoder_script}
                        onChange={handleChange}
                        rows={8}
                        placeholder="function Decoder(bytes, port) {&#10;  // Decode uplink payload&#10;  return {&#10;    temperature: (bytes[0] << 8 | bytes[1]) / 100&#10;  };&#10;}"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm font-mono resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Function to decode uplink payload bytes into JSON object
                      </p>
                    </div>

                    {/* Encoder Script */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Encoder Script (JavaScript) - Optional
                      </label>
                      <textarea
                        name="payload_encoder_script"
                        value={formData.payload_encoder_script}
                        onChange={handleChange}
                        rows={8}
                        placeholder="function Encoder(obj, port) {&#10;  // Encode downlink payload&#10;  return [&#10;    (obj.command >> 8) & 0xff,&#10;    obj.command & 0xff&#10;  ];&#10;}"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm font-mono resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Function to encode JSON object into downlink payload bytes
                      </p>
                    </div>
                  </>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-blue-800">
                      <p className="font-semibold">Payload Codec Information</p>
                      <p className="mt-0.5">• <strong>None:</strong> Raw payload bytes without decoding</p>
                      <p>• <strong>Cayenne LPP:</strong> Cayenne Low Power Payload format</p>
                      <p>• <strong>Custom:</strong> JavaScript functions for encoding/decoding</p>
                      <p>• <strong>JSON:</strong> Direct JSON payload format</p>
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
                {loading ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeviceProfileModal;
