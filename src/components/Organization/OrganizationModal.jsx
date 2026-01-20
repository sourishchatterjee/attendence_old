import React, { useState, useEffect } from 'react';
import { organizationAPI } from '../../services/organizationAPI';

const OrganizationModal = ({ organization, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    organization_name: '',
    business_owner_name: '',
    email: '',
    phone: '',
    address: '',
    logo_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (organization) {
      setFormData({
        organization_name: organization.organization_name || '',
        business_owner_name: organization.business_owner_name || '',
        email: organization.email || '',
        phone: organization.phone || '',
        address: organization.address || '',
        logo_url: organization.logo_url || '',
      });
    }
  }, [organization]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization_name.trim()) {
      newErrors.organization_name = 'Organization name is required';
    }

    if (!formData.business_owner_name.trim()) {
      newErrors.business_owner_name = 'Business owner name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
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
      if (organization) {
        await organizationAPI.updateOrganization(organization.organization_id, formData);
        alert('Organization updated successfully');
      } else {
        await organizationAPI.createOrganization(formData);
        alert('Organization created successfully');
      }
      onSuccess();
    } catch (error) {
      alert(error.message || 'Failed to save organization');
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">
              {organization ? 'Edit Organization' : 'Add New Organization'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.organization_name ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                placeholder="Tech Corp Pvt Ltd"
              />
              {errors.organization_name && (
                <p className="text-red-500 text-xs mt-1">{errors.organization_name}</p>
              )}
            </div>

            {/* Business Owner Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Business Owner Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="business_owner_name"
                value={formData.business_owner_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.business_owner_name ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                placeholder="John Smith"
              />
              {errors.business_owner_name && (
                <p className="text-red-500 text-xs mt-1">{errors.business_owner_name}</p>
              )}
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  placeholder="info@techcorp.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  placeholder="9876543210"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className={`w-full px-3 py-2 border ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none text-sm`}
                placeholder="123 Business Park, Tech City"
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Logo URL (Optional)
              </label>
              <input
                type="url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                placeholder="https://example.com/logo.png"
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
                {loading ? 'Saving...' : organization ? 'Update Organization' : 'Create Organization'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrganizationModal;
