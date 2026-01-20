import React, { useState } from 'react';
import { FiSend, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { lorawanAPI } from '../../services/lorawanAPI';

const DownlinkModal = ({ device, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fport: 1,
    payload: '',
    confirmed: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fport || formData.fport < 1 || formData.fport > 223) {
      newErrors.fport = 'Port must be between 1 and 223';
    }

    if (!formData.payload || formData.payload.trim() === '') {
      newErrors.payload = 'Payload is required';
    } else if (!/^[0-9A-Fa-f]+$/.test(formData.payload.replace(/\s/g, ''))) {
      newErrors.payload = 'Payload must be valid hexadecimal';
    } else if (formData.payload.replace(/\s/g, '').length % 2 !== 0) {
      newErrors.payload = 'Payload must have an even number of hex characters';
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
      const cleanPayload = formData.payload.replace(/\s/g, '').toUpperCase();

      await lorawanAPI.sendDownlink({
        device_id: device.device_id,
        fport: parseInt(formData.fport, 10),
        payload: cleanPayload,
        confirmed: formData.confirmed,
      });

      onSuccess();
    } catch (error) {
      console.error('Send downlink error:', error);
      alert(`❌ ${error.message || 'Failed to send downlink'}`);
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

  const formatHex = (value) => {
    const cleaned = value.replace(/[^0-9A-Fa-f]/g, '');
    return cleaned.toUpperCase();
  };

  const generateSamplePayload = (type) => {
    const samples = {
      led_on: '01',
      led_off: '00',
      reboot: 'FF',
      config: '0A14',
    };
    setFormData({ ...formData, payload: samples[type] });
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
            <div className="h-10 w-10 rounded-lg bg-secondary-100 flex items-center justify-center">
              <FiSend className="text-2xl text-secondary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary-700">Send Downlink Message</h3>
              <p className="text-sm text-gray-500">{device.device_name} ({device.dev_eui})</p>
            </div>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Downlink Information</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Payload must be in hexadecimal format (0-9, A-F)</li>
                  <li>Maximum payload size is 51 bytes for most regions</li>
                  <li>Confirmed messages require device acknowledgment</li>
                  <li>Downlink will be queued and sent on next uplink</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* FPort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                FPort <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="fport"
                value={formData.fport}
                onChange={handleChange}
                min="1"
                max="223"
                className={`w-full px-4 py-2.5 border ${
                  errors.fport ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition text-sm`}
                placeholder="1-223"
              />
              {errors.fport && (
                <p className="text-red-500 text-xs mt-1">{errors.fport}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Application port number (1-223). Port 0 is reserved for MAC commands.
              </p>
            </div>

            {/* Payload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Payload (Hexadecimal) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="payload"
                value={formData.payload}
                onChange={(e) => {
                  const formatted = formatHex(e.target.value);
                  setFormData({ ...formData, payload: formatted });
                  if (errors.payload) {
                    setErrors({ ...errors, payload: '' });
                  }
                }}
                rows={4}
                className={`w-full px-4 py-2.5 border ${
                  errors.payload ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition text-sm font-mono`}
                placeholder="0102030405"
              />
              {errors.payload && (
                <p className="text-red-500 text-xs mt-1">{errors.payload}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Enter hex data without spaces or 0x prefix. Length: {formData.payload.replace(/\s/g, '').length / 2} bytes
                </p>
              </div>

              {/* Sample Payloads */}
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Quick Samples:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => generateSamplePayload('led_on')}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition"
                  >
                    LED ON (01)
                  </button>
                  <button
                    type="button"
                    onClick={() => generateSamplePayload('led_off')}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition"
                  >
                    LED OFF (00)
                  </button>
                  <button
                    type="button"
                    onClick={() => generateSamplePayload('reboot')}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200 transition"
                  >
                    Reboot (FF)
                  </button>
                  <button
                    type="button"
                    onClick={() => generateSamplePayload('config')}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition"
                  >
                    Config (0A14)
                  </button>
                </div>
              </div>
            </div>

            {/* Confirmed */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                name="confirmed"
                id="confirmed"
                checked={formData.confirmed}
                onChange={handleChange}
                className="mt-1 rounded border-gray-300 text-secondary-600 focus:ring-secondary-500"
              />
              <div className="flex-1">
                <label htmlFor="confirmed" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Request Confirmation
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  If enabled, the device must acknowledge receipt of this message. This provides delivery 
                  confirmation but uses more airtime and may cause additional delays.
                </p>
              </div>
            </div>

            {/* Warning for confirmed */}
            {formData.confirmed && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3">
                <div className="flex items-start gap-2">
                  <FiAlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> Confirmed downlinks use more airtime and count towards your 
                    duty cycle limits. Use sparingly for critical commands only.
                  </p>
                </div>
              </div>
            )}

            {/* Device Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Device:</span>
                  <span className="font-semibold text-gray-900 ml-2">{device.device_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">DevEUI:</span>
                  <span className="font-mono text-xs text-gray-900 ml-2">{device.dev_eui}</span>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="font-semibold text-gray-900 ml-2">{device.device_type}</span>
                </div>
                <div>
                  <span className="text-gray-600">Profile:</span>
                  <span className="font-semibold text-gray-900 ml-2">{device.profile_name}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
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
                className="flex-1 px-4 py-2.5 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend />
                    Send Downlink
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Success Info */}
          <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-3">
            <div className="flex items-start gap-2">
              <FiCheckCircle className="text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-800">
                After sending, the downlink will be queued on the network server and delivered to 
                the device on its next uplink transmission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownlinkModal;
