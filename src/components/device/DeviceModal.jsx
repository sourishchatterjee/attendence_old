import React, { useState, useEffect } from 'react';
import { lorawanAPI } from '../../services/lorawanAPI';
import { siteAPI } from '../../services/siteAPI';
import { employeeAPI } from '../../services/employeeAPI';

const DeviceModal = ({ device, organizations, profiles, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'security', 'settings'
  const [sites, setSites] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    organization_id: '',
    site_id: '',
    employee_id: '',
    device_profile_id: '',
    dev_eui: '',
    device_name: '',
    device_description: '',
    device_type: 'Temperature',
    application_key: '',
    network_key: '',
    skip_fcnt_check: false,
    reference_altitude: 0,
    tags: {},
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showKeys, setShowKeys] = useState(false);

  const deviceTypes = [
    'Temperature', 'Humidity', 'Pressure', 'Gas', 'Motion', 
    'Door', 'Water', 'Smoke', 'GPS', 'Electricity', 'Other'
  ];

  useEffect(() => {
    if (device) {
      setFormData({
        organization_id: device.organization_id || '',
        site_id: device.site_id || '',
        employee_id: device.employee_id || '',
        device_profile_id: device.device_profile_id || '',
        dev_eui: device.dev_eui || '',
        device_name: device.device_name || '',
        device_description: device.device_description || '',
        device_type: device.device_type || 'Temperature',
        application_key: device.application_key || '',
        network_key: device.network_key || '',
        skip_fcnt_check: device.skip_fcnt_check || false,
        reference_altitude: device.reference_altitude || 0,
        tags: device.tags || {},
      });
      
      if (device.organization_id) {
        fetchSites(device.organization_id);
        fetchEmployees(device.organization_id);
      }
    }
  }, [device]);

  useEffect(() => {
    if (formData.organization_id) {
      fetchSites(formData.organization_id);
      fetchEmployees(formData.organization_id);
    } else {
      setSites([]);
      setEmployees([]);
      setFormData(prev => ({ ...prev, site_id: '', employee_id: '' }));
    }
  }, [formData.organization_id]);

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

  const fetchEmployees = async (orgId) => {
    try {
      const response = await employeeAPI.getAllEmployees({ 
        organization_id: orgId,
        pageSize: 1000 
      });
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }
    if (!formData.device_profile_id) {
      newErrors.device_profile_id = 'Device profile is required';
    }
    if (!formData.dev_eui || formData.dev_eui.trim() === '') {
      newErrors.dev_eui = 'Device EUI is required';
    } else if (!/^[0-9A-Fa-f]{16}$/.test(formData.dev_eui.replace(/:/g, ''))) {
      newErrors.dev_eui = 'Device EUI must be 16 hex characters';
    }
    if (!formData.device_name || formData.device_name.trim() === '') {
      newErrors.device_name = 'Device name is required';
    }
    if (!formData.device_type) {
      newErrors.device_type = 'Device type is required';
    }
    
    // Validate keys only for new devices
    if (!device) {
      if (!formData.application_key || formData.application_key.trim() === '') {
        newErrors.application_key = 'Application Key is required';
      } else if (!/^[0-9A-Fa-f]{32}$/.test(formData.application_key.replace(/:/g, ''))) {
        newErrors.application_key = 'Application Key must be 32 hex characters';
      }
      if (!formData.network_key || formData.network_key.trim() === '') {
        newErrors.network_key = 'Network Key is required';
      } else if (!/^[0-9A-Fa-f]{32}$/.test(formData.network_key.replace(/:/g, ''))) {
        newErrors.network_key = 'Network Key must be 32 hex characters';
      }
    }

    if (formData.reference_altitude && isNaN(formData.reference_altitude)) {
      newErrors.reference_altitude = 'Reference altitude must be a number';
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
        employee_id: formData.employee_id ? parseInt(formData.employee_id, 10) : null,
        device_profile_id: parseInt(formData.device_profile_id, 10),
        dev_eui: formData.dev_eui.replace(/:/g, '').toUpperCase(),
        device_name: formData.device_name.trim(),
        device_description: formData.device_description.trim() || null,
        device_type: formData.device_type,
        skip_fcnt_check: formData.skip_fcnt_check,
        reference_altitude: parseFloat(formData.reference_altitude) || 0,
        tags: formData.tags,
      };

      // Only include keys for new devices
      if (!device) {
        submitData.application_key = formData.application_key.replace(/:/g, '').toUpperCase();
        submitData.network_key = formData.network_key.replace(/:/g, '').toUpperCase();
      }

      if (device) {
        await lorawanAPI.updateDevice(device.device_id, submitData);
        alert('✅ Device updated successfully');
      } else {
        await lorawanAPI.createDevice(submitData);
        alert('✅ Device created successfully');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to save device'}`);
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

  const formatHex = (value, length) => {
    const cleaned = value.replace(/[^0-9A-Fa-f]/g, '');
    const formatted = cleaned.match(new RegExp(`.{1,2}`, 'g'))?.join(':') || cleaned;
    return formatted.toUpperCase().slice(0, length);
  };

  const generateRandomKey = (length) => {
    const chars = '0123456789ABCDEF';
    let key = '';
    for (let i = 0; i < length; i++) {
      key += chars[Math.floor(Math.random() * 16)];
    }
    return key;
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
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-2xl">
              📱
            </div>
            <h3 className="text-xl font-bold text-secondary-700">
              {device ? 'Edit LoRaWAN Device' : 'Add New LoRaWAN Device'}
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
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'security'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Security Keys
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'settings'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Settings
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
                    disabled={!!device}
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

                {/* Site & Employee */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Assigned Employee
                    </label>
                    <select
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleChange}
                      disabled={!formData.organization_id}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:bg-gray-100"
                    >
                      <option value="">Select Employee (Optional)</option>
                      {employees.map(emp => (
                        <option key={emp.employee_id} value={emp.employee_id}>
                          {emp.first_name} {emp.last_name} ({emp.employee_code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Device Profile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Device Profile <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="device_profile_id"
                    value={formData.device_profile_id}
                    onChange={handleChange}
                    disabled={!!device}
                    className={`w-full px-3 py-2 border ${
                      errors.device_profile_id ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:bg-gray-100`}
                  >
                    <option value="">Select Device Profile</option>
                    {profiles.map(profile => (
                      <option key={profile.profile_id} value={profile.profile_id}>
                        {profile.profile_name} ({profile.lorawan_region})
                      </option>
                    ))}
                  </select>
                  {errors.device_profile_id && (
                    <p className="text-red-500 text-xs mt-1">{errors.device_profile_id}</p>
                  )}
                </div>

                {/* Device EUI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Device EUI (DevEUI) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dev_eui"
                    value={formData.dev_eui}
                    onChange={(e) => {
                      const formatted = formatHex(e.target.value, 23);
                      setFormData({ ...formData, dev_eui: formatted });
                      if (errors.dev_eui) {
                        setErrors({ ...errors, dev_eui: '' });
                      }
                    }}
                    disabled={!!device}
                    placeholder="00:00:00:00:00:00:00:01"
                    maxLength={23}
                    className={`w-full px-3 py-2 border ${
                      errors.dev_eui ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm font-mono disabled:bg-gray-100`}
                  />
                  {errors.dev_eui && (
                    <p className="text-red-500 text-xs mt-1">{errors.dev_eui}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">16 hexadecimal characters (unique device identifier)</p>
                </div>

                {/* Device Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Device Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="device_name"
                    value={formData.device_name}
                    onChange={handleChange}
                    placeholder="e.g., Temperature Sensor #1"
                    className={`w-full px-3 py-2 border ${
                      errors.device_name ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  />
                  {errors.device_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.device_name}</p>
                  )}
                </div>

                {/* Device Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Device Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="device_type"
                    value={formData.device_type}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.device_type ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  >
                    {deviceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.device_type && (
                    <p className="text-red-500 text-xs mt-1">{errors.device_type}</p>
                  )}
                </div>

                {/* Device Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="device_description"
                    value={formData.device_description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the device location and purpose..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm resize-none"
                  />
                </div>
              </>
            )}

            {/* Security Keys Tab */}
            {activeTab === 'security' && (
              <>
                {device ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold">Security Keys Cannot Be Modified</p>
                        <p className="mt-1">Device security keys are set during device creation and cannot be changed. To view keys, use the "View Keys" option from the device details page.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Application Key */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Application Key (AppKey) <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const key = generateRandomKey(32);
                            setFormData({ ...formData, application_key: key });
                            if (errors.application_key) {
                              setErrors({ ...errors, application_key: '' });
                            }
                          }}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Generate Random
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showKeys ? "text" : "password"}
                          name="application_key"
                          value={formData.application_key}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
                            setFormData({ ...formData, application_key: cleaned });
                            if (errors.application_key) {
                              setErrors({ ...errors, application_key: '' });
                            }
                          }}
                          placeholder="00000000000000000000000000000000"
                          maxLength={32}
                          className={`w-full px-3 py-2 pr-10 border ${
                            errors.application_key ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm font-mono`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowKeys(!showKeys)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showKeys ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.application_key && (
                        <p className="text-red-500 text-xs mt-1">{errors.application_key}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">32 hexadecimal characters (used for OTAA)</p>
                    </div>

                    {/* Network Key */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Network Key (NwkKey) <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const key = generateRandomKey(32);
                            setFormData({ ...formData, network_key: key });
                            if (errors.network_key) {
                              setErrors({ ...errors, network_key: '' });
                            }
                          }}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Generate Random
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showKeys ? "text" : "password"}
                          name="network_key"
                          value={formData.network_key}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
                            setFormData({ ...formData, network_key: cleaned });
                            if (errors.network_key) {
                              setErrors({ ...errors, network_key: '' });
                            }
                          }}
                          placeholder="00000000000000000000000000000000"
                          maxLength={32}
                          className={`w-full px-3 py-2 pr-10 border ${
                            errors.network_key ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm font-mono`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowKeys(!showKeys)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showKeys ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.network_key && (
                        <p className="text-red-500 text-xs mt-1">{errors.network_key}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">32 hexadecimal characters (used for network security)</p>
                    </div>

                    {/* Security Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <div className="text-xs text-blue-800">
                          <p className="font-semibold">Security Key Information</p>
                          <p className="mt-0.5">• <strong>AppKey:</strong> Used for OTAA device activation</p>
                          <p>• <strong>NwkKey:</strong> Used for network security and MAC commands</p>
                          <p>• Both keys must be exactly 32 hexadecimal characters</p>
                          <p>• Keys are stored securely and cannot be changed after creation</p>
                          <p>• Use "Generate Random" for cryptographically secure keys</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <>
                {/* Skip Frame Counter Check */}
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="skip_fcnt_check"
                      checked={formData.skip_fcnt_check}
                      onChange={handleChange}
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Skip Frame Counter Check</span>
                      <p className="text-xs text-gray-600 mt-1">
                        ⚠️ Warning: Disabling frame counter validation reduces security. Only enable for testing or if your device resets frequently.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Reference Altitude */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Reference Altitude (meters)
                  </label>
                  <input
                    type="number"
                    name="reference_altitude"
                    value={formData.reference_altitude}
                    onChange={handleChange}
                    step="0.1"
                    placeholder="0"
                    className={`w-full px-3 py-2 border ${
                      errors.reference_altitude ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  />
                  {errors.reference_altitude && (
                    <p className="text-red-500 text-xs mt-1">{errors.reference_altitude}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Used for altitude-based geolocation adjustments</p>
                </div>

                {/* Settings Info Box */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="text-xs text-purple-800">
                      <p className="font-semibold">Advanced Settings</p>
                      <p className="mt-0.5">• Frame counter validation prevents replay attacks</p>
                      <p>• Reference altitude improves GPS-based tracking accuracy</p>
                      <p>• These settings can be modified after device creation</p>
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
                {loading ? 'Saving...' : device ? 'Update Device' : 'Add Device'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeviceModal;
