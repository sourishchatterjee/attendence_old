import apiClient from './api';

export const userAPI = {
  /**
   * Get all users with optional filters
   * @param {Object} params - Query parameters (page, limit, search, role, status)
   */
  getAllUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users', { params });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get user by ID
   * @param {string|number} id - User ID
   */
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update user role
   * @param {string|number} id - User ID
   * @param {number} roleId - New role ID
   */
  updateUserRole: async (id, roleId) => {
    try {
      const response = await apiClient.put(`/users/${id}/role`, { role_id: roleId });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Activate or deactivate user
   * @param {string|number} id - User ID
   * @param {boolean} isActive - Active status
   */
  updateUserStatus: async (id, isActive) => {
    try {
      const response = await apiClient.patch(`/users/${id}/status`, { is_active: isActive });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete user (soft or hard delete)
   * @param {string|number} id - User ID
   */
  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create new user (Admin only)
   * @param {Object} userData - User data
   */
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/users', userData);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update user details (Admin only)
   * @param {string|number} id - User ID
   * @param {Object} userData - Updated user data
   */
  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
