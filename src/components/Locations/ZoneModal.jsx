import React, { useState, useEffect } from 'react';
import { locationAPI } from '../../services/locationAPI';
import { siteAPI } from '../../services/siteAPI';

const ZoneModal = ({ zone, organizations, sites, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    organization_id: '',
    site_id: '',
    zone_name: '',
    zone_type: 'Single',
    description: '',
  });
  const [filteredSites, setFilteredSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (zone) {
      setFormData({
        organization_id: zone.organization_id || '',
        site_id: zone.site_id || '',
        zone_name: zone.zone_name || '',
        zone_type: zone.zone_type || 'Single',
        description: zone.description || '',
      });
    }
  }, [zone]);

  useEffect(() => {
    if (formData.organization_id) {
      fetchSitesByOrganization(formData.organization_id);
    } else {
      setFilteredSites([]);
      setFormData(prev => ({ ...prev, site_id: '' }));
    }
  }, [formData.organization_id]);

  const fetchSitesByOrganization = async (orgId) => {
    try {
      const response = await siteAPI.getAllSites({ 
        organization_id: parseInt(orgId, 10),
        pageSize: 100 
      });
      setFilteredSites(response.data || []);
    } catch (err) {
      console.error('Error fetching sites:', err);
      setFilteredSites([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }
    if (!formData.site_id) {
      newErrors.site_id = 'Site is required';
    }
    if (!formData.zone_name.trim()) {
      newErrors.zone_name = 'Zone name is required';
    }
    if (!formData.zone_type) {
      newErrors.zone_type = 'Zone type is required';
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
      const submitData = {
        organization_id: parseInt(formData.organization_id, 10),
        site_id: parseInt(formData.site_id, 10),
        zone_name: formData.zone_name.trim(),
        zone_type: formData.zone_type,
        description: formData.description.trim() || null,
      };

      if (zone) {
        await locationAPI.updateZone(zone.zone_id, submitData);
        alert('✅ Zone updated successfully');
      } else {
        await locationAPI.createZone(submitData);
        alert('✅ Zone created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to save zone'}`);
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">
              {zone ? 'Edit Location Zone' : 'Add New Location Zone'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Organization & Site */}
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
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:opacity-50`}
                >
                  <option value="">Select Site</option>
                  {filteredSites.map(site => (
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

            {/* Zone Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Zone Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="zone_name"
                value={formData.zone_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.zone_name ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                placeholder="Office Zone"
              />
              {errors.zone_name && (
                <p className="text-red-500 text-xs mt-1">{errors.zone_name}</p>
              )}
            </div>

            {/* Zone Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                  formData.zone_type === 'Single'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}>
                  <input
                    type="radio"
                    name="zone_type"
                    value="Single"
                    checked={formData.zone_type === 'Single'}
                    onChange={handleChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-900">Single Location</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">One GPS coordinate</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                  formData.zone_type === 'Multiple'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-300'
                }`}>
                  <input
                    type="radio"
                    name="zone_type"
                    value="Multiple"
                    checked={formData.zone_type === 'Multiple'}
                    onChange={handleChange}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-900">Multiple Locations</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Multiple GPS coordinates</p>
                  </div>
                </label>
              </div>
              {errors.zone_type && (
                <p className="text-red-500 text-xs mt-1">{errors.zone_type}</p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">Zone Type Information:</p>
                  <p><strong>Single:</strong> Zone with one location point (e.g., office entrance)</p>
                  <p className="mt-0.5"><strong>Multiple:</strong> Zone with multiple location points (e.g., campus with multiple buildings)</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none text-sm"
                placeholder="Main office location zone"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
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
                {loading ? 'Saving...' : zone ? 'Update Zone' : 'Create Zone'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ZoneModal;
