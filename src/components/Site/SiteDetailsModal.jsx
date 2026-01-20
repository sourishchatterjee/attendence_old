import React from 'react';

const SiteDetailsModal = ({ site, onClose, onEdit }) => {
  if (!site) return null;

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

          {/* Header */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="h-16 w-16 rounded-lg bg-accent-lightBlue flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-secondary-700">
                {site.site_name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Site Code: {site.site_code}</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                  site.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  site.is_active ? 'bg-green-600' : 'bg-red-600'
                }`}></span>
                {site.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Site Details */}
          <div className="space-y-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Organization
                </label>
                <p className="text-gray-900 font-medium text-sm">
                  {site.organization_name}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Employee Count
                </label>
                <p className="text-gray-900 font-medium text-sm">
                  {site.employee_count || 0} Employees
                </p>
              </div>
            </div>

            {/* Location Details */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location Details
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-0.5">Address</label>
                    <p className="text-sm text-gray-900">{site.address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">City</label>
                      <p className="text-sm text-gray-900">{site.city}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">State</label>
                      <p className="text-sm text-gray-900">{site.state}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">Country</label>
                      <p className="text-sm text-gray-900">{site.country}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">Pincode</label>
                      <p className="text-sm text-gray-900">{site.pincode}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Created At
              </label>
              <p className="text-gray-900 font-medium text-sm">
                {new Date(site.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm"
            >
              Edit Site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDetailsModal;
