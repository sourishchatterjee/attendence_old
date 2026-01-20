// services/permissionAPI.js
import apiClient from './api';

export const permissionAPI = {
  // ============ ROLES ============
  
  createRole: async (roleData) => {
    try {
      const response = await apiClient.post('/roles', roleData);
      return response.data;
    } catch (error) {
      console.error('Create role error:', error);
      throw error.response?.data || error;
    }
  },

  getAllRoles: async (params = {}) => {
    try {
      const response = await apiClient.get('/roles', { params });
      return response.data;
    } catch (error) {
      console.error('Get roles error:', error);
      throw error.response?.data || error;
    }
  },

  getRoleById: async (roleId) => {
    try {
      const response = await apiClient.get(`/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Get role error:', error);
      throw error.response?.data || error;
    }
  },

  updateRole: async (roleId, roleData) => {
    try {
      const response = await apiClient.put(`/roles/${roleId}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Update role error:', error);
      throw error.response?.data || error;
    }
  },

  deleteRole: async (roleId) => {
    try {
      const response = await apiClient.delete(`/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Delete role error:', error);
      throw error.response?.data || error;
    }
  },

  getAllPermissions: async () => {
    try {
      const response = await apiClient.get('/roles/permissions/all');
      return response.data;
    } catch (error) {
      console.error('Get permissions error:', error);
      throw error.response?.data || error;
    }
  },

  getPermissionModules: async () => {
    try {
      const response = await apiClient.get('/roles/permissions/modules');
      return response.data;
    } catch (error) {
      console.error('Get permission modules error:', error);
      throw error.response?.data || error;
    }
  },

  assignPermissions: async (assignData) => {
    try {
      const response = await apiClient.post('/roles/assign-permissions', assignData);
      return response.data;
    } catch (error) {
      console.error('Assign permissions error:', error);
      throw error.response?.data || error;
    }
  },

  getAllGroups: async () => {
    try {
      const response = await apiClient.get('/roles/groups');
      return response.data;
    } catch (error) {
      console.error('Get groups error:', error);
      throw error.response?.data || error;
    }
  },

  createGroup: async (groupData) => {
    try {
      const response = await apiClient.post('/roles/groups', groupData);
      return response.data;
    } catch (error) {
      console.error('Create group error:', error);
      throw error.response?.data || error;
    }
  },
};

export default permissionAPI;
