import React from 'react';
import { 
  FiShield, 
  FiEdit2,
  FiCheckCircle,
  FiUsers,
  FiLock
} from 'react-icons/fi';
import { 
  IoShieldCheckmarkOutline,
  IoKeyOutline
} from 'react-icons/io5';

const RoleDetailsModal = ({ role, onClose, onEdit, onRefresh }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'N/A';
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
        <div className="relative inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
          <div className="absolute top-4 right-4 z-10">
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
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <IoShieldCheckmarkOutline className="text-3xl text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{role.role_name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Role ID: {role.role_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  role.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {role.is_active ? '● Active' : '○ Inactive'}
                </span>
              </div>
            </div>
            {role.role_description && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded p-3 border border-gray-200">
                {role.role_description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <FiShield className="w-4 h-4" />
                  Basic Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Role ID:</span>
                    <span className="font-semibold text-blue-900">{role.role_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Role Name:</span>
                    <span className="font-semibold text-blue-900">{role.role_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Created:</span>
                    <span className="font-semibold text-blue-900">{formatDate(role.created_at)}</span>
                  </div>
                  {role.updated_at && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Updated:</span>
                      <span className="font-semibold text-blue-900">{formatDate(role.updated_at)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-blue-700">Status:</span>
                    <span className={`font-semibold ${role.is_active ? 'text-green-700' : 'text-gray-700'}`}>
                      {role.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Users Count */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <FiUsers className="w-4 h-4" />
                  Assigned Users
                </h4>
                <div className="text-center py-4">
                  <div className="text-5xl font-bold text-purple-600 mb-2">
                    {role.user_count || 0}
                  </div>
                  <p className="text-sm text-purple-700">Users with this role</p>
                </div>
              </div>

              {/* Role Description */}
              {role.role_description && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Description</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{role.role_description}</p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Permissions Count */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h4 className="text-sm font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <FiLock className="w-4 h-4" />
                  Permissions
                </h4>
                <div className="text-center py-4">
                  <div className="text-5xl font-bold text-orange-600 mb-2">
                    {role.permission_count || 0}
                  </div>
                  <p className="text-sm text-orange-700">Access permissions assigned</p>
                </div>
              </div>

              {/* Permissions List */}
              {role.permissions && role.permissions.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <IoKeyOutline className="w-4 h-4" />
                    Permission Details
                  </h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {role.permissions.map((permission, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-3 bg-white rounded border border-green-300"
                      >
                        <FiCheckCircle className="text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm truncate">
                            {permission.permission_name || permission.name}
                          </div>
                          {permission.permission_description && (
                            <div className="text-xs text-gray-600 mt-0.5">
                              {permission.permission_description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Role Capabilities */}
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <h4 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <FiShield className="w-4 h-4" />
                  Role Capabilities
                </h4>
                <div className="space-y-2 text-sm text-indigo-800">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-indigo-600" />
                    <span>Can be assigned to multiple users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-indigo-600" />
                    <span>Permissions can be customized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-indigo-600" />
                    <span>Access control granularity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-indigo-600" />
                    <span>{role.is_active ? 'Currently active' : 'Currently inactive'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-6 border-t mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
            >
              Close
            </button>
            <button
              onClick={() => {
                onEdit();
              }}
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm flex items-center justify-center gap-2"
            >
              <FiEdit2 />
              Edit Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetailsModal;
