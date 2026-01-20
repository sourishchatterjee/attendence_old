import apiClient from './api';

export const lorawanAPI = {
  // ============ DEVICE PROFILES ============
  
  /**
   * Create new device profile
   * POST /lorawan/profiles
   * @param {Object} profileData - Device profile data
   */
  createProfile: async (profileData) => {
    try {
      const response = await apiClient.post('/lorawan/profiles', profileData);
      return response;
    } catch (error) {
      console.error('Create profile error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all device profiles with filters
   * GET /lorawan/profiles
   * @param {Object} params - Query parameters
   */
  getAllProfiles: async (params = {}) => {
    try {
      const cleanParams = {};
      
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          if (key.includes('_id')) {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue)) {
              cleanParams[key] = numValue;
            }
          } else if (key === 'is_active') {
            cleanParams[key] = value === 'true' || value === true;
          } else {
            cleanParams[key] = value;
          }
        }
      });

      const response = await apiClient.get('/lorawan/profiles', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get profiles error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get device profile by ID
   * GET /lorawan/profiles/:id
   * @param {string|number} id - Profile ID
   */
  getProfileById: async (id) => {
    try {
      const profileId = parseInt(id, 10);
      if (isNaN(profileId)) {
        throw new Error('Invalid profile ID');
      }
      const response = await apiClient.get(`/lorawan/profiles/${profileId}`);
      return response;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update device profile
   * PUT /lorawan/profiles/:id
   * @param {string|number} id - Profile ID
   * @param {Object} profileData - Updated profile data
   */
  updateProfile: async (id, profileData) => {
    try {
      const profileId = parseInt(id, 10);
      if (isNaN(profileId)) {
        throw new Error('Invalid profile ID');
      }
      const response = await apiClient.put(`/lorawan/profiles/${profileId}`, profileData);
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete device profile
   * DELETE /lorawan/profiles/:id
   * @param {string|number} id - Profile ID
   */
  deleteProfile: async (id) => {
    try {
      const profileId = parseInt(id, 10);
      if (isNaN(profileId)) {
        throw new Error('Invalid profile ID');
      }
      const response = await apiClient.delete(`/lorawan/profiles/${profileId}`);
      return response;
    } catch (error) {
      console.error('Delete profile error:', error);
      throw error.response?.data || error;
    }
  },









  // ============ GATEWAYS ============
  
  /**
   * Create new gateway
   * POST /lorawan/gateways
   * @param {Object} gatewayData - Gateway data
   */
  createGateway: async (gatewayData) => {
    try {
      const response = await apiClient.post('/lorawan/gateways', gatewayData);
      return response;
    } catch (error) {
      console.error('Create gateway error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all gateways with pagination and filters
   * GET /lorawan/gateways
   * @param {Object} params - Query parameters
   */
  getAllGateways: async (params = {}) => {
    try {
      const cleanParams = {};
      
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          if (key.includes('_id') || key === 'page' || key === 'pageSize') {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue)) {
              cleanParams[key] = numValue;
            }
          } else if (key === 'is_active') {
            cleanParams[key] = value === 'true' || value === true;
          } else {
            cleanParams[key] = value;
          }
        }
      });

      const response = await apiClient.get('/lorawan/gateways', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get gateways error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get gateway by ID
   * GET /lorawan/gateways/:id
   * @param {string|number} id - Gateway ID
   */
  getGatewayById: async (id) => {
    try {
      const gatewayId = parseInt(id, 10);
      if (isNaN(gatewayId)) {
        throw new Error('Invalid gateway ID');
      }
      const response = await apiClient.get(`/lorawan/gateways/${gatewayId}`);
      return response;
    } catch (error) {
      console.error('Get gateway error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update gateway
   * PUT /lorawan/gateways/:id
   * @param {string|number} id - Gateway ID
   * @param {Object} gatewayData - Updated gateway data
   */
  updateGateway: async (id, gatewayData) => {
    try {
      const gatewayId = parseInt(id, 10);
      if (isNaN(gatewayId)) {
        throw new Error('Invalid gateway ID');
      }
      const response = await apiClient.put(`/lorawan/gateways/${gatewayId}`, gatewayData);
      return response;
    } catch (error) {
      console.error('Update gateway error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete gateway
   * DELETE /lorawan/gateways/:id
   * @param {string|number} id - Gateway ID
   */
  deleteGateway: async (id) => {
    try {
      const gatewayId = parseInt(id, 10);
      if (isNaN(gatewayId)) {
        throw new Error('Invalid gateway ID');
      }
      const response = await apiClient.delete(`/lorawan/gateways/${gatewayId}`);
      return response;
    } catch (error) {
      console.error('Delete gateway error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update gateway status
   * PUT /lorawan/gateways/:gateway_eui/status
   * @param {string} gatewayEui - Gateway EUI
   */
  updateGatewayStatus: async (gatewayEui) => {
    try {
      const response = await apiClient.put(`/lorawan/gateways/${gatewayEui}/status`);
      return response;
    } catch (error) {
      console.error('Update gateway status error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get gateway statistics
   * GET /lorawan/gateway-stats/:gateway_id
   * @param {string|number} gatewayId - Gateway ID
   * @param {Object} params - Query parameters
   */
  getGatewayStats: async (gatewayId, params = {}) => {
    try {
      const id = parseInt(gatewayId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid gateway ID');
      }

      const cleanParams = {};
      if (params.interval) {
        cleanParams.interval = params.interval;
      }
      if (params.from_date) {
        cleanParams.from_date = params.from_date;
      }
      if (params.to_date) {
        cleanParams.to_date = params.to_date;
      }

      const response = await apiClient.get(`/lorawan/gateway-stats/${id}`, {
        params: cleanParams
      });
      return response;
    } catch (error) {
      console.error('Get gateway stats error:', error);
      throw error.response?.data || error;
    }
  },

  






  // ============ DEVICES ============
  
  /**
   * Create new LoRaWAN device
   * POST /lorawan/devices
   * @param {Object} deviceData - Device data
   */
  createDevice: async (deviceData) => {
    try {
      const response = await apiClient.post('/lorawan/devices', deviceData);
      return response;
    } catch (error) {
      console.error('Create device error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all LoRaWAN devices with pagination and filters
   * GET /lorawan/devices
   * @param {Object} params - Query parameters
   */
  getAllDevices: async (params = {}) => {
    try {
      const cleanParams = {};
      
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          if (key.includes('_id') || key === 'page' || key === 'pageSize') {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue)) {
              cleanParams[key] = numValue;
            }
          } else if (key === 'is_active' || key === 'is_disabled') {
            cleanParams[key] = value === 'true' || value === true;
          } else {
            cleanParams[key] = value;
          }
        }
      });

      const response = await apiClient.get('/lorawan/devices', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get devices error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get LoRaWAN device by ID
   * GET /lorawan/devices/:id
   * @param {string|number} id - Device ID
   */
  getDeviceById: async (id) => {
    try {
      const deviceId = parseInt(id, 10);
      if (isNaN(deviceId)) {
        throw new Error('Invalid device ID');
      }
      const response = await apiClient.get(`/lorawan/devices/${deviceId}`);
      return response;
    } catch (error) {
      console.error('Get device error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update LoRaWAN device
   * PUT /lorawan/devices/:id
   * @param {string|number} id - Device ID
   * @param {Object} deviceData - Updated device data
   */
  updateDevice: async (id, deviceData) => {
    try {
      const deviceId = parseInt(id, 10);
      if (isNaN(deviceId)) {
        throw new Error('Invalid device ID');
      }
      const response = await apiClient.put(`/lorawan/devices/${deviceId}`, deviceData);
      return response;
    } catch (error) {
      console.error('Update device error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete LoRaWAN device
   * DELETE /lorawan/devices/:id
   * @param {string|number} id - Device ID
   */
  deleteDevice: async (id) => {
    try {
      const deviceId = parseInt(id, 10);
      if (isNaN(deviceId)) {
        throw new Error('Invalid device ID');
      }
      const response = await apiClient.delete(`/lorawan/devices/${deviceId}`);
      return response;
    } catch (error) {
      console.error('Delete device error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get device keys
   * GET /lorawan/devices/:id/keys
   * @param {string|number} id - Device ID
   */
  getDeviceKeys: async (id) => {
    try {
      const deviceId = parseInt(id, 10);
      if (isNaN(deviceId)) {
        throw new Error('Invalid device ID');
      }
      const response = await apiClient.get(`/lorawan/devices/${deviceId}/keys`);
      return response;
    } catch (error) {
      console.error('Get device keys error:', error);
      throw error.response?.data || error;
    }
  },










  // ============ DEVICE DATA & TELEMETRY ============
  
  /**
   * Store device data (Internal/Gateway use)
   * POST /lorawan/data
   * @param {Object} dataPayload - Device data
   */
  storeDeviceData: async (dataPayload) => {
    try {
      const response = await apiClient.post('/lorawan/data', dataPayload);
      return response;
    } catch (error) {
      console.error('Store device data error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get device data
   * GET /lorawan/data
   * @param {Object} params - Query parameters
   */
  getDeviceData: async (params = {}) => {
    try {
      const cleanParams = {};
      
      if (params.device_id) {
        cleanParams.device_id = parseInt(params.device_id, 10);
      }
      if (params.from_date) {
        cleanParams.from_date = params.from_date;
      }
      if (params.to_date) {
        cleanParams.to_date = params.to_date;
      }
      if (params.page) {
        cleanParams.page = parseInt(params.page, 10);
      }
      if (params.pageSize) {
        cleanParams.pageSize = parseInt(params.pageSize, 10);
      }

      const response = await apiClient.get('/lorawan/data', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get device data error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get device telemetry
   * GET /lorawan/telemetry
   * @param {Object} params - Query parameters
   */
  getDeviceTelemetry: async (params = {}) => {
    try {
      const cleanParams = {};
      
      if (params.device_id) {
        cleanParams.device_id = parseInt(params.device_id, 10);
      }
      if (params.from_date) {
        cleanParams.from_date = params.from_date;
      }
      if (params.to_date) {
        cleanParams.to_date = params.to_date;
      }
      if (params.page) {
        cleanParams.page = parseInt(params.page, 10);
      }
      if (params.pageSize) {
        cleanParams.pageSize = parseInt(params.pageSize, 10);
      }

      const response = await apiClient.get('/lorawan/telemetry', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get device telemetry error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get latest device telemetry
   * GET /lorawan/telemetry/latest/:device_id
   * @param {string|number} deviceId - Device ID
   */
  getLatestTelemetry: async (deviceId) => {
    try {
      const id = parseInt(deviceId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid device ID');
      }
      const response = await apiClient.get(`/lorawan/telemetry/latest/${id}`);
      return response;
    } catch (error) {
      console.error('Get latest telemetry error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Export device data
   * GET /lorawan/telemetry/export
   * @param {Object} params - Query parameters
   */
  exportDeviceData: async (params = {}) => {
    try {
      const cleanParams = {};
      
      if (params.device_id) {
        cleanParams.device_id = parseInt(params.device_id, 10);
      }
      if (params.from_date) {
        cleanParams.from_date = params.from_date;
      }
      if (params.to_date) {
        cleanParams.to_date = params.to_date;
      }
      if (params.format) {
        cleanParams.format = params.format;
      }

      const response = await apiClient.get('/lorawan/telemetry/export', { 
        params: cleanParams,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const format = params.format || 'csv';
      link.setAttribute('download', `device_${params.device_id}_data_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Export started' };
    } catch (error) {
      console.error('Export device data error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Send downlink message
   * POST /lorawan/downlink
   * @param {Object} downlinkData - Downlink data
   */
  sendDownlink: async (downlinkData) => {
    try {
      const response = await apiClient.post('/lorawan/downlink', downlinkData);
      return response;
    } catch (error) {
      console.error('Send downlink error:', error);
      throw error.response?.data || error;
    }
  },













  // ============ APPLICATIONS ============
  
  /**
   * Create application
   * POST /lorawan/applications
   * @param {Object} applicationData - Application data
   */
  createApplication: async (applicationData) => {
    try {
      const response = await apiClient.post('/lorawan/applications', applicationData);
      return response;
    } catch (error) {
      console.error('Create application error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all applications
   * GET /lorawan/applications
   * @param {Object} params - Query parameters
   */
  getAllApplications: async (params = {}) => {
    try {
      const cleanParams = {};
      
      if (params.organization_id) {
        cleanParams.organization_id = parseInt(params.organization_id, 10);
      }
      if (params.is_active !== undefined) {
        cleanParams.is_active = params.is_active;
      }
      if (params.page) {
        cleanParams.page = parseInt(params.page, 10);
      }
      if (params.pageSize) {
        cleanParams.pageSize = parseInt(params.pageSize, 10);
      }

      const response = await apiClient.get('/lorawan/applications', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get applications error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get application by ID
   * GET /lorawan/applications/:id
   * @param {string|number} applicationId - Application ID
   */
  getApplicationById: async (applicationId) => {
    try {
      const id = parseInt(applicationId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid application ID');
      }
      const response = await apiClient.get(`/lorawan/applications/${id}`);
      return response;
    } catch (error) {
      console.error('Get application by ID error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update application
   * PUT /lorawan/applications/:id
   * @param {string|number} applicationId - Application ID
   * @param {Object} updateData - Update data
   */
  updateApplication: async (applicationId, updateData) => {
    try {
      const id = parseInt(applicationId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid application ID');
      }
      const response = await apiClient.put(`/lorawan/applications/${id}`, updateData);
      return response;
    } catch (error) {
      console.error('Update application error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete application
   * DELETE /lorawan/applications/:id
   * @param {string|number} applicationId - Application ID
   */
  deleteApplication: async (applicationId) => {
    try {
      const id = parseInt(applicationId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid application ID');
      }
      const response = await apiClient.delete(`/lorawan/applications/${id}`);
      return response;
    } catch (error) {
      console.error('Delete application error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Assign device to application
   * POST /lorawan/applications/assign-device
   * @param {Object} assignmentData - Assignment data
   */
  assignDeviceToApplication: async (assignmentData) => {
    try {
      const response = await apiClient.post('/lorawan/applications/assign-device', assignmentData);
      return response;
    } catch (error) {
      console.error('Assign device error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Remove device from application
   * DELETE /lorawan/applications/assign-device/:id
   * @param {string|number} assignmentId - Assignment ID
   */
  removeDeviceFromApplication: async (assignmentId) => {
    try {
      const id = parseInt(assignmentId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid assignment ID');
      }
      const response = await apiClient.delete(`/lorawan/applications/assign-device/${id}`);
      return response;
    } catch (error) {
      console.error('Remove device error:', error);
      throw error.response?.data || error;
    }
  },



};
