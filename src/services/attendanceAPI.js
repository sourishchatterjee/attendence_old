import apiClient from './api';

export const attendanceAPI = {
  /**
   * Check in
   * POST /attendance/checkin
   * @param {Object} checkinData - Check-in data
   */
  checkIn: async (checkinData) => {
    try {
      const response = await apiClient.post('/attendance/checkin', checkinData);
      return response;
    } catch (error) {
      console.error('Check-in error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Check out
   * POST /attendance/checkout
   * @param {Object} checkoutData - Check-out data
   */
  checkOut: async (checkoutData) => {
    try {
      const response = await apiClient.post('/attendance/checkout', checkoutData);
      return response;
    } catch (error) {
      console.error('Check-out error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all attendance records with pagination and filters
   * GET /attendance
   * @param {Object} params - Query parameters
   */
  getAllAttendance: async (params = {}) => {
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

      const response = await apiClient.get('/attendance', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get attendance error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get attendance by ID
   * GET /attendance/:id
   * @param {string|number} id - Attendance ID
   */
  getAttendanceById: async (id) => {
    try {
      const attendanceId = parseInt(id, 10);
      if (isNaN(attendanceId)) {
        throw new Error('Invalid attendance ID');
      }
      const response = await apiClient.get(`/attendance/${attendanceId}`);
      return response;
    } catch (error) {
      console.error('Get attendance error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update attendance
   * PUT /attendance/:id
   * @param {string|number} id - Attendance ID
   * @param {Object} attendanceData - Updated attendance data
   */
  updateAttendance: async (id, attendanceData) => {
    try {
      const attendanceId = parseInt(id, 10);
      if (isNaN(attendanceId)) {
        throw new Error('Invalid attendance ID');
      }
      const response = await apiClient.put(`/attendance/${attendanceId}`, attendanceData);
      return response;
    } catch (error) {
      console.error('Update attendance error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Mark manual attendance
   * POST /attendance/manual
   * @param {Object} attendanceData - Manual attendance data
   */
  markManualAttendance: async (attendanceData) => {
    try {
      const response = await apiClient.post('/attendance/manual', attendanceData);
      return response;
    } catch (error) {
      console.error('Mark manual attendance error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete attendance
   * DELETE /attendance/:id
   * @param {string|number} id - Attendance ID
   */
  deleteAttendance: async (id) => {
    try {
      const attendanceId = parseInt(id, 10);
      if (isNaN(attendanceId)) {
        throw new Error('Invalid attendance ID');
      }
      const response = await apiClient.delete(`/attendance/${attendanceId}`);
      return response;
    } catch (error) {
      console.error('Delete attendance error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get today's attendance
   * GET /attendance/today
   * @param {Object} params - Query parameters
   */
  getTodayAttendance: async (params = {}) => {
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
          } else {
            cleanParams[key] = value;
          }
        }
      });

      const response = await apiClient.get('/attendance/today', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get today attendance error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Export attendance
   * GET /attendance/export
   * @param {Object} params - Query parameters
   */
  exportAttendance: async (params = {}) => {
    try {
      const cleanParams = {};
      
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'employee_id') {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue)) {
              cleanParams[key] = numValue;
            }
          } else {
            cleanParams[key] = value;
          }
        }
      });

      const response = await apiClient.get('/attendance/export', {
        params: cleanParams,
        responseType: 'blob', // Important for file download
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on format
      const format = params.format || 'excel';
      const extension = format === 'pdf' ? 'pdf' : format === 'csv' ? 'csv' : 'xlsx';
      const filename = `attendance_${params.from_date}_to_${params.to_date}.${extension}`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true, message: 'Attendance exported successfully' };
    } catch (error) {
      console.error('Export attendance error:', error);
      throw error.response?.data || error;
    }
  },
};
