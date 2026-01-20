import apiClient from './api';

export const siteAPI = {
  /**
   * Create new site
   * POST /organizations/sites
   * @param {Object} siteData - Site data
   */
  createSite: async (siteData) => {
    try {
      const response = await apiClient.post('/organizations/sites', siteData);
      return response;
    } catch (error) {
      console.error('Create site error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all sites with pagination and filters
   * GET /organizations/sites
   * @param {Object} params - Query parameters
   */
  getAllSites: async (params = {}) => {
    try {
      // Clean params - remove undefined, null, and 'all' values
      const cleanParams = {};
      
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          // Convert string numbers to integers for IDs
          if (key.includes('_id') || key === 'page' || key === 'pageSize') {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue)) {
              cleanParams[key] = numValue;
            }
          } else if (key === 'is_active') {
            // Convert to boolean
            cleanParams[key] = value === true || value === 'true';
          } else {
            cleanParams[key] = value;
          }
        }
      });

      const response = await apiClient.get('/organizations/sites', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get sites error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get site by ID
   * GET /organizations/sites/:id
   * @param {string|number} id - Site ID
   */
  getSiteById: async (id) => {
    try {
      const siteId = parseInt(id, 10);
      if (isNaN(siteId)) {
        throw new Error('Invalid site ID');
      }
      const response = await apiClient.get(`/organizations/sites/${siteId}`);
      return response;
    } catch (error) {
      console.error('Get site error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update site
   * PUT /organizations/sites/:id
   * @param {string|number} id - Site ID
   * @param {Object} siteData - Updated site data
   */
  updateSite: async (id, siteData) => {
    try {
      const siteId = parseInt(id, 10);
      if (isNaN(siteId)) {
        throw new Error('Invalid site ID');
      }
      const response = await apiClient.put(`/organizations/sites/${siteId}`, siteData);
      return response;
    } catch (error) {
      console.error('Update site error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete site
   * DELETE /organizations/sites/:id
   * @param {string|number} id - Site ID
   */
  deleteSite: async (id) => {
    try {
      const siteId = parseInt(id, 10);
      if (isNaN(siteId)) {
        throw new Error('Invalid site ID');
      }
      const response = await apiClient.delete(`/organizations/sites/${siteId}`);
      return response;
    } catch (error) {
      console.error('Delete site error:', error);
      throw error.response?.data || error;
    }
  },
};
