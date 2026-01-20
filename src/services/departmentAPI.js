import apiClient from './api';

export const departmentAPI = {
  /**
   * Create new department
   * POST /departments
   * @param {Object} departmentData - Department data
   */
  createDepartment: async (departmentData) => {
    try {
      const response = await apiClient.post('/departments', departmentData);
      return response;
    } catch (error) {
      console.error('Create department error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all departments with pagination and filters
   * GET /departments
   * @param {Object} params - Query parameters
   */
  getAllDepartments: async (params = {}) => {
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

      const response = await apiClient.get('/departments', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get departments error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get department hierarchy
   * GET /departments/hierarchy
   * @param {number} organizationId - Organization ID
   */
  getDepartmentHierarchy: async (organizationId) => {
    try {
      const orgId = parseInt(organizationId, 10);
      if (isNaN(orgId)) {
        throw new Error('Invalid organization ID');
      }
      
      const response = await apiClient.get('/departments/hierarchy', {
        params: { organization_id: orgId }
      });
      return response;
    } catch (error) {
      console.error('Get department hierarchy error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get department by ID
   * GET /departments/:id
   * @param {string|number} id - Department ID
   */
  getDepartmentById: async (id) => {
    try {
      const deptId = parseInt(id, 10);
      if (isNaN(deptId)) {
        throw new Error('Invalid department ID');
      }
      const response = await apiClient.get(`/departments/department_by_id/${deptId}`);
      return response;
    } catch (error) {
      console.error('Get department error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update department
   * PUT /departments/:id
   * @param {string|number} id - Department ID
   * @param {Object} departmentData - Updated department data
   */
  updateDepartment: async (id, departmentData) => {
    try {
      const deptId = parseInt(id, 10);
      if (isNaN(deptId)) {
        throw new Error('Invalid department ID');
      }
      const response = await apiClient.put(`/departments/${deptId}`, departmentData);
      return response;
    } catch (error) {
      console.error('Update department error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete department
   * DELETE /departments/:id
   * @param {string|number} id - Department ID
   */
  deleteDepartment: async (id) => {
    try {
      const deptId = parseInt(id, 10);
      if (isNaN(deptId)) {
        throw new Error('Invalid department ID');
      }
      const response = await apiClient.delete(`/departments/${deptId}`);
      return response;
    } catch (error) {
      console.error('Delete department error:', error);
      throw error.response?.data || error;
    }
  },
};
