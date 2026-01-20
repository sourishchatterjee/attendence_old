import React, { useState, useEffect } from 'react';
import { payrollAPI } from '../../services/payrollAPI';
import { employeeAPI } from '../../services/employeeAPI';

const ProcessPayrollModal = ({ payroll, onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setFetchingEmployees(true);
      const response = await employeeAPI.getAllEmployees({
        organization_id: payroll.organization_id,
        pageSize: 100,
      });
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      alert(`❌ ${err.message || 'Failed to fetch employees'}`);
    } finally {
      setFetchingEmployees(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedEmployees.length === 0) {
      alert('❌ Please select at least one employee');
      return;
    }

    if (!window.confirm(`Process payroll for ${selectedEmployees.length} employee(s)?`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await payrollAPI.processPayroll({
        payroll_id: payroll.payroll_id,
        employee_ids: selectedEmployees,
      });

      const data = response.data || response;
      alert(
        `✅ Payroll processed successfully!\n\n` +
        `Processed: ${data.totalProcessed || selectedEmployees.length} employees\n` +
        `Total Gross: ₹${(data.totalGrossAmount || 0).toLocaleString('en-IN')}\n` +
        `Total Net: ₹${(data.totalNetAmount || 0).toLocaleString('en-IN')}`
      );
      onSuccess();
    } catch (error) {
      console.error('Process error:', error);
      alert(`❌ ${error.message || 'Failed to process payroll'}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployee = (employeeId) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.employee_id));
    }
    setSelectAll(!selectAll);
  };

  const filteredEmployees = employees.filter(emp => {
    if (!searchTerm) return true;
    const name = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
    const code = (emp.employee_code || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || code.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary-700">Process Payroll</h3>
              <p className="text-sm text-gray-500">
                {new Date(payroll.payroll_year, payroll.payroll_month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Search & Select All */}
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition text-sm font-medium"
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Selected Count */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Selected Employees</span>
                <span className="text-2xl font-bold text-blue-900">{selectedEmployees.length}</span>
              </div>
            </div>

            {/* Employee List */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-700">
                  {fetchingEmployees ? 'Loading employees...' : `${filteredEmployees.length} Employees`}
                </p>
              </div>
              
              {fetchingEmployees ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="text-gray-500 text-sm mt-2">Loading employees...</p>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No employees found</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {filteredEmployees.map(emp => (
                    <label
                      key={emp.employee_id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp.employee_id)}
                        onChange={() => toggleEmployee(emp.employee_id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {emp.first_name} {emp.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {emp.employee_code} • {emp.department_name || 'N/A'} • {emp.designation_name || 'N/A'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Warning Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-xs text-yellow-800">
                  <p className="font-semibold">Processing Notice</p>
                  <p className="mt-0.5">• Payslips will be generated for selected employees</p>
                  <p>• Ensure all employee salary structures are configured</p>
                  <p>• Attendance data should be updated for accurate calculations</p>
                  <p>• This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedEmployees.length === 0}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 text-sm"
              >
                {loading ? 'Processing...' : `Process ${selectedEmployees.length} Employee(s)`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProcessPayrollModal;
