import React, { useState, useEffect } from 'react';
import { lorawanAPI } from '../../services/lorawanAPI';

const DeviceKeysModal = ({ device, onClose }) => {
  const [keys, setKeys] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showKeys, setShowKeys] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await lorawanAPI.getDeviceKeys(device.device_id);
      setKeys(response.data);
    } catch (err) {
      console.error('Error fetching keys:', err);
      setError(err.message || 'Failed to fetch device keys. You may not have permission.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, keyName) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(keyName);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const maskKey = (key) => {
    if (!key) return 'N/A';
    if (showKeys) return key;
    return '••••••••••••••••••••••••••••••••';
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
        <div className="relative inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
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
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary-700">Device Security Keys</h3>
              <p className="text-sm text-gray-500">{device.device_name} ({device.dev_eui})</p>
            </div>
          </div>

          {/* Security Warning */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm text-red-800">
                <p className="font-semibold">⚠️ Sensitive Information</p>
                <p className="mt-1">These keys are highly sensitive security credentials. Never share them publicly or commit them to version control. Unauthorized access to these keys could compromise your device security.</p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <p className="text-gray-500 ml-3">Loading keys...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Keys Display */}
          {!loading && !error && keys && (
            <div className="space-y-4">
              {/* Toggle Visibility */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowKeys(!showKeys)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition"
                >
                  {showKeys ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                      Hide Keys
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Show Keys
                    </>
                  )}
                </button>
              </div>

              {/* Device EUI */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-blue-900">Device EUI (DevEUI)</label>
                  <button
                    onClick={() => copyToClipboard(keys.dev_eui, 'dev_eui')}
                    className="text-blue-600 hover:text-blue-700 transition"
                    title="Copy to clipboard"
                  >
                    {copiedKey === 'dev_eui' ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="bg-white rounded p-3 font-mono text-sm text-gray-900 break-all">
                  {keys.dev_eui || 'N/A'}
                </div>
                <p className="text-xs text-blue-700 mt-2">Unique 64-bit device identifier</p>
              </div>

              {/* Device Address */}
              {keys.dev_addr && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-purple-900">Device Address (DevAddr)</label>
                    <button
                      onClick={() => copyToClipboard(keys.dev_addr, 'dev_addr')}
                      className="text-purple-600 hover:text-purple-700 transition"
                      title="Copy to clipboard"
                    >
                      {copiedKey === 'dev_addr' ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="bg-white rounded p-3 font-mono text-sm text-gray-900">
                    {keys.dev_addr}
                  </div>
                  <p className="text-xs text-purple-700 mt-2">32-bit network address (assigned after activation)</p>
                </div>
              )}

              {/* Application Key */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-green-900">Application Key (AppKey)</label>
                  <button
                    onClick={() => copyToClipboard(keys.application_key, 'app_key')}
                    className="text-green-600 hover:text-green-700 transition"
                    title="Copy to clipboard"
                    disabled={!showKeys}
                  >
                    {copiedKey === 'app_key' ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="bg-white rounded p-3 font-mono text-sm text-gray-900 break-all">
                  {maskKey(keys.application_key)}
                </div>
                <p className="text-xs text-green-700 mt-2">128-bit AES key for OTAA activation</p>
              </div>

              {/* Network Key */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-orange-900">Network Key (NwkKey)</label>
                  <button
                    onClick={() => copyToClipboard(keys.network_key, 'nwk_key')}
                    className="text-orange-600 hover:text-orange-700 transition"
                    title="Copy to clipboard"
                    disabled={!showKeys}
                  >
                    {copiedKey === 'nwk_key' ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="bg-white rounded p-3 font-mono text-sm text-gray-900 break-all">
                  {maskKey(keys.network_key)}
                </div>
                <p className="text-xs text-orange-700 mt-2">128-bit AES key for network security</p>
              </div>

              {/* Session Keys */}
              {keys.app_s_key && (
                <>
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-indigo-900">Application Session Key (AppSKey)</label>
                      <button
                        onClick={() => copyToClipboard(keys.app_s_key, 'app_s_key')}
                        className="text-indigo-600 hover:text-indigo-700 transition"
                        title="Copy to clipboard"
                        disabled={!showKeys}
                      >
                        {copiedKey === 'app_s_key' ? (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="bg-white rounded p-3 font-mono text-sm text-gray-900 break-all">
                      {maskKey(keys.app_s_key)}
                    </div>
                    <p className="text-xs text-indigo-700 mt-2">Session key for application data encryption</p>
                  </div>

                  {keys.nwk_s_enc_key && (
                    <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-pink-900">Network Session Encryption Key (NwkSEncKey)</label>
                        <button
                          onClick={() => copyToClipboard(keys.nwk_s_enc_key, 'nwk_s_enc_key')}
                          className="text-pink-600 hover:text-pink-700 transition"
                          title="Copy to clipboard"
                          disabled={!showKeys}
                        >
                          {copiedKey === 'nwk_s_enc_key' ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="bg-white rounded p-3 font-mono text-sm text-gray-900 break-all">
                        {maskKey(keys.nwk_s_enc_key)}
                      </div>
                      <p className="text-xs text-pink-700 mt-2">Session key for MAC command encryption</p>
                    </div>
                  )}
                </>
              )}

              {/* Info Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-gray-700">
                    <p className="font-semibold">Key Usage Information</p>
                    <p className="mt-0.5">• <strong>Root Keys (AppKey, NwkKey):</strong> Used during OTAA join procedure</p>
                    <p>• <strong>Session Keys (AppSKey, NwkSEncKey):</strong> Derived during activation for ongoing communication</p>
                    <p>• All keys are 128-bit (32 hexadecimal characters)</p>
                    <p>• Never share these keys or store them in unsecured locations</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-6 border-t mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceKeysModal;
