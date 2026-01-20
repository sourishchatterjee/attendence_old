import React, { useState, useEffect } from 'react';
import { shiftAPI } from '../../services/shiftAPI';
import { employeeAPI } from '../../services/employeeAPI';

const ShiftAssignmentModal = ({ shift, onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEmployees();
    // Set default effective from date to today
    const today = new Date().toISOString().split('T')[0];
    setEffectiveFrom(today);
  }, []);

  useEffect(() => {
    // Filter employees based on search term
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const search = searchTerm.toLowerCase();
      const filtered = employees.filter(emp => 
        emp.first_name.toLowerCase().includes(search) ||
        emp.last_name.toLowerCase().includes(search) ||
        emp.employee_code.toLowerCase().includes(search) ||
        emp.email.toLowerCase().includes(search) ||
        emp.department_name?.toLowerCase().includes(search)
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await employeeAPI.getAllEmployees({
        organization_id: shift.organization_id,
        is_active: true,
        pageSize: 100, // Get all active employees
      });
      const employeesData = response.data || [];
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setFilteredEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      alert('Failed to load employees');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedEmployee) {
      newErrors.selectedEmployee = 'Please select an employee';
    }
    if (!effectiveFrom) {
      newErrors.effectiveFrom = 'Effective from date is required';
    }
    if (effectiveTo && new Date(effectiveTo) < new Date(effectiveFrom)) {
      newErrors.effectiveTo = 'Effective to date must be after effective from date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const assignmentData = {
        employee_id: parseInt(selectedEmployee, 10),
        shift_id: shift.shift_id,
        effective_from: effectiveFrom,
        effective_to: effectiveTo || null,
      };

      await shiftAPI.assignShift(assignmentData);
      alert('✅ Shift assigned successfully');
      onSuccess();
    } catch (error) {
      console.error('Assignment error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Assignment Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to assign shift'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeInitials = (employee) => {
    return `${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}`.toUpperCase();
  };

  const selectedEmployeeData = employees.find(emp => emp.employee_id === parseInt(selectedEmployee, 10));

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary-700">Assign Shift to Employee</h3>
              <p className="text-sm text-gray-500">Shift: {shift.shift_name}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shift Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">{shift.shift_name}</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Timing: {shift.start_time?.substring(0, 5)} - {shift.end_time?.substring(0, 5)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {shift.is_flexible && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      Flexible
                    </span>
                  )}
                  {shift.is_night_shift && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                      Night
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Employee <span className="text-red-500">*</span>
              </label>

              {/* Search Box */}
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search employees by name, code, email, or department..."
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

              {/* Employee List */}
              <div className={`border ${errors.selectedEmployee ? 'border-red-500' : 'border-gray-300'} rounded-lg overflow-hidden`}>
                {loadingEmployees ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="text-gray-500 text-sm mt-2">Loading employees...</p>
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 text-sm">
                      {searchTerm ? 'No employees found matching your search' : 'No active employees available'}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {filteredEmployees.map((employee) => (
                      <label
                        key={employee.employee_id}
                        className={`flex items-center gap-3 p-3 cursor-pointer transition hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          selectedEmployee === String(employee.employee_id) ? 'bg-primary-50' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="employee"
                          value={employee.employee_id}
                          checked={selectedEmployee === String(employee.employee_id)}
                          onChange={(e) => {
                            setSelectedEmployee(e.target.value);
                            if (errors.selectedEmployee) {
                              setErrors({ ...errors, selectedEmployee: '' });
                            }
                          }}
                          className="rounded-full border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 font-semibold text-primary-600 text-sm">
                          {getEmployeeInitials(employee)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {employee.first_name} {employee.middle_name && `${employee.middle_name} `}{employee.last_name}
                            </p>
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-mono">
                              {employee.employee_code}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <p className="text-xs text-gray-500">{employee.email}</p>
                            {employee.department_name && (
                              <>
                                <span className="text-gray-300">•</span>
                                <p className="text-xs text-gray-500">{employee.department_name}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {errors.selectedEmployee && (
                <p className="text-red-500 text-xs mt-1">{errors.selectedEmployee}</p>
              )}
            </div>

            {/* Selected Employee Preview */}
            {selectedEmployeeData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600">
                    {getEmployeeInitials(selectedEmployeeData)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900">
                      {selectedEmployeeData.first_name} {selectedEmployeeData.middle_name && `${selectedEmployeeData.middle_name} `}{selectedEmployeeData.last_name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-green-700 mt-1">
                      <span>{selectedEmployeeData.employee_code}</span>
                      <span>•</span>
                      <span>{selectedEmployeeData.designation_name || 'N/A'}</span>
                      <span>•</span>
                      <span>{selectedEmployeeData.department_name || 'N/A'}</span>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Effective From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => {
                    setEffectiveFrom(e.target.value);
                    if (errors.effectiveFrom) {
                      setErrors({ ...errors, effectiveFrom: '' });
                    }
                  }}
                  className={`w-full px-3 py-2 border ${
                    errors.effectiveFrom ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                />
                {errors.effectiveFrom && (
                  <p className="text-red-500 text-xs mt-1">{errors.effectiveFrom}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Date when the shift assignment starts
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Effective To
                </label>
                <input
                  type="date"
                  value={effectiveTo}
                  onChange={(e) => {
                    setEffectiveTo(e.target.value);
                    if (errors.effectiveTo) {
                      setErrors({ ...errors, effectiveTo: '' });
                    }
                  }}
                  min={effectiveFrom}
                  className={`w-full px-3 py-2 border ${
                    errors.effectiveTo ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                />
                {errors.effectiveTo && (
                  <p className="text-red-500 text-xs mt-1">{errors.effectiveTo}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for ongoing assignment
                </p>
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-900">Assignment Note</h4>
                  <p className="text-xs text-yellow-700 mt-1">
                    Assigning a new shift will apply from the effective date. If the employee already has a shift assignment, make sure to set appropriate dates to avoid conflicts.
                  </p>
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
                disabled={loading || !selectedEmployee}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Assign Shift
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShiftAssignmentModal;
