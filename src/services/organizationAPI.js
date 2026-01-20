import apiClient from './api';

export const organizationAPI = {
  /**
   * Create new organization
   * POST /organizations
   * @param {Object} orgData - Organization data
   */
  createOrganization: async (orgData) => {
    try {
      const response = await apiClient.post('/organizations', orgData);
      return response;
    } catch (error) {
      console.error('Create organization error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all organizations with pagination and filters
   * GET /organizations
   * @param {Object} params - Query parameters (is_active, page, pageSize)
   */
  getAllOrganizations: async (params = {}) => {
    try {
      const response = await apiClient.get('/organizations', { params });
      return response;
    } catch (error) {
      console.error('Get organizations error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get organization by ID
   * GET /organizations/:id
   * @param {string|number} id - Organization ID
   */
  getOrganizationById: async (id) => {
    try {
      const response = await apiClient.get(`/organizations/organization_by_id/${id}`);
      return response;
    } catch (error) {
      console.error('Get organization error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update organization
   * PUT /organizations/:id
   * @param {string|number} id - Organization ID
   * @param {Object} orgData - Updated organization data
   */
  updateOrganization: async (id, orgData) => {
    try {
      const response = await apiClient.put(`/organizations/${id}`, orgData);
      return response;
    } catch (error) {
      console.error('Update organization error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete organization
   * DELETE /organizations/:id
   * @param {string|number} id - Organization ID
   */
  deleteOrganization: async (id) => {
    try {
      const response = await apiClient.delete(`/organizations/${id}`);
      return response;
    } catch (error) {
      console.error('Delete organization error:', error);
      throw error.response?.data || error;
    }
  },
};
