import apiClient from './api';

export const permissionAPI = {
  // ============ ROLES ============
  
  /**
   * Create role
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
   * Get all roles
   * GET /roles
   * @param {Object} params - Query parameters
   */
  getAllRoles: async (params = {}) => {
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

      const response = await apiClient.get('/roles', { params: cleanParams });
      return response;
    } catch (error) {
      console.error('Get roles error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get role by ID
   * GET /roles/:id
   * @param {string|number} roleId - Role ID
   */
  getRoleById: async (roleId) => {
    try {
      const id = parseInt(roleId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid role ID');
      }
      const response = await apiClient.get(`/roles/${id}`);
      return response;
    } catch (error) {
      console.error('Get role by ID error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update role
   * PUT /roles/:id
   * @param {string|number} roleId - Role ID
   * @param {Object} updateData - Update data
   */
  updateRole: async (roleId, updateData) => {
    try {
      const id = parseInt(roleId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid role ID');
      }
      const response = await apiClient.put(`/roles/${id}`, updateData);
      return response;
    } catch (error) {
      console.error('Update role error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete role
   * DELETE /roles/:id
   * @param {string|number} roleId - Role ID
   */
  deleteRole: async (roleId) => {
    try {
      const id = parseInt(roleId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid role ID');
      }
      const response = await apiClient.delete(`/roles/${id}`);
      return response;
    } catch (error) {
      console.error('Delete role error:', error);
      throw error.response?.data || error;
    }
  },

  // ============ PERMISSIONS ============
  
  /**
   * Get all permissions
   * GET /permissions
   */
  getAllPermissions: async () => {
    try {
      const response = await apiClient.get('/permissions');
      return response;
    } catch (error) {
      console.error('Get permissions error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get role permissions
   * GET /roles/:id/permissions
   * @param {string|number} roleId - Role ID
   */
  getRolePermissions: async (roleId) => {
    try {
      const id = parseInt(roleId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid role ID');
      }
      const response = await apiClient.get(`/roles/${id}/permissions`);
      return response;
    } catch (error) {
      console.error('Get role permissions error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Assign permission to role
   * POST /roles/:id/permissions
   * @param {string|number} roleId - Role ID
   * @param {Array<number>} permissionIds - Array of permission IDs
   */
  assignPermissionsToRole: async (roleId, permissionIds) => {
    try {
      const id = parseInt(roleId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid role ID');
      }
      const response = await apiClient.post(`/roles/${id}/permissions`, {
        permission_ids: permissionIds,
      });
      return response;
    } catch (error) {
      console.error('Assign permissions error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Remove permission from role
   * DELETE /roles/:roleId/permissions/:permissionId
   * @param {string|number} roleId - Role ID
   * @param {string|number} permissionId - Permission ID
   */
  removePermissionFromRole: async (roleId, permissionId) => {
    try {
      const rId = parseInt(roleId, 10);
      const pId = parseInt(permissionId, 10);
      if (isNaN(rId) || isNaN(pId)) {
        throw new Error('Invalid role or permission ID');
      }
      const response = await apiClient.delete(`/roles/${rId}/permissions/${pId}`);
      return response;
    } catch (error) {
      console.error('Remove permission error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update role permissions (bulk update)
   * PUT /roles/:id/permissions
   * @param {string|number} roleId - Role ID
   * @param {Array<number>} permissionIds - Array of permission IDs
   */
  updateRolePermissions: async (roleId, permissionIds) => {
    try {
      const id = parseInt(roleId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid role ID');
      }
      const response = await apiClient.put(`/roles/${id}/permissions`, {
        permission_ids: permissionIds,
      });
      return response;
    } catch (error) {
      console.error('Update role permissions error:', error);
      throw error.response?.data || error;
    }
  },

  // ============ USER ROLES ============
  
  /**
   * Assign role to user
   * POST /users/:userId/roles
   * @param {string|number} userId - User ID
   * @param {string|number} roleId - Role ID
   */
  assignRoleToUser: async (userId, roleId) => {
    try {
      const uId = parseInt(userId, 10);
      const rId = parseInt(roleId, 10);
      if (isNaN(uId) || isNaN(rId)) {
        throw new Error('Invalid user or role ID');
      }
      const response = await apiClient.post(`/users/${uId}/roles`, {
        role_id: rId,
      });
      return response;
    } catch (error) {
      console.error('Assign role to user error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Remove role from user
   * DELETE /users/:userId/roles/:roleId
   * @param {string|number} userId - User ID
   * @param {string|number} roleId - Role ID
   */
  removeRoleFromUser: async (userId, roleId) => {
    try {
      const uId = parseInt(userId, 10);
      const rId = parseInt(roleId, 10);
      if (isNaN(uId) || isNaN(rId)) {
        throw new Error('Invalid user or role ID');
      }
      const response = await apiClient.delete(`/users/${uId}/roles/${rId}`);
      return response;
    } catch (error) {
      console.error('Remove role from user error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get user roles
   * GET /users/:userId/roles
   * @param {string|number} userId - User ID
   */
  getUserRoles: async (userId) => {
    try {
      const id = parseInt(userId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid user ID');
      }
      const response = await apiClient.get(`/users/${id}/roles`);
      return response;
    } catch (error) {
      console.error('Get user roles error:', error);
      throw error.response?.data || error;
    }
  },
};
