import apiClient from './api';

export const leaveAPI = {
  // ============ LEAVE TYPES ============
  
  /**
   * Create new leave type
   * POST /leaves/types
   * @param {Object} leaveTypeData - Leave type data
   */
  createLeaveType: async (leaveTypeData) => {
    try {
      const response = await apiClient.post('/leaves/types', leaveTypeData);
      return response;
    } catch (error) {
      console.error('Create leave type error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all leave types with pagination and filters
   * GET /leaves/types
   * @param {Object} params - Query parameters
   */
  getAllLeaveTypes: async (params = {}) => {
    try {
      const cleanParams = {};
      
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          if (key.includes('_id') || key === 'page' || key === 'pageSize') {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue)) {
              cleanParams[key] = numValue;
            }
          } else if (key === 'is_paid' || key === 'is_active') {
            cleanParams[key] = value === true || value === 'true';
          } else {
            cleanParams[key] = value;
          }
        }
      });

      const response = await apiClient.get('/leaves/types', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get leave types error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get leave type by ID
   * GET /leaves/types/:id
   * @param {string|number} id - Leave type ID
   */
  getLeaveTypeById: async (id) => {
    try {
      const leaveTypeId = parseInt(id, 10);
      if (isNaN(leaveTypeId)) {
        throw new Error('Invalid leave type ID');
      }
      const response = await apiClient.get(`/leaves/types/${leaveTypeId}`);
      return response;
    } catch (error) {
      console.error('Get leave type error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update leave type
   * PUT /leaves/types/:id
   * @param {string|number} id - Leave type ID
   * @param {Object} leaveTypeData - Updated leave type data
   */
  updateLeaveType: async (id, leaveTypeData) => {
    try {
      const leaveTypeId = parseInt(id, 10);
      if (isNaN(leaveTypeId)) {
        throw new Error('Invalid leave type ID');
      }
      const response = await apiClient.put(`/leaves/types/${leaveTypeId}`, leaveTypeData);
      return response;
    } catch (error) {
      console.error('Update leave type error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete leave type
   * DELETE /leaves/types/:id
   * @param {string|number} id - Leave type ID
   */
  deleteLeaveType: async (id) => {
    try {
      const leaveTypeId = parseInt(id, 10);
      if (isNaN(leaveTypeId)) {
        throw new Error('Invalid leave type ID');
      }
      const response = await apiClient.delete(`/leaves/types/${leaveTypeId}`);
      return response;
    } catch (error) {
      console.error('Delete leave type error:', error);
      throw error.response?.data || error;
    }
  },

  // ============ LEAVE APPLICATIONS ============

  /**
   * Apply for leave
   * POST /leaves/apply
   * @param {Object} leaveData - Leave application data
   */
  applyLeave: async (leaveData) => {
    try {
      const response = await apiClient.post('/leaves/apply', leaveData);
      return response;
    } catch (error) {
      console.error('Apply leave error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all leave applications with pagination and filters
   * GET /leaves/applications
   * @param {Object} params - Query parameters
   */
  getAllLeaveApplications: async (params = {}) => {
    try {
      const cleanParams = {};
      
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          if (key.includes('_id') || key === 'page' || key === 'pageSize') {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue)) {
              cleanParams[key] = numValue;
            }
          } else {
            cleanParams[key] = value;
          }
        }
      });

      const response = await apiClient.get('/leaves/applications', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get leave applications error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get leave application by ID
   * GET /leaves/applications/:id
   * @param {string|number} id - Leave application ID
   */
  getLeaveApplicationById: async (id) => {
    try {
      const applicationId = parseInt(id, 10);
      if (isNaN(applicationId)) {
        throw new Error('Invalid leave application ID');
      }
      const response = await apiClient.get(`/leaves/applications/${applicationId}`);
      return response;
    } catch (error) {
      console.error('Get leave application error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Approve or reject leave application
   * PUT /leaves/applications/:id/process
   * @param {string|number} id - Leave application ID
   * @param {Object} processData - Process data (status, remarks)
   */
  processLeaveApplication: async (id, processData) => {
    try {
      const applicationId = parseInt(id, 10);
      if (isNaN(applicationId)) {
        throw new Error('Invalid leave application ID');
      }
      const response = await apiClient.put(`/leaves/applications/${applicationId}/process`, processData);
      return response;
    } catch (error) {
      console.error('Process leave application error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Cancel leave application
   * PUT /leaves/applications/:id/cancel
   * @param {string|number} id - Leave application ID
   */
  cancelLeaveApplication: async (id) => {
    try {
      const applicationId = parseInt(id, 10);
      if (isNaN(applicationId)) {
        throw new Error('Invalid leave application ID');
      }
      const response = await apiClient.put(`/leaves/applications/${applicationId}/cancel`);
      return response;
    } catch (error) {
      console.error('Cancel leave application error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get leave balance
   * GET /leaves/balance
   * @param {Object} params - Query parameters (employee_id, year)
   */
  getLeaveBalance: async (params) => {
    try {
      const cleanParams = {};
      
      if (params.employee_id) {
        cleanParams.employee_id = parseInt(params.employee_id, 10);
      }
      if (params.year) {
        cleanParams.year = parseInt(params.year, 10);
      }

      const response = await apiClient.get('/leaves/balance', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get leave balance error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get leave calendar
   * GET /leaves/calendar
   * @param {Object} params - Query parameters (month, year, department_id, leave_type_id)
   */
  getLeaveCalendar: async (params) => {
    try {
      const cleanParams = {
        month: parseInt(params.month, 10),
        year: parseInt(params.year, 10),
      };
      
      if (params.department_id && params.department_id !== 'all') {
        cleanParams.department_id = parseInt(params.department_id, 10);
      }
      if (params.leave_type_id && params.leave_type_id !== 'all') {
        cleanParams.leave_type_id = parseInt(params.leave_type_id, 10);
      }

      const response = await apiClient.get('/leaves/calendar', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get leave calendar error:', error);
      throw error.response?.data || error;
    }
  },
};
