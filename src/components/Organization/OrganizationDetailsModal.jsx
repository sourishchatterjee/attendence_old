import React from 'react';

const OrganizationDetailsModal = ({ organization, onClose, onEdit }) => {
  if (!organization) return null;

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

          {/* Header with Logo */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.organization_name}
                className="h-16 w-16 rounded-lg object-cover border-2 border-primary-200"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-accent-lightBlue flex items-center justify-center border-2 border-primary-200">
                <span className="text-accent-blue font-bold text-2xl">
                  {organization.organization_name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-secondary-700">
                {organization.organization_name}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                  organization.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  organization.is_active ? 'bg-green-600' : 'bg-red-600'
                }`}></span>
                {organization.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Organization Details */}
          <div className="space-y-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Business Owner
                </label>
                <p className="text-gray-900 font-medium text-sm">
                  {organization.business_owner_name}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Email
                </label>
                <p className="text-gray-900 font-medium text-sm">{organization.email}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Phone
                </label>
                <p className="text-gray-900 font-medium text-sm">{organization.phone}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Created At
                </label>
                <p className="text-gray-900 font-medium text-sm">
                  {new Date(organization.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Address
              </label>
              <p className="text-gray-900 font-medium text-sm">{organization.address}</p>
            </div>

            {/* Statistics */}
            {(organization.employee_count !== undefined ||
              organization.site_count !== undefined ||
              organization.department_count !== undefined) && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center bg-primary-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary-600">
                    {organization.employee_count || 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">Employees</div>
                </div>
                <div className="text-center bg-accent-lightBlue rounded-lg p-4">
                  <div className="text-2xl font-bold text-accent-blue">
                    {organization.site_count || 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">Sites</div>
                </div>
                <div className="text-center bg-secondary-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-secondary-600">
                    {organization.department_count || 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">Departments</div>
                </div>
              </div>
            )}
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
              Edit Organization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetailsModal;
