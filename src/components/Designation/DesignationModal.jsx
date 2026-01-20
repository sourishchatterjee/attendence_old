import React, { useState, useEffect } from 'react';
import { designationAPI } from '../../services/designationAPI';

const DesignationModal = ({ designation, organizations, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    organization_id: '',
    designation_name: '',
    designation_code: '',
    level: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (designation) {
      setFormData({
        organization_id: designation.organization_id || '',
        designation_name: designation.designation_name || '',
        designation_code: designation.designation_code || '',
        level: designation.level || '',
        description: designation.description || '',
      });
    }
  }, [designation]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }

    if (!formData.designation_name.trim()) {
      newErrors.designation_name = 'Designation name is required';
    } else if (formData.designation_name.trim().length < 2) {
      newErrors.designation_name = 'Designation name must be at least 2 characters';
    }

    if (!formData.designation_code.trim()) {
      newErrors.designation_code = 'Designation code is required';
    } else if (formData.designation_code.length > 10) {
      newErrors.designation_code = 'Designation code must be 10 characters or less';
    }

    if (!formData.level) {
      newErrors.level = 'Level is required';
    } else {
      const levelNum = parseInt(formData.level, 10);
      if (isNaN(levelNum) || levelNum < 1 || levelNum > 10) {
        newErrors.level = 'Level must be between 1 and 10';
      }
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
        designation_name: formData.designation_name.trim(),
        designation_code: formData.designation_code.trim().toUpperCase(),
        level: parseInt(formData.level, 10),
        description: formData.description.trim() || null,
      };

      if (designation) {
        await designationAPI.updateDesignation(designation.designation_id, submitData);
        alert('✅ Designation updated successfully');
      } else {
        await designationAPI.createDesignation(submitData);
        alert('✅ Designation created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to save designation'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const getLevelDescription = (level) => {
    const descriptions = {
      1: 'Entry Level',
      2: 'Junior Level',
      3: 'Intermediate Level',
      4: 'Senior Level',
      5: 'Lead Level',
      6: 'Principal Level',
      7: 'Manager Level',
      8: 'Senior Manager Level',
      9: 'Director Level',
      10: 'Executive Level',
    };
    return descriptions[level] || '';
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

          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">
              {designation ? 'Edit Designation' : 'Add New Designation'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Organization */}
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

            {/* Designation Name and Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Designation Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="designation_name"
                  value={formData.designation_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.designation_name ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  placeholder="Senior Software Engineer"
                />
                {errors.designation_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.designation_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Designation Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="designation_code"
                  value={formData.designation_code}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.designation_code ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm uppercase`}
                  placeholder="SSE"
                  maxLength="10"
                />
                {errors.designation_code && (
                  <p className="text-red-500 text-xs mt-1">{errors.designation_code}</p>
                )}
              </div>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Level <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.level ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                >
                  <option value="">Select Level</option>
                  <option value="1">Level 1 - Entry Level</option>
                  <option value="2">Level 2 - Junior Level</option>
                  <option value="3">Level 3 - Intermediate Level</option>
                  <option value="4">Level 4 - Senior Level</option>
                  <option value="5">Level 5 - Lead Level</option>
                  <option value="6">Level 6 - Principal Level</option>
                  <option value="7">Level 7 - Manager Level</option>
                  <option value="8">Level 8 - Senior Manager Level</option>
                  <option value="9">Level 9 - Director Level</option>
                  <option value="10">Level 10 - Executive Level</option>
                </select>
              </div>
              {errors.level && (
                <p className="text-red-500 text-xs mt-1">{errors.level}</p>
              )}
              {formData.level && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {getLevelDescription(formData.level)}
                </p>
              )}
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
                placeholder="Senior level software development position..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a brief description of this designation
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Designation Hierarchy</h4>
                  <p className="text-xs text-blue-700">
                    Levels help establish organizational hierarchy. Higher levels typically indicate more seniority and responsibility.
                  </p>
                </div>
              </div>
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
                {loading ? 'Saving...' : designation ? 'Update Designation' : 'Create Designation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DesignationModal;
