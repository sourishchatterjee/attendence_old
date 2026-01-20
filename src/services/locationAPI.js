import apiClient from './api';

export const locationAPI = {
  // ============ LOCATION ZONES ============
  
  /**
   * Create new location zone
   * POST /locations/zones
   * @param {Object} zoneData - Zone data
   */
  createZone: async (zoneData) => {
    try {
      const response = await apiClient.post('/locations/zones', zoneData);
      return response;
    } catch (error) {
      console.error('Create zone error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all location zones with pagination and filters
   * GET /locations/zones
   * @param {Object} params - Query parameters
   */
  getAllZones: async (params = {}) => {
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
            cleanParams[key] = value === true || value === 'true';
          } else {
            cleanParams[key] = value;
          }
        }
      });

      const response = await apiClient.get('/locations/zones', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get zones error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get zone by ID
   * GET /locations/zones/:id
   * @param {string|number} id - Zone ID
   */
  getZoneById: async (id) => {
    try {
      const zoneId = parseInt(id, 10);
      if (isNaN(zoneId)) {
        throw new Error('Invalid zone ID');
      }
      const response = await apiClient.get(`/locations/zones/${zoneId}`);
      return response;
    } catch (error) {
      console.error('Get zone error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update zone
   * PUT /locations/zones/:id
   * @param {string|number} id - Zone ID
   * @param {Object} zoneData - Updated zone data
   */
  updateZone: async (id, zoneData) => {
    try {
      const zoneId = parseInt(id, 10);
      if (isNaN(zoneId)) {
        throw new Error('Invalid zone ID');
      }
      const response = await apiClient.put(`/locations/zones/${zoneId}`, zoneData);
      return response;
    } catch (error) {
      console.error('Update zone error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete zone
   * DELETE /locations/zones/:id
   * @param {string|number} id - Zone ID
   */
  deleteZone: async (id) => {
    try {
      const zoneId = parseInt(id, 10);
      if (isNaN(zoneId)) {
        throw new Error('Invalid zone ID');
      }
      const response = await apiClient.delete(`/locations/zones/${zoneId}`);
      return response;
    } catch (error) {
      console.error('Delete zone error:', error);
      throw error.response?.data || error;
    }
  },

  // ============ LOCATIONS ============

  /**
   * Create new location
   * POST /locations
   * @param {Object} locationData - Location data
   */
  createLocation: async (locationData) => {
    try {
      const response = await apiClient.post('/locations', locationData);
      return response;
    } catch (error) {
      console.error('Create location error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all locations with pagination and filters
   * GET /locations
   * @param {Object} params - Query parameters
   */
  getAllLocations: async (params = {}) => {
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
            cleanParams[key] = value === true || value === 'true';
          } else {
            cleanParams[key] = value;
          }
        }
      });

      const response = await apiClient.get('/locations', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get locations error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get location by ID
   * GET /locations/:id
   * @param {string|number} id - Location ID
   */
  getLocationById: async (id) => {
    try {
      const locationId = parseInt(id, 10);
      if (isNaN(locationId)) {
        throw new Error('Invalid location ID');
      }
      const response = await apiClient.get(`/locations/${locationId}`);
      return response;
    } catch (error) {
      console.error('Get location error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update location
   * PUT /locations/:id
   * @param {string|number} id - Location ID
   * @param {Object} locationData - Updated location data
   */
  updateLocation: async (id, locationData) => {
    try {
      const locationId = parseInt(id, 10);
      if (isNaN(locationId)) {
        throw new Error('Invalid location ID');
      }
      const response = await apiClient.put(`/locations/${locationId}`, locationData);
      return response;
    } catch (error) {
      console.error('Update location error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete location
   * DELETE /locations/:id
   * @param {string|number} id - Location ID
   */
  deleteLocation: async (id) => {
    try {
      const locationId = parseInt(id, 10);
      if (isNaN(locationId)) {
        throw new Error('Invalid location ID');
      }
      const response = await apiClient.delete(`/locations/${locationId}`);
      return response;
    } catch (error) {
      console.error('Delete location error:', error);
      throw error.response?.data || error;
    }
  },
};
