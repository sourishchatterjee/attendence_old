import React, { useState, useEffect } from 'react';
import { 
  FiPackage, 
  FiCode, 
  FiLink, 
  FiSettings,
  FiTag,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  IoAppsOutline,
  IoCodeSlashOutline,
  IoGlobeOutline
} from 'react-icons/io5';
import { lorawanAPI } from '../../services/lorawanAPI';

const ApplicationModal = ({ application, organizations, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'integration', 'codec'
  const [formData, setFormData] = useState({
    organization_id: '',
    application_name: '',
    application_description: '',
    mqtt_topic_prefix: '',
    webhook_url: '',
    webhook_headers: {},
    payload_codec: 'NONE',
    payload_decoder_script: '',
    payload_encoder_script: '',
    tags: {},
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [webhookHeaderKey, setWebhookHeaderKey] = useState('');
  const [webhookHeaderValue, setWebhookHeaderValue] = useState('');
  const [tagKey, setTagKey] = useState('');
  const [tagValue, setTagValue] = useState('');

  const codecOptions = [
    { value: 'NONE', label: 'None', description: 'No payload decoding' },
    { value: 'CUSTOM', label: 'Custom Script', description: 'JavaScript decoder/encoder' },
    { value: 'CAYENNE_LPP', label: 'Cayenne LPP', description: 'Low Power Payload format' },
    { value: 'JSON', label: 'JSON', description: 'JSON payload format' },
  ];

  useEffect(() => {
    if (application) {
      setFormData({
        organization_id: application.organization_id || '',
        application_name: application.application_name || '',
        application_description: application.application_description || '',
        mqtt_topic_prefix: application.mqtt_topic_prefix || '',
        webhook_url: application.webhook_url || '',
        webhook_headers: application.webhook_headers || {},
        payload_codec: application.payload_codec || 'NONE',
        payload_decoder_script: application.payload_decoder_script || '',
        payload_encoder_script: application.payload_encoder_script || '',
        tags: application.tags || {},
      });
    }
  }, [application]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }
    if (!formData.application_name || formData.application_name.trim() === '') {
      newErrors.application_name = 'Application name is required';
    }
    if (formData.webhook_url && !isValidUrl(formData.webhook_url)) {
      newErrors.webhook_url = 'Invalid webhook URL';
    }
    if (formData.payload_codec === 'CUSTOM' && !formData.payload_decoder_script) {
      newErrors.payload_decoder_script = 'Decoder script is required for custom codec';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
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
        application_name: formData.application_name.trim(),
        application_description: formData.application_description.trim() || null,
        mqtt_topic_prefix: formData.mqtt_topic_prefix.trim() || null,
        webhook_url: formData.webhook_url.trim() || null,
        webhook_headers: Object.keys(formData.webhook_headers).length > 0 ? formData.webhook_headers : null,
        payload_codec: formData.payload_codec,
        payload_decoder_script: formData.payload_decoder_script.trim() || null,
        payload_encoder_script: formData.payload_encoder_script.trim() || null,
        tags: Object.keys(formData.tags).length > 0 ? formData.tags : null,
      };

      if (application) {
        await lorawanAPI.updateApplication(application.application_id, submitData);
        alert('✅ Application updated successfully');
      } else {
        await lorawanAPI.createApplication(submitData);
        alert('✅ Application created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to save application'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const addWebhookHeader = () => {
    if (webhookHeaderKey.trim() && webhookHeaderValue.trim()) {
      setFormData({
        ...formData,
        webhook_headers: {
          ...formData.webhook_headers,
          [webhookHeaderKey.trim()]: webhookHeaderValue.trim(),
        },
      });
      setWebhookHeaderKey('');
      setWebhookHeaderValue('');
    }
  };

  const removeWebhookHeader = (key) => {
    const newHeaders = { ...formData.webhook_headers };
    delete newHeaders[key];
    setFormData({
      ...formData,
      webhook_headers: newHeaders,
    });
  };

  const addTag = () => {
    if (tagKey.trim() && tagValue.trim()) {
      setFormData({
        ...formData,
        tags: {
          ...formData.tags,
          [tagKey.trim()]: tagValue.trim(),
        },
      });
      setTagKey('');
      setTagValue('');
    }
  };

  const removeTag = (key) => {
    const newTags = { ...formData.tags };
    delete newTags[key];
    setFormData({
      ...formData,
      tags: newTags,
    });
  };

  const sampleDecoderScript = `// Sample decoder function
function decode(bytes, fPort) {
  var decoded = {};
  
  // Example: Temperature sensor (2 bytes)
  if (fPort === 1) {
    decoded.temperature = ((bytes[0] << 8) | bytes[1]) / 100;
    decoded.humidity = bytes[2];
    decoded.battery = bytes[3];
  }
  
  return decoded;
}`;

  const sampleEncoderScript = `// Sample encoder function
function encode(payload, fPort) {
  var bytes = [];
  
  // Example: LED control
  if (payload.led) {
    bytes[0] = payload.led ? 0x01 : 0x00;
  }
  
  return bytes;
}`;

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
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <IoAppsOutline className="text-2xl text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-secondary-700">
              {application ? 'Edit Application' : 'Create New Application'}
            </h3>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'basic'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiPackage />
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab('integration')}
              className={`px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'integration'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiLink />
              Integrations
            </button>
            <button
              onClick={() => setActiveTab('codec')}
              className={`px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'codec'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiCode />
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
                    disabled={!!application}
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

                {/* Application Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Application Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="application_name"
                    value={formData.application_name}
                    onChange={handleChange}
                    placeholder="e.g., Employee Tracking App"
                    className={`w-full px-3 py-2 border ${
                      errors.application_name ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  />
                  {errors.application_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.application_name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="application_description"
                    value={formData.application_description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the purpose of this application..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <FiTag />
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagKey}
                      onChange={(e) => setTagKey(e.target.value)}
                      placeholder="Key"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                    <input
                      type="text"
                      value={tagValue}
                      onChange={(e) => setTagValue(e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(formData.tags).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        <span className="font-semibold">{key}:</span>
                        <span>{value}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(key)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Integration Tab */}
            {activeTab === 'integration' && (
              <>
                {/* MQTT Topic Prefix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <IoGlobeOutline />
                    MQTT Topic Prefix
                  </label>
                  <input
                    type="text"
                    name="mqtt_topic_prefix"
                    value={formData.mqtt_topic_prefix}
                    onChange={handleChange}
                    placeholder="e.g., app/tracking"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    MQTT topic prefix for publishing device data
                  </p>
                </div>

                {/* Webhook URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <FiLink />
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    name="webhook_url"
                    value={formData.webhook_url}
                    onChange={handleChange}
                    placeholder="https://example.com/webhook"
                    className={`w-full px-3 py-2 border ${
                      errors.webhook_url ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm font-mono`}
                  />
                  {errors.webhook_url && (
                    <p className="text-red-500 text-xs mt-1">{errors.webhook_url}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    HTTP endpoint to receive device data via POST requests
                  </p>
                </div>

                {/* Webhook Headers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <FiSettings />
                    Webhook Headers
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={webhookHeaderKey}
                      onChange={(e) => setWebhookHeaderKey(e.target.value)}
                      placeholder="Header Name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                    <input
                      type="text"
                      value={webhookHeaderValue}
                      onChange={(e) => setWebhookHeaderValue(e.target.value)}
                      placeholder="Header Value"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={addWebhookHeader}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(formData.webhook_headers).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-gray-700">{key}:</span>
                          <span className="text-gray-600 font-mono text-xs">{value}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeWebhookHeader(key)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Alert */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Integration Information</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Webhook receives POST requests with device data in JSON format</li>
                        <li>MQTT topics follow pattern: prefix/device_eui/event</li>
                        <li>Both integrations can be enabled simultaneously</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Codec Tab */}
            {activeTab === 'codec' && (
              <>
                {/* Payload Codec Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payload Codec
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {codecOptions.map(option => (
                      <label
                        key={option.value}
                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                          formData.payload_codec === option.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payload_codec"
                          value={option.value}
                          checked={formData.payload_codec === option.value}
                          onChange={handleChange}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{option.label}</div>
                          <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Codec Scripts */}
                {formData.payload_codec === 'CUSTOM' && (
                  <>
                    {/* Decoder Script */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                          <IoCodeSlashOutline />
                          Decoder Script <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, payload_decoder_script: sampleDecoderScript })}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Load Sample
                        </button>
                      </div>
                      <textarea
                        name="payload_decoder_script"
                        value={formData.payload_decoder_script}
                        onChange={handleChange}
                        rows={10}
                        placeholder="function decode(bytes, fPort) { return {}; }"
                        className={`w-full px-3 py-2 border ${
                          errors.payload_decoder_script ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm font-mono bg-gray-900 text-green-400`}
                      />
                      {errors.payload_decoder_script && (
                        <p className="text-red-500 text-xs mt-1">{errors.payload_decoder_script}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        JavaScript function to decode uplink payloads
                      </p>
                    </div>

                    {/* Encoder Script */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                          <IoCodeSlashOutline />
                          Encoder Script (Optional)
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, payload_encoder_script: sampleEncoderScript })}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Load Sample
                        </button>
                      </div>
                      <textarea
                        name="payload_encoder_script"
                        value={formData.payload_encoder_script}
                        onChange={handleChange}
                        rows={10}
                        placeholder="function encode(payload, fPort) { return []; }"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm font-mono bg-gray-900 text-green-400"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        JavaScript function to encode downlink payloads
                      </p>
                    </div>
                  </>
                )}

                {/* Codec Info */}
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="text-purple-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-purple-800">
                      <p className="font-semibold mb-1">Codec Information</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>NONE:</strong> Raw payload forwarded without decoding</li>
                        <li><strong>CUSTOM:</strong> Use JavaScript functions for encoding/decoding</li>
                        <li><strong>CAYENNE LPP:</strong> Standard format for sensor data</li>
                        <li><strong>JSON:</strong> Payload is parsed as JSON</li>
                      </ul>
                    </div>
                  </div>
                </div>
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
                    <FiPackage />
                    {application ? 'Update Application' : 'Create Application'}
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

export default ApplicationModal;
