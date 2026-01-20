import apiClient from './api';

export const designationAPI = {
  /**
   * Create new designation
   * POST /departments/designations
   * @param {Object} designationData - Designation data
   */
  createDesignation: async (designationData) => {
    try {
      const response = await apiClient.post('/departments/designations', designationData);
      return response;
    } catch (error) {
      console.error('Create designation error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all designations with pagination and filters
   * GET /departments/designations
   * @param {Object} params - Query parameters
   */
  getAllDesignations: async (params = {}) => {
    try {
      // Clean params - remove undefined, null, and 'all' values
      const cleanParams = {};
      
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          // Convert string numbers to integers for IDs
          if (key.includes('_id') || key === 'page' || key === 'pageSize' || key === 'level') {
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

      const response = await apiClient.get('/departments/designations', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get designations error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get designation by ID
   * GET /departments/designations/:id
   * @param {string|number} id - Designation ID
   */
  getDesignationById: async (id) => {
    try {
      const designationId = parseInt(id, 10);
      if (isNaN(designationId)) {
        throw new Error('Invalid designation ID');
      }
      const response = await apiClient.get(`/departments/designations/${designationId}`);
      return response;
    } catch (error) {
      console.error('Get designation error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update designation
   * PUT /departments/designations/:id
   * @param {string|number} id - Designation ID
   * @param {Object} designationData - Updated designation data
   */
  updateDesignation: async (id, designationData) => {
    try {
      const designationId = parseInt(id, 10);
      if (isNaN(designationId)) {
        throw new Error('Invalid designation ID');
      }
      const response = await apiClient.put(`/departments/designations/${designationId}`, designationData);
      return response;
    } catch (error) {
      console.error('Update designation error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete designation
   * DELETE /departments/designations/:id
   * @param {string|number} id - Designation ID
   */
  deleteDesignation: async (id) => {
    try {
      const designationId = parseInt(id, 10);
      if (isNaN(designationId)) {
        throw new Error('Invalid designation ID');
      }
      const response = await apiClient.delete(`/departments/designations/${designationId}`);
      return response;
    } catch (error) {
      console.error('Delete designation error:', error);
      throw error.response?.data || error;
    }
  },
};
