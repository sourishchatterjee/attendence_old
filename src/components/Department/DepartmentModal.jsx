import React, { useState, useEffect } from 'react';
import { departmentAPI } from '../../services/departmentAPI';
import { siteAPI } from '../../services/siteAPI';

const DepartmentModal = ({ department, organizations, sites, departments, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    organization_id: '',
    site_id: '',
    department_name: '',
    department_code: '',
    parent_department_id: null,
    head_employee_id: null,
    description: '',
  });
  const [availableSites, setAvailableSites] = useState([]);
  const [availableParentDepartments, setAvailableParentDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (department) {
      setFormData({
        organization_id: department.organization_id || '',
        site_id: department.site_id || '',
        department_name: department.department_name || '',
        department_code: department.department_code || '',
        parent_department_id: department.parent_department_id || null,
        head_employee_id: department.head_employee_id || null,
        description: department.description || '',
      });
      
      if (department.organization_id) {
        fetchSitesByOrganization(department.organization_id);
        filterParentDepartments(department.organization_id, department.department_id);
      }
    }
  }, [department]);

  useEffect(() => {
    if (formData.organization_id) {
      fetchSitesByOrganization(formData.organization_id);
      filterParentDepartments(formData.organization_id, department?.department_id);
    } else {
      setAvailableSites([]);
      setAvailableParentDepartments([]);
    }
  }, [formData.organization_id]);

  const fetchSitesByOrganization = async (orgId) => {
    try {
      const response = await siteAPI.getAllSites({ 
        organization_id: parseInt(orgId, 10),
        pageSize: 100 
      });
      setAvailableSites(response.data || []);
    } catch (err) {
      console.error('Error fetching sites:', err);
      setAvailableSites([]);
    }
  };

  const filterParentDepartments = (orgId, currentDeptId) => {
    // Filter departments by organization and exclude current department
    const filtered = departments.filter(dept => 
      dept.organization_id === parseInt(orgId, 10) && 
      dept.department_id !== currentDeptId
    );
    setAvailableParentDepartments(filtered);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }

    if (!formData.site_id) {
      newErrors.site_id = 'Site is required';
    }

    if (!formData.department_name.trim()) {
      newErrors.department_name = 'Department name is required';
    }

    if (!formData.department_code.trim()) {
      newErrors.department_code = 'Department code is required';
    } else if (formData.department_code.length > 10) {
      newErrors.department_code = 'Department code must be 10 characters or less';
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
      // Prepare data with proper type conversions
      const submitData = {
        organization_id: parseInt(formData.organization_id, 10),
        site_id: parseInt(formData.site_id, 10),
        department_name: formData.department_name.trim(),
        department_code: formData.department_code.trim().toUpperCase(),
        parent_department_id: formData.parent_department_id ? parseInt(formData.parent_department_id, 10) : null,
        head_employee_id: formData.head_employee_id ? parseInt(formData.head_employee_id, 10) : null,
        description: formData.description.trim() || null,
      };

      if (department) {
        await departmentAPI.updateDepartment(department.department_id, submitData);
        alert('Department updated successfully');
      } else {
        await departmentAPI.createDepartment(submitData);
        alert('Department created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`Validation Error:\n${errorMessages}`);
      } else {
        alert(error.message || 'Failed to save department');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle special cases
    if (name === 'parent_department_id' || name === 'head_employee_id') {
      setFormData({ 
        ...formData, 
        [name]: value === '' || value === 'null' ? null : value 
      });
    } else if (name === 'organization_id') {
      // Reset site and parent department when organization changes
      setFormData({ 
        ...formData, 
        [name]: value,
        site_id: '',
        parent_department_id: null
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
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

          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-secondary-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">
              {department ? 'Edit Department' : 'Add New Department'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Organization and Site */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Organization <span className="text-red-500">*</span>
                </label>
                <select
                  name="organization_id"
                  value={formData.organization_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.organization_id ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                >
                  <option value="">Select Organization</option>
                  {organizations.map(org => (
                    <option key={org.organization_id} value={org.organization_id}>
                      {org.organization_name}
                    </option>
                  ))}
                </select>
                {errors.organization_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.organization_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Site <span className="text-red-500">*</span>
                </label>
                <select
                  name="site_id"
                  value={formData.site_id}
                  onChange={handleChange}
                  disabled={!formData.organization_id}
                  className={`w-full px-3 py-2 border ${
                    errors.site_id ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">Select Site</option>
                  {availableSites.map(site => (
                    <option key={site.site_id} value={site.site_id}>
                      {site.site_name}
                    </option>
                  ))}
                </select>
                {errors.site_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.site_id}</p>
                )}
              </div>
            </div>

            {/* Department Name and Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="department_name"
                  value={formData.department_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.department_name ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  placeholder="Engineering"
                />
                {errors.department_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.department_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Department Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="department_code"
                  value={formData.department_code}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.department_code ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm uppercase`}
                  placeholder="ENG"
                  maxLength="10"
                />
                {errors.department_code && (
                  <p className="text-red-500 text-xs mt-1">{errors.department_code}</p>
                )}
              </div>
            </div>

            {/* Parent Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Parent Department (Optional)
              </label>
              <select
                name="parent_department_id"
                value={formData.parent_department_id || ''}
                onChange={handleChange}
                disabled={!formData.organization_id}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">None (Top Level)</option>
                {availableParentDepartments.map(dept => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.department_name} ({dept.department_code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select if this department is a sub-department
              </p>
            </div>

            {/* Head Employee ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Department Head Employee ID (Optional)
              </label>
              <input
                type="number"
                name="head_employee_id"
                value={formData.head_employee_id || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                placeholder="Enter employee ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                The employee ID who heads this department
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none text-sm"
                placeholder="Engineering and Development Department"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium disabled:opacity-50 text-sm"
              >
                {loading ? 'Saving...' : department ? 'Update Department' : 'Create Department'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DepartmentModal;
