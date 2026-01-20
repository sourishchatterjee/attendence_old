import apiClient from './api';

export const shiftAPI = {
  /**
   * Create new shift
   * POST /shifts
   * @param {Object} shiftData - Shift data
   */
  createShift: async (shiftData) => {
    try {
      const response = await apiClient.post('/shifts', shiftData);
      return response;
    } catch (error) {
      console.error('Create shift error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all shifts with pagination and filters
   * GET /shifts
   * @param {Object} params - Query parameters
   */
  getAllShifts: async (params = {}) => {
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
          } else if (key === 'is_active') {
            cleanParams[key] = value === true || value === 'true';
          } else {
            cleanParams[key] = value;
          }
        }
      });

      const response = await apiClient.get('/shifts', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get shifts error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get shift by ID
   * GET /shifts/:id
   * @param {string|number} id - Shift ID
   */
  getShiftById: async (id) => {
    try {
      const shiftId = parseInt(id, 10);
      if (isNaN(shiftId)) {
        throw new Error('Invalid shift ID');
      }
      const response = await apiClient.get(`/shifts/${shiftId}`);
      return response;
    } catch (error) {
      console.error('Get shift error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update shift
   * PUT /shifts/:id
   * @param {string|number} id - Shift ID
   * @param {Object} shiftData - Updated shift data
   */
  updateShift: async (id, shiftData) => {
    try {
      const shiftId = parseInt(id, 10);
      if (isNaN(shiftId)) {
        throw new Error('Invalid shift ID');
      }
      const response = await apiClient.put(`/shifts/${shiftId}`, shiftData);
      return response;
    } catch (error) {
      console.error('Update shift error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete shift
   * DELETE /shifts/:id
   * @param {string|number} id - Shift ID
   */
  deleteShift: async (id) => {
    try {
      const shiftId = parseInt(id, 10);
      if (isNaN(shiftId)) {
        throw new Error('Invalid shift ID');
      }
      const response = await apiClient.delete(`/shifts/${shiftId}`);
      return response;
    } catch (error) {
      console.error('Delete shift error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Assign shift to employee
   * POST /shifts/assign
   * @param {Object} assignmentData - Assignment data
   */
  assignShift: async (assignmentData) => {
    try {
      const response = await apiClient.post('/shifts/assign', assignmentData);
      return response;
    } catch (error) {
      console.error('Assign shift error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get employee shift assignments
   * GET /shifts/employee/:employee_id
   * @param {string|number} employeeId - Employee ID
   */
  getEmployeeShiftAssignments: async (employeeId) => {
    try {
      const empId = parseInt(employeeId, 10);
      if (isNaN(empId)) {
        throw new Error('Invalid employee ID');
      }
      const response = await apiClient.get(`/shifts/employee/${empId}`);
      return response;
    } catch (error) {
      console.error('Get employee shift assignments error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get shift assignments
   * GET /shifts/:id/assignments
   * @param {string|number} shiftId - Shift ID
   */
  getShiftAssignments: async (shiftId) => {
    try {
      const id = parseInt(shiftId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid shift ID');
      }
      const response = await apiClient.get(`/shifts/${id}/assignments`);
      return response;
    } catch (error) {
      console.error('Get shift assignments error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Remove shift assignment
   * DELETE /shifts/assignments/:id
   * @param {string|number} assignmentId - Assignment ID
   */
  removeShiftAssignment: async (assignmentId) => {
    try {
      const id = parseInt(assignmentId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid assignment ID');
      }
      const response = await apiClient.delete(`/shifts/assignments/${id}`);
      return response;
    } catch (error) {
      console.error('Remove shift assignment error:', error);
      throw error.response?.data || error;
    }
  },
};
