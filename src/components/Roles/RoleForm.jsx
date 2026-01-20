// components/Roles/RoleForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle, X } from 'lucide-react';
import permissionAPI from '../../services/permissionAPI';

const RoleForm = () => {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const isEditMode = Boolean(roleId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    organization_id: 1,
    role_name: '',
    role_key: '',
    description: '',
    is_active: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      fetchRoleDetails();
    }
  }, [roleId]);

  const fetchRoleDetails = async () => {
    setLoading(true);
    try {
      const response = await permissionAPI.getRoleById(roleId);
      if (response.success) {
        setFormData({
          organization_id: response.data.organization_id,
          role_name: response.data.role_name,
          role_key: response.data.role_key,
          description: response.data.description || '',
          is_active: response.data.is_active
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch role details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.role_name.trim()) {
      newErrors.role_name = 'Role name is required';
    }

    if (!formData.role_key.trim()) {
      newErrors.role_key = 'Role key is required';
    } else if (!/^[a-z_]+$/.test(formData.role_key)) {
      newErrors.role_key = 'Role key must be lowercase with underscores only';
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
    setError('');
    setSuccess('');

    try {
      let response;
      if (isEditMode) {
        response = await permissionAPI.updateRole(roleId, formData);
      } else {
        response = await permissionAPI.createRole(formData);
      }

      if (response.success) {
        setSuccess(isEditMode ? 'Role updated successfully' : 'Role created successfully');
        setTimeout(() => {
          navigate('/roles');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} role`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/roles')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Roles
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Role' : 'Create New Role'}
        </h1>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="role_name"
                value={formData.role_name}
                onChange={handleChange}
                placeholder="e.g., Manager"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.role_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.role_name && (
                <p className="mt-1 text-sm text-red-600">{errors.role_name}</p>
              )}
            </div>

            {/* Role Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="role_key"
                value={formData.role_key}
                onChange={handleChange}
                placeholder="e.g., manager"
                disabled={isEditMode}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.role_key ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {errors.role_key ? (
                <p className="mt-1 text-sm text-red-600">{errors.role_key}</p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">Use lowercase with underscores</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe the role and its responsibilities"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Active Status */}
            <div className="md:col-span-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/roles')}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditMode ? 'Update Role' : 'Create Role'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;
