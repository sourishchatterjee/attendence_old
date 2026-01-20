import React from 'react';

const DepartmentDetailsModal = ({ department, onClose, onEdit }) => {
  if (!department) return null;

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
            <div className="h-16 w-16 rounded-lg bg-secondary-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-secondary-700">
                {department.department_name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Code: {department.department_code}</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                  department.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  department.is_active ? 'bg-green-600' : 'bg-red-600'
                }`}></span>
                {department.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Department Details */}
          <div className="space-y-6">
            {/* Organization & Site */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Organization
                </label>
                <p className="text-gray-900 font-medium text-sm">
                  {department.organization_name}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Site
                </label>
                <p className="text-gray-900 font-medium text-sm">{department.site_name}</p>
              </div>
            </div>

            {/* Department Head & Employee Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Department Head
                </label>
                <p className="text-gray-900 font-medium text-sm flex items-center gap-2">
                  {department.head_employee_name ? (
                    <>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {department.head_employee_name}
                    </>
                  ) : (
                    <span className="text-gray-400">Not assigned</span>
                  )}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Employee Count
                </label>
                <p className="text-gray-900 font-medium text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {department.employee_count || 0} Employees
                </p>
              </div>
            </div>

            {/* Parent Department */}
            {department.parent_department_id && (
              <div className="bg-accent-lightBlue rounded-lg p-4">
                <label className="block text-xs font-semibold text-accent-teal uppercase mb-1">
                  Parent Department
                </label>
                <p className="text-accent-blue font-medium text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Sub-department (ID: {department.parent_department_id})
                </p>
              </div>
            )}

            {/* Description */}
            {department.description && (
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Description
                </label>
                <p className="text-gray-900 text-sm leading-relaxed">{department.description}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Created At
              </label>
              <p className="text-gray-900 font-medium text-sm">
                {new Date(department.created_at).toLocaleDateString('en-US', {
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
              Edit Department
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetailsModal;
