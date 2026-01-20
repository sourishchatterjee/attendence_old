import React, { useState, useEffect } from 'react';
import { FiUsers, FiPlus, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { IoHardwareChipOutline } from 'react-icons/io5';
import { lorawanAPI } from '../../services/lorawanAPI';

const AssignDeviceModal = ({ application, onClose, onSuccess }) => {
  const [devices, setDevices] = useState([]);
  const [assignedDevices, setAssignedDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoadingDevices(true);
      // Fetch all devices for the organization
      const response = await lorawanAPI.getAllDevices({
        organization_id: application.organization_id,
        pageSize: 1000,
      });
      const devicesData = response.data || response || [];
      setDevices(Array.isArray(devicesData) ? devicesData : []);
      
      // Filter already assigned devices (mock - you'll need actual API)
      // In real implementation, you'd have an API to get assigned devices
      setAssignedDevices([]);
    } catch (err) {
      console.error('Error fetching devices:', err);
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleAssignDevice = async () => {
    if (!selectedDeviceId) {
      alert('Please select a device');
      return;
    }

    setLoading(true);
    try {
      await lorawanAPI.assignDeviceToApplication({
        application_id: application.application_id,
        device_id: parseInt(selectedDeviceId, 10),
      });
      
      const device = devices.find(d => d.device_id === parseInt(selectedDeviceId));
      if (device) {
        setAssignedDevices([...assignedDevices, device]);
      }
      setSelectedDeviceId('');
      alert('✅ Device assigned successfully');
    } catch (err) {
      console.error('Assign device error:', err);
      alert(`❌ ${err.message || 'Failed to assign device'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDevice = async (assignmentId, deviceName) => {
    if (window.confirm(`Remove "${deviceName}" from this application?`)) {
      try {
        await lorawanAPI.removeDeviceFromApplication(assignmentId);
        setAssignedDevices(assignedDevices.filter(d => d.device_id !== assignmentId));
        alert('✅ Device removed successfully');
      } catch (err) {
        console.error('Remove device error:', err);
        alert(`❌ ${err.message || 'Failed to remove device'}`);
      }
    }
  };

  const availableDevices = devices.filter(
    device => !assignedDevices.some(ad => ad.device_id === device.device_id)
  );

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
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FiUsers className="text-2xl text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary-700">Assign Devices</h3>
              <p className="text-sm text-gray-500">{application.application_name}</p>
            </div>
          </div>

          {/* Assign New Device */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">Assign New Device</h4>
            <div className="flex gap-3">
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                disabled={loadingDevices}
                className="flex-1 px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm bg-white disabled:bg-gray-100"
              >
                <option value="">Select a device...</option>
                {availableDevices.map(device => (
                  <option key={device.device_id} value={device.device_id}>
                    {device.device_name} ({device.dev_eui})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignDevice}
                disabled={!selectedDeviceId || loading}
                className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlus />
                Assign
              </button>
            </div>
            {availableDevices.length === 0 && !loadingDevices && (
              <p className="text-xs text-blue-700 mt-2">
                All devices are already assigned to this application
              </p>
            )}
          </div>

          {/* Assigned Devices List */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiCheckCircle className="text-green-600" />
              Assigned Devices ({assignedDevices.length})
            </h4>

            {loadingDevices ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="text-gray-500 ml-3">Loading devices...</p>
              </div>
            ) : assignedDevices.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <IoHardwareChipOutline className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No devices assigned</p>
                <p className="text-gray-400 text-sm mt-1">
                  Select a device above to assign it to this application
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {assignedDevices.map((device) => (
                  <div
                    key={device.device_id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                        <IoHardwareChipOutline className="text-white text-xl" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{device.device_name}</div>
                        <div className="text-xs text-gray-500 font-mono">{device.dev_eui}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {device.device_type}
                      </span>
                      <button
                        onClick={() => handleRemoveDevice(device.device_id, device.device_name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Remove device"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                onSuccess();
              }}
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignDeviceModal;
