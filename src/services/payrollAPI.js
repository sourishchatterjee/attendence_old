import apiClient from './api';

export const payrollAPI = {
  // ============ PAYROLL ============
  
  /**
   * Create new payroll
   * POST /payroll
   * @param {Object} payrollData - Payroll data
   */
  createPayroll: async (payrollData) => {
    try {
      const response = await apiClient.post('/payroll', payrollData);
      return response;
    } catch (error) {
      console.error('Create payroll error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all payrolls with pagination and filters
   * GET /payroll
   * @param {Object} params - Query parameters
   */
  getAllPayrolls: async (params = {}) => {
    try {
      const cleanParams = {};
      
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          if (key.includes('_id') || key === 'page' || key === 'pageSize' || key === 'year' || key === 'month') {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue)) {
              cleanParams[key] = numValue;
            }
          } else {
            cleanParams[key] = value;
          }
        }
      });

      const response = await apiClient.get('/payroll', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get payrolls error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get payroll by ID
   * GET /payroll/:id
   * @param {string|number} id - Payroll ID
   */
  getPayrollById: async (id) => {
    try {
      const payrollId = parseInt(id, 10);
      if (isNaN(payrollId)) {
        throw new Error('Invalid payroll ID');
      }
      const response = await apiClient.get(`/payroll/${payrollId}`);
      return response;
    } catch (error) {
      console.error('Get payroll error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Process payroll
   * POST /payroll/process
   * @param {Object} processData - Process data with employee IDs
   */
  processPayroll: async (processData) => {
    try {
      const response = await apiClient.post('/payroll/process', processData);
      return response;
    } catch (error) {
      console.error('Process payroll error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update payroll status
   * PUT /payroll/:id/status
   * @param {string|number} id - Payroll ID
   * @param {Object} statusData - Status update data
   */
  updatePayrollStatus: async (id, statusData) => {
    try {
      const payrollId = parseInt(id, 10);
      if (isNaN(payrollId)) {
        throw new Error('Invalid payroll ID');
      }
      const response = await apiClient.put(`/payroll/${payrollId}/status`, statusData);
      return response;
    } catch (error) {
      console.error('Update payroll status error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete payroll
   * DELETE /payroll/:id
   * @param {string|number} id - Payroll ID
   */
  deletePayroll: async (id) => {
    try {
      const payrollId = parseInt(id, 10);
      if (isNaN(payrollId)) {
        throw new Error('Invalid payroll ID');
      }
      const response = await apiClient.delete(`/payroll/${payrollId}`);
      return response;
    } catch (error) {
      console.error('Delete payroll error:', error);
      throw error.response?.data || error;
    }
  },

  // ============ PAYSLIPS ============

  /**
   * Get all payslips for a payroll
   * GET /payroll/payslips/all
   * @param {Object} params - Query parameters
   */
  getAllPayslips: async (params) => {
    try {
      const cleanParams = {};
      
      if (params.payroll_id) {
        cleanParams.payroll_id = parseInt(params.payroll_id, 10);
      }
      if (params.payment_status && params.payment_status !== 'all') {
        cleanParams.payment_status = params.payment_status;
      }
      if (params.page) {
        cleanParams.page = parseInt(params.page, 10);
      }
      if (params.pageSize) {
        cleanParams.pageSize = parseInt(params.pageSize, 10);
      }

      const response = await apiClient.get('/payroll/payslips/all', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get payslips error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get payslip by ID
   * GET /payroll/payslips/:id
   * @param {string|number} id - Payslip ID
   */
  getPayslipById: async (id) => {
    try {
      const payslipId = parseInt(id, 10);
      if (isNaN(payslipId)) {
        throw new Error('Invalid payslip ID');
      }
      const response = await apiClient.get(`/payroll/payslips/${payslipId}`);
      return response;
    } catch (error) {
      console.error('Get payslip error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update payslip status
   * PUT /payroll/payslips/:id/status
   * @param {string|number} id - Payslip ID
   * @param {Object} statusData - Status update data
   */
  updatePayslipStatus: async (id, statusData) => {
    try {
      const payslipId = parseInt(id, 10);
      if (isNaN(payslipId)) {
        throw new Error('Invalid payslip ID');
      }
      const response = await apiClient.put(`/payroll/payslips/${payslipId}/status`, statusData);
      return response;
    } catch (error) {
      console.error('Update payslip status error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Download payslip PDF
   * GET /payroll/payslips/:id/download
   * @param {string|number} id - Payslip ID
   */
  downloadPayslip: async (id) => {
    try {
      const payslipId = parseInt(id, 10);
      if (isNaN(payslipId)) {
        throw new Error('Invalid payslip ID');
      }
      const response = await apiClient.get(`/payroll/payslips/${payslipId}/download`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      console.error('Download payslip error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Email payslip
   * POST /payroll/payslips/:id/email
   * @param {string|number} id - Payslip ID
   */
  emailPayslip: async (id) => {
    try {
      const payslipId = parseInt(id, 10);
      if (isNaN(payslipId)) {
        throw new Error('Invalid payslip ID');
      }
      const response = await apiClient.post(`/payroll/payslips/${payslipId}/email`);
      return response;
    } catch (error) {
      console.error('Email payslip error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get my payslips
   * GET /payroll/my-payslips
   * @param {Object} params - Query parameters
   */
  getMyPayslips: async (params = {}) => {
    try {
      const cleanParams = {};
      
      if (params.year) {
        cleanParams.year = parseInt(params.year, 10);
      }
      if (params.month) {
        cleanParams.month = parseInt(params.month, 10);
      }

      const response = await apiClient.get('/payroll/my-payslips', { 
        params: cleanParams 
      });
      return response;
    } catch (error) {
      console.error('Get my payslips error:', error);
      throw error.response?.data || error;
    }
  },
};
