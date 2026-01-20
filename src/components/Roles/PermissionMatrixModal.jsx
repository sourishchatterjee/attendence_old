import React, { useState, useEffect } from 'react';
import { 
  FiGrid, 
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiLock
} from 'react-icons/fi';
import { 
  IoShieldCheckmarkOutline
} from 'react-icons/io5';
import { permissionAPI } from '../../services/permissionAPI';

const PermissionMatrixModal = ({ role, permissions, onClose, onSuccess }) => {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [groupedPermissions, setGroupedPermissions] = useState({});

  useEffect(() => {
    fetchRolePermissions();
  }, [role]);

  const fetchRolePermissions = async () => {
    try {
      setLoadingPermissions(true);
      const response = await permissionAPI.getRolePermissions(role.role_id);
      const rolePerms = response.data || [];
      const permIds = rolePerms.map(p => p.permission_id || p.id);
      setSelectedPermissions(permIds);
      
      // Group permissions by module/category
      const grouped = {};
      permissions.forEach(permission => {
        const category = permission.module || permission.category || 'General';
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(permission);
      });
      setGroupedPermissions(grouped);
    } catch (err) {
      console.error('Error fetching role permissions:', err);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleTogglePermission = (permissionId) => {
    if (selectedPermissions.includes(permissionId)) {
      setSelectedPermissions(selectedPermissions.filter(id => id !== permissionId));
    } else {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    }
  };

  const handleSelectAll = (category) => {
    const categoryPermissions = groupedPermissions[category];
    const categoryIds = categoryPermissions.map(p => p.permission_id || p.id);
    const allSelected = categoryIds.every(id => selectedPermissions.includes(id));

    if (allSelected) {
      // Deselect all in category
      setSelectedPermissions(selectedPermissions.filter(id => !categoryIds.includes(id)));
    } else {
      // Select all in category
      const newSelected = [...selectedPermissions];
      categoryIds.forEach(id => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      setSelectedPermissions(newSelected);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await permissionAPI.updateRolePermissions(role.role_id, selectedPermissions);
      alert('✅ Permissions updated successfully');
      onSuccess();
    } catch (err) {
      console.error('Update permissions error:', err);
      alert(`❌ ${err.message || 'Failed to update permissions'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = Object.keys(groupedPermissions).reduce((acc, category) => {
    const filtered = groupedPermissions[category].filter(permission => {
      if (!searchTerm) return true;
      const name = (permission.permission_name || permission.name || '').toLowerCase();
      const desc = (permission.permission_description || permission.description || '').toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
    });
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-5xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
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
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <FiGrid className="text-2xl text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary-700">Manage Permissions</h3>
              <p className="text-sm text-gray-500">{role.role_name}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                />
              </div>
              <div className="text-sm text-purple-700 font-semibold">
                Selected: <span className="text-purple-900">{selectedPermissions.length}</span> / {permissions.length}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
              <div className="text-2xl font-bold text-blue-600">{permissions.length}</div>
              <div className="text-xs text-blue-700 mt-1">Total Permissions</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
              <div className="text-2xl font-bold text-green-600">{selectedPermissions.length}</div>
              <div className="text-xs text-green-700 mt-1">Selected</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {permissions.length - selectedPermissions.length}
              </div>
              <div className="text-xs text-orange-700 mt-1">Not Selected</div>
            </div>
          </div>

          {/* Permissions Matrix */}
          {loadingPermissions ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <p className="text-gray-500 ml-3">Loading permissions...</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {Object.keys(filteredCategories).length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <FiLock className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No permissions found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {searchTerm ? 'Try adjusting your search' : 'No permissions available'}
                  </p>
                </div>
              ) : (
                Object.keys(filteredCategories).map(category => {
                  const categoryPermissions = filteredCategories[category];
                  const categoryIds = categoryPermissions.map(p => p.permission_id || p.id);
                  const allSelected = categoryIds.every(id => selectedPermissions.includes(id));
                  const someSelected = categoryIds.some(id => selectedPermissions.includes(id));

                  return (
                    <div key={category} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      {/* Category Header */}
                      <div className="bg-gradient-to-r from-primary-50 to-purple-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <IoShieldCheckmarkOutline className="text-primary-600 text-xl" />
                            <h4 className="font-semibold text-gray-900">{category}</h4>
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-800 rounded-full text-xs font-semibold">
                              {categoryPermissions.length}
                            </span>
                          </div>
                          <button
                            onClick={() => handleSelectAll(category)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                              allSelected
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                      </div>

                      {/* Permissions List */}
                      <div className="divide-y divide-gray-200">
                        {categoryPermissions.map(permission => {
                          const permId = permission.permission_id || permission.id;
                          const isSelected = selectedPermissions.includes(permId);

                          return (
                            <div
                              key={permId}
                              className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
                                isSelected ? 'bg-green-50' : ''
                              }`}
                              onClick={() => handleTogglePermission(permId)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex items-center h-5">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">
                                      {permission.permission_name || permission.name}
                                    </span>
                                    {isSelected && (
                                      <FiCheckCircle className="text-green-600 flex-shrink-0" />
                                    )}
                                  </div>
                                  {permission.permission_description && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {permission.permission_description || permission.description}
                                    </p>
                                  )}
                                  {permission.permission_key && (
                                    <code className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded mt-1 inline-block">
                                      {permission.permission_key}
                                    </code>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-6 border-t mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || loadingPermissions}
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiCheckCircle />
                  Save Permissions
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionMatrixModal;
