import React from 'react';

const PermissionModuleCard = ({
  module,
  permissions,
  isExpanded,
  isReadOnly,
  onToggle,
  onPermissionChange,
  onSelectAll,
  onDeselectAll,
  onModuleSelectAll,
  onModuleDeselectAll,
}) => {
  const getModuleIcon = (moduleKey) => {
    const icons = {
      employees: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      ),
      organizations: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      ),
      departments: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      ),
      roles: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      ),
      attendance: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
      reports: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      ),
      settings: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      ),
    };
    return icons[moduleKey] || (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    );
  };

  const getModuleColor = (index) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-purple-100 text-purple-600',
      'bg-green-100 text-green-600',
      'bg-orange-100 text-orange-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
      'bg-teal-100 text-teal-600',
    ];
    return colors[index % colors.length];
  };

  const isPermissionActive = (permissionId) => {
    const perm = permissions[permissionId];
    if (!perm) return false;
    return Object.values(perm).some(v => v === true);
  };

  const isAllSelected = (permissionId) => {
    const perm = permissions[permissionId];
    if (!perm) return false;
    return perm.can_create && perm.can_read && perm.can_update && perm.can_delete && perm.can_export;
  };

  const hasAnyPermission = () => {
    return module.permissions?.some(perm => isPermissionActive(perm.permission_id));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
      {/* Module Header */}
      <div 
        className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Module Icon */}
            <div className={`h-12 w-12 rounded-lg ${getModuleColor(module.module_id)} flex items-center justify-center`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {getModuleIcon(module.module_key)}
              </svg>
            </div>

            {/* Module Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">{module.module_name}</h3>
                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-mono">
                  {module.module_key}
                </span>
                {hasAnyPermission() && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{module.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {module.permissions?.length || 0} Permissions
                </span>
                {hasAnyPermission() && (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {module.permissions?.filter(p => isPermissionActive(p.permission_id)).length || 0} Assigned
                  </span>
                )}
              </div>
            </div>

            {/* Module Actions */}
            {!isReadOnly && (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onModuleSelectAll(module)}
                  className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition"
                >
                  Select All
                </button>
                <button
                  onClick={() => onModuleDeselectAll(module)}
                  className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Expand/Collapse Icon */}
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Permissions List */}
      {isExpanded && (
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Permission
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase w-24">
                    Create
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase w-24">
                    Read
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase w-24">
                    Update
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase w-24">
                    Delete
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase w-24">
                    Export
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {module.permissions?.map((permission) => {
                  const perm = permissions[permission.permission_id] || {
                    can_create: false,
                    can_read: false,
                    can_update: false,
                    can_delete: false,
                    can_export: false,
                  };

                  return (
                    <tr 
                      key={permission.permission_id} 
                      className={`hover:bg-gray-50 transition ${
                        isPermissionActive(permission.permission_id) ? 'bg-green-50' : ''
                      }`}
                    >
                      {/* Permission Name */}
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {permission.permission_name}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {permission.permission_key}
                          </div>
                        </div>
                      </td>

                      {/* Create Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={perm.can_create}
                          onChange={(e) => onPermissionChange(permission.permission_id, 'can_create', e.target.checked)}
                          disabled={isReadOnly}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* Read Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={perm.can_read}
                          onChange={(e) => onPermissionChange(permission.permission_id, 'can_read', e.target.checked)}
                          disabled={isReadOnly}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* Update Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={perm.can_update}
                          onChange={(e) => onPermissionChange(permission.permission_id, 'can_update', e.target.checked)}
                          disabled={isReadOnly}
                          className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* Delete Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={perm.can_delete}
                          onChange={(e) => onPermissionChange(permission.permission_id, 'can_delete', e.target.checked)}
                          disabled={isReadOnly}
                          className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* Export Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={perm.can_export}
                          onChange={(e) => onPermissionChange(permission.permission_id, 'can_export', e.target.checked)}
                          disabled={isReadOnly}
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3 px-4 text-center">
                        {!isReadOnly && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onSelectAll(permission.permission_id)}
                              disabled={isAllSelected(permission.permission_id)}
                              className="text-xs text-green-600 hover:text-green-700 font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Select All"
                            >
                              All
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => onDeselectAll(permission.permission_id)}
                              disabled={!isPermissionActive(permission.permission_id)}
                              className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Clear All"
                            >
                              None
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {(!module.permissions || module.permissions.length === 0) && (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-sm">No permissions in this module</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PermissionModuleCard;
