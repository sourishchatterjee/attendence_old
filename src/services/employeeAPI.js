import apiClient from './api';

export const employeeAPI = {
  /**
   * Create new employee
   * POST /employees
   * @param {Object} employeeData - Employee data
   */
  createEmployee: async (employeeData) => {
    try {
      const response = await apiClient.post('/employees', employeeData);
      return response;
    } catch (error) {
      console.error('Create employee error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all employees with pagination and filters
   * GET /employees
   * @param {Object} params - Query parameters
   */
  getAllEmployees: async (params = {}) => {
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

      const response = await apiClient.get('/employees', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get employees error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get employee by ID
   * GET /employees/:id
   * @param {string|number} id - Employee ID
   */
  getEmployeeById: async (id) => {
    try {
      const employeeId = parseInt(id, 10);
      if (isNaN(employeeId)) {
        throw new Error('Invalid employee ID');
      }
      const response = await apiClient.get(`/employees/${employeeId}`);
      return response;
    } catch (error) {
      console.error('Get employee error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update employee
   * PUT /employees/:id
   * @param {string|number} id - Employee ID
   * @param {Object} employeeData - Updated employee data
   */
  updateEmployee: async (id, employeeData) => {
    try {
      const employeeId = parseInt(id, 10);
      if (isNaN(employeeId)) {
        throw new Error('Invalid employee ID');
      }
      const response = await apiClient.put(`/employees/${employeeId}`, employeeData);
      return response;
    } catch (error) {
      console.error('Update employee error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete employee
   * DELETE /employees/:id
   * @param {string|number} id - Employee ID
   */
  deleteEmployee: async (id) => {
    try {
      const employeeId = parseInt(id, 10);
      if (isNaN(employeeId)) {
        throw new Error('Invalid employee ID');
      }
      const response = await apiClient.delete(`/employees/${employeeId}`);
      return response;
    } catch (error) {
      console.error('Delete employee error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Bulk upload employees
   * POST /employees/bulk-upload
   * @param {FormData} formData - Form data with file and parameters
   */
  bulkUploadEmployees: async (formData) => {
    try {
      const response = await apiClient.post('/employees/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Bulk upload employees error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Download employee template
   * GET /employees/template
   */
  downloadTemplate: async () => {
    try {
      const response = await apiClient.get('/employees/template', {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employee_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response;
    } catch (error) {
      console.error('Download template error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Export employees
   * GET /employees/export
   * @param {Object} params - Query parameters including format
   */
  exportEmployees: async (params = {}) => {
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

      const response = await apiClient.get('/employees/export', {
        params: cleanParams,
        responseType: 'blob',
      });
      
      // Determine file extension based on format
      const format = params.format || 'excel';
      const extension = format === 'csv' ? 'csv' : format === 'pdf' ? 'pdf' : 'xlsx';
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response;
    } catch (error) {
      console.error('Export employees error:', error);
      throw error.response?.data || error;
    }
  },
};
