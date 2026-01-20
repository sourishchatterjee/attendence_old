import React from 'react';

const ProfileDetailsModal = ({ profile, onClose, onEdit, onRefresh }) => {
  const getRegionColor = (region) => {
    const colors = {
      'AS923': 'bg-blue-100 text-blue-800',
      'AU915': 'bg-green-100 text-green-800',
      'CN470': 'bg-red-100 text-red-800',
      'EU868': 'bg-purple-100 text-purple-800',
      'IN865': 'bg-orange-100 text-orange-800',
      'KR920': 'bg-pink-100 text-pink-800',
      'US915': 'bg-indigo-100 text-indigo-800',
    };
    return colors[region] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
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

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{profile.profile_name || 'Device Profile'}</h3>
                <p className="text-sm text-gray-600 mt-1">{profile.organization_name || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRegionColor(profile.lorawan_region)}`}>
                  {profile.lorawan_region}
                </span>
                {profile.is_active ? (
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-400 text-white rounded-full text-xs font-semibold">
                    Inactive
                  </span>
                )}
              </div>
            </div>
            {profile.profile_description && (
              <p className="text-sm text-gray-600">{profile.profile_description}</p>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700">Profile ID</p>
                <p className="font-semibold text-blue-900">{profile.profile_id}</p>
              </div>
              <div>
                <p className="text-blue-700">Device Count</p>
                <p className="font-semibold text-blue-900">{profile.device_count || 0} devices</p>
              </div>
              <div>
                <p className="text-blue-700">Created At</p>
                <p className="font-semibold text-blue-900">{formatDate(profile.created_at)}</p>
              </div>
              <div>
                <p className="text-blue-700">Status</p>
                <p className="font-semibold text-blue-900">{profile.is_active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>

          {/* LoRaWAN Configuration */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mb-6">
            <h4 className="text-sm font-semibold text-purple-900 mb-3">LoRaWAN Configuration</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-purple-700">LoRaWAN Version</p>
                <p className="font-semibold text-purple-900">{profile.lorawan_version || 'N/A'}</p>
              </div>
              <div>
                <p className="text-purple-700">MAC Version</p>
                <p className="font-semibold text-purple-900">{profile.mac_version || 'N/A'}</p>
              </div>
              <div>
                <p className="text-purple-700">Region</p>
                <p className="font-semibold text-purple-900">{profile.lorawan_region || 'N/A'}</p>
              </div>
              <div>
                <p className="text-purple-700">Reg Params Revision</p>
                <p className="font-semibold text-purple-900">{profile.reg_params_revision || 'N/A'}</p>
              </div>
              <div>
                <p className="text-purple-700">Max EIRP</p>
                <p className="font-semibold text-purple-900">{profile.max_eirp || 0} dBm</p>
              </div>
              <div>
                <p className="text-purple-700">ADR Algorithm</p>
                <p className="font-semibold text-purple-900">{profile.adr_algorithm_id || 'default'}</p>
              </div>
            </div>
          </div>

          {/* Device Capabilities */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-6">
            <h4 className="text-sm font-semibold text-green-900 mb-3">Device Capabilities</h4>
            <div className="flex flex-wrap gap-2">
              {profile.supports_otaa && (
                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">
                  ✓ OTAA
                </span>
              )}
              {profile.supports_class_b && (
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
                  ✓ Class B
                </span>
              )}
              {profile.supports_class_c && (
                <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold">
                  ✓ Class C
                </span>
              )}
              {!profile.supports_otaa && !profile.supports_class_b && !profile.supports_class_c && (
                <span className="text-sm text-gray-500">No special capabilities configured</span>
              )}
            </div>
          </div>

          {/* RX Window Configuration */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 mb-6">
            <h4 className="text-sm font-semibold text-indigo-900 mb-3">RX Window Configuration</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-indigo-700">RX Delay 1</p>
                <p className="font-semibold text-indigo-900">{profile.rx_delay_1 || 0}s</p>
              </div>
              <div>
                <p className="text-indigo-700">RX DR Offset 1</p>
                <p className="font-semibold text-indigo-900">{profile.rx_dr_offset_1 || 0}</p>
              </div>
              <div>
                <p className="text-indigo-700">RX Data Rate 2</p>
                <p className="font-semibold text-indigo-900">{profile.rx_data_rate_2 || 0}</p>
              </div>
              <div>
                <p className="text-indigo-700">RX Frequency 2</p>
                <p className="font-semibold text-indigo-900">{profile.rx_freq_2 || 0} Hz</p>
              </div>
            </div>
          </div>

          {/* Payload Codec */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 mb-6">
            <h4 className="text-sm font-semibold text-orange-900 mb-3">Payload Codec</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-orange-700 mb-1">Codec Type</p>
                <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-xs font-semibold">
                  {profile.payload_codec || 'NONE'}
                </span>
              </div>

              {profile.payload_decoder_script && (
                <div>
                  <p className="text-xs text-orange-700 mb-1">Decoder Script</p>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto max-h-48">
                    {profile.payload_decoder_script}
                  </pre>
                </div>
              )}

              {profile.payload_encoder_script && (
                <div>
                  <p className="text-xs text-orange-700 mb-1">Encoder Script</p>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto max-h-48">
                    {profile.payload_encoder_script}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {profile.tags && Object.keys(profile.tags).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(profile.tags).map(([key, value]) => (
                  <span key={key} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                    <span className="font-semibold">{key}:</span> {value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t">
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
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailsModal;
