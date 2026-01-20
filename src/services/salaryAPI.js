import apiClient from './api';

export const salaryAPI = {
  // ============ SALARY COMPONENTS ============
  
  /**
   * Create new salary component
   * POST /salary/components
   * @param {Object} componentData - Component data
   */
  createComponent: async (componentData) => {
    try {
      const response = await apiClient.post('/salary/components', componentData);
      return response;
    } catch (error) {
      console.error('Create component error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all salary components with filters
   * GET /salary/components
   * @param {Object} params - Query parameters
   */
  getAllComponents: async (params = {}) => {
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
            cleanParams[key] = value === true || value === 'true';
          } else {
            cleanParams[key] = value;
          }
        }
      });

      const response = await apiClient.get('/salary/components', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get components error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get component by ID
   * GET /salary/components/:id
   * @param {string|number} id - Component ID
   */
  getComponentById: async (id) => {
    try {
      const componentId = parseInt(id, 10);
      if (isNaN(componentId)) {
        throw new Error('Invalid component ID');
      }
      const response = await apiClient.get(`/salary/components/${componentId}`);
      return response;
    } catch (error) {
      console.error('Get component error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update salary component
   * PUT /salary/components/:id
   * @param {string|number} id - Component ID
   * @param {Object} componentData - Updated data
   */
  updateComponent: async (id, componentData) => {
    try {
      const componentId = parseInt(id, 10);
      if (isNaN(componentId)) {
        throw new Error('Invalid component ID');
      }
      const response = await apiClient.put(`/salary/components/${componentId}`, componentData);
      return response;
    } catch (error) {
      console.error('Update component error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete salary component
   * DELETE /salary/components/:id
   * @param {string|number} id - Component ID
   */
  deleteComponent: async (id) => {
    try {
      const componentId = parseInt(id, 10);
      if (isNaN(componentId)) {
        throw new Error('Invalid component ID');
      }
      const response = await apiClient.delete(`/salary/components/${componentId}`);
      return response;
    } catch (error) {
      console.error('Delete component error:', error);
      throw error.response?.data || error;
    }
  },

  // ============ SALARY STRUCTURE ============

  /**
   * Create salary structure
   * POST /salary/structure
   * @param {Object} structureData - Structure data with components
   */
  createStructure: async (structureData) => {
    try {
      const response = await apiClient.post('/salary/structure', structureData);
      return response;
    } catch (error) {
      console.error('Create structure error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get employee salary structure
   * GET /salary/structure
   * @param {Object} params - Query parameters
   */
  getEmployeeStructure: async (params) => {
    try {
      const cleanParams = {};
      
      if (params.employee_id) {
        cleanParams.employee_id = parseInt(params.employee_id, 10);
      }
      if (params.is_current !== undefined) {
        cleanParams.is_current = params.is_current === true || params.is_current === 'true';
      }

      const response = await apiClient.get('/salary/structure', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get structure error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get structure by ID
   * GET /salary/structure/:id
   * @param {string|number} id - Structure ID
   */
  getStructureById: async (id) => {
    try {
      const structureId = parseInt(id, 10);
      if (isNaN(structureId)) {
        throw new Error('Invalid structure ID');
      }
      const response = await apiClient.get(`/salary/structure/${structureId}`);
      return response;
    } catch (error) {
      console.error('Get structure error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update salary structure
   * PUT /salary/structure/:id
   * @param {string|number} id - Structure ID
   * @param {Object} structureData - Updated data
   */
  updateStructure: async (id, structureData) => {
    try {
      const structureId = parseInt(id, 10);
      if (isNaN(structureId)) {
        throw new Error('Invalid structure ID');
      }
      const response = await apiClient.put(`/salary/structure/${structureId}`, structureData);
      return response;
    } catch (error) {
      console.error('Update structure error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete salary structure
   * DELETE /salary/structure/:id
   * @param {string|number} id - Structure ID
   */
  deleteStructure: async (id) => {
    try {
      const structureId = parseInt(id, 10);
      if (isNaN(structureId)) {
        throw new Error('Invalid structure ID');
      }
      const response = await apiClient.delete(`/salary/structure/${structureId}`);
      return response;
    } catch (error) {
      console.error('Delete structure error:', error);
      throw error.response?.data || error;
    }
  },
};
