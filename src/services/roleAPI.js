import apiClient from './api';

export const roleAPI = {
  /**
   * Create new role
   * POST /roles
   * @param {Object} roleData - Role data
   */
  createRole: async (roleData) => {
    try {
      const response = await apiClient.post('/roles', roleData);
      return response;
    } catch (error) {
      console.error('Create role error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all roles with pagination and filters
   * GET /roles
   * @param {Object} params - Query parameters
   */
  getAllRoles: async (params = {}) => {
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

      const response = await apiClient.get('/roles', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get roles error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get role by ID
   * GET /roles/:id
   * @param {string|number} id - Role ID
   */
  getRoleById: async (id) => {
    try {
      const roleId = parseInt(id, 10);
      if (isNaN(roleId)) {
        throw new Error('Invalid role ID');
      }
      const response = await apiClient.get(`/roles/${roleId}`);
      return response;
    } catch (error) {
      console.error('Get role error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update role
   * PUT /roles/:id
   * @param {string|number} id - Role ID
   * @param {Object} roleData - Updated role data
   */
  updateRole: async (id, roleData) => {
    try {
      const roleId = parseInt(id, 10);
      if (isNaN(roleId)) {
        throw new Error('Invalid role ID');
      }
      const response = await apiClient.put(`/roles/${roleId}`, roleData);
      return response;
    } catch (error) {
      console.error('Update role error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete role
   * DELETE /roles/:id
   * @param {string|number} id - Role ID
   */
  deleteRole: async (id) => {
    try {
      const roleId = parseInt(id, 10);
      if (isNaN(roleId)) {
        throw new Error('Invalid role ID');
      }
      const response = await apiClient.delete(`/roles/${roleId}`);
      return response;
    } catch (error) {
      console.error('Delete role error:', error);
      throw error.response?.data || error;
    }
  },
};
