import React from 'react';
import { 
  FiPackage, 
  FiCode, 
  FiLink, 
  FiSettings,
  FiTag,
  FiEdit2,
  FiUsers
} from 'react-icons/fi';
import { 
  IoAppsOutline,
  IoCodeSlashOutline,
  IoGlobeOutline,
  IoLayersOutline
} from 'react-icons/io5';


const ApplicationDetailsModal = ({ application, onClose, onEdit, onRefresh }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'N/A';
    }
  };


  const getCodecIcon = (codec) => {
    const icons = {
      'CUSTOM': { icon: <IoCodeSlashOutline />, color: 'text-purple-600', bg: 'bg-purple-100' },
      'CAYENNE_LPP': { icon: <IoLayersOutline />, color: 'text-blue-600', bg: 'bg-blue-100' },
      'JSON': { icon: <FiCode />, color: 'text-green-600', bg: 'bg-green-100' },
      'NONE': { icon: <FiCode />, color: 'text-gray-600', bg: 'bg-gray-100' },
    };
    return icons[codec] || icons['NONE'];
  };


  const codecIcon = getCodecIcon(application.payload_codec);


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
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <IoAppsOutline className="text-3xl text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{application.application_name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{application.organization_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  application.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {application.is_active ? '● Active' : '○ Inactive'}
                </span>
              </div>
            </div>
            {application.application_description && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded p-3 border border-gray-200">
                {application.application_description}
              </p>
            )}
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <FiPackage className="w-4 h-4" />
                  Basic Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Application ID:</span>
                    <span className="font-semibold text-blue-900">{application.application_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Organization:</span>
                    <span className="font-semibold text-blue-900">{application.organization_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Created:</span>
                    <span className="font-semibold text-blue-900">{formatDate(application.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Status:</span>
                    <span className={`font-semibold ${application.is_active ? 'text-green-700' : 'text-gray-700'}`}>
                      {application.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>


              {/* Device Count */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <FiUsers className="w-4 h-4" />
                  Assigned Devices
                </h4>
                <div className="text-center py-4">
                  <div className="text-5xl font-bold text-purple-600 mb-2">
                    {application.device_count || 0}
                  </div>
                  <p className="text-sm text-purple-700">Total devices assigned</p>
                </div>
              </div>


              {/* Payload Codec */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <FiCode className="w-4 h-4" />
                  Payload Codec
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${codecIcon.bg} flex items-center justify-center ${codecIcon.color} text-xl`}>
                      {codecIcon.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{application.payload_codec || 'NONE'}</div>
                      <div className="text-xs text-gray-600">
                        {application.payload_codec === 'CUSTOM' && 'Custom JavaScript codec'}
                        {application.payload_codec === 'CAYENNE_LPP' && 'Cayenne LPP format'}
                        {application.payload_codec === 'JSON' && 'JSON payload format'}
                        {application.payload_codec === 'NONE' && 'No payload decoding'}
                      </div>
                    </div>
                  </div>


                  {application.payload_codec === 'CUSTOM' && (
                    <>
                      {application.payload_decoder_script && (
                        <div>
                          <p className="text-xs font-semibold text-green-700 mb-1">Decoder Script:</p>
                          <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto max-h-40">
                            {application.payload_decoder_script}
                          </pre>
                        </div>
                      )}
                      {application.payload_encoder_script && (
                        <div>
                          <p className="text-xs font-semibold text-green-700 mb-1">Encoder Script:</p>
                          <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto max-h-40">
                            {application.payload_encoder_script}
                          </pre>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>


            {/* Right Column */}
            <div className="space-y-6">
              {/* MQTT Integration */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h4 className="text-sm font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <IoGlobeOutline className="w-4 h-4" />
                  MQTT Integration
                </h4>
                {application.mqtt_topic_prefix ? (
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-orange-700 mb-1">Topic Prefix:</p>
                      <code className="block bg-white px-3 py-2 rounded text-sm font-mono text-gray-900 border border-orange-300">
                        {application.mqtt_topic_prefix}
                      </code>
                    </div>
                    <div className="bg-orange-100 rounded p-2 text-xs text-orange-800">
                      <p className="font-semibold mb-1">Example Topics:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        <li>• {application.mqtt_topic_prefix}/&#123;dev_eui&#125;/up</li>
                        <li>• {application.mqtt_topic_prefix}/&#123;dev_eui&#125;/down</li>
                        <li>• {application.mqtt_topic_prefix}/&#123;dev_eui&#125;/join</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-orange-600">
                    No MQTT integration configured
                  </div>
                )}
              </div>


              {/* Webhook Integration */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <FiLink className="w-4 h-4" />
                  Webhook Integration
                </h4>
                {application.webhook_url ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-red-700 mb-1">Webhook URL:</p>
                      <code className="block bg-white px-3 py-2 rounded text-xs font-mono text-gray-900 border border-red-300 break-all">
                        {application.webhook_url}
                      </code>
                    </div>
                    {application.webhook_headers && Object.keys(application.webhook_headers).length > 0 && (
                      <div>
                        <p className="text-xs text-red-700 mb-2">Custom Headers:</p>
                        <div className="space-y-1">
                          {Object.entries(application.webhook_headers).map(([key, value]) => (
                            <div key={key} className="bg-white px-3 py-2 rounded border border-red-300 text-xs">
                              <span className="font-semibold text-gray-900">{key}:</span>
                              <span className="text-gray-700 ml-2 font-mono">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-red-600">
                    No webhook integration configured
                  </div>
                )}
              </div>


              {/* Tags */}
              {application.tags && Object.keys(application.tags).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiTag className="w-4 h-4" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(application.tags).map(([key, value]) => (
                      <span key={key} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                        <span className="font-semibold">{key}:</span> {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* Footer */}
          <div className="flex gap-3 pt-6 border-t mt-6">
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
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm flex items-center justify-center gap-2"
            >
              <FiEdit2 />
              Edit Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ApplicationDetailsModal;
