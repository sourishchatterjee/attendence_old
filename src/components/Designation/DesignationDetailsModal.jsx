import React from 'react';

const DesignationDetailsModal = ({ designation, onClose, onEdit }) => {
  if (!designation) return null;

  const getLevelBadgeColor = (level) => {
    if (level <= 2) return 'bg-green-100 text-green-800 border-green-200';
    if (level <= 4) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (level <= 6) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (level <= 8) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
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
    return descriptions[level] || 'Custom Level';
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

          {/* Header */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="h-16 w-16 rounded-lg bg-primary-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-secondary-700">
                {designation.designation_name}
              </h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-2.5 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-mono">
                  {designation.designation_code}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    designation.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    designation.is_active ? 'bg-green-600' : 'bg-red-600'
                  }`}></span>
                  {designation.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Designation Details */}
          <div className="space-y-6">
            {/* Organization */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Organization
              </label>
              <p className="text-gray-900 font-medium text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {designation.organization_name}
              </p>
            </div>

            {/* Level Info - Large Display */}
            <div className={`border-2 rounded-lg p-6 ${getLevelBadgeColor(designation.level)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-2 opacity-75">
                    Designation Level
                  </label>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold">
                      {designation.level}
                    </span>
                    <span className="text-lg font-semibold">
                      {getLevelDescription(designation.level)}
                    </span>
                  </div>
                </div>
                <div className="h-16 w-16 rounded-full bg-white bg-opacity-50 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Employee Count */}
            <div className="bg-accent-lightBlue rounded-lg p-4">
              <label className="block text-xs font-semibold text-accent-teal uppercase mb-1">
                Employees with this Designation
              </label>
              <p className="text-accent-blue font-bold text-2xl flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {designation.employee_count || 0}
              </p>
            </div>

            {/* Description */}
            {designation.description && (
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Description
                </label>
                <p className="text-gray-900 text-sm leading-relaxed">{designation.description}</p>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Designation ID
                </label>
                <p className="text-gray-900 font-mono text-sm">#{designation.designation_id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Created At
                </label>
                <p className="text-gray-900 font-medium text-sm">
                  {new Date(designation.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
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
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Designation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignationDetailsModal;
