import apiClient from './api';

export const authAPI = {
  /**
   * Get current user profile
   * GET /auth/profile
   * Requires: Bearer Token
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update user profile
   * PUT /auth/profile
   * Requires: Bearer Token
   */
  updateProfile: async (data) => {
    try {
      const response = await apiClient.put('/auth/profile', data);
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Change password
   * POST /auth/change-password
   * Requires: Bearer Token
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   */
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await apiClient.post('/auth/change-password', {
        oldPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Logout current user
   * POST /auth/logout
   * Requires: Bearer Token
   */
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout');
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Login user
   * POST /auth/login
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Register new user
   * POST /auth/register
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error.response?.data || error;
    }
  },
};
