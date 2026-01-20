import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { permissionAPI } from '../../services/permissionAPI';
import { roleAPI } from '../../services/roleAPI';
import PermissionModuleCard from '../../components/Permissions/PermissionModuleCard';

const RolePermissions = () => {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [modules, setModules] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedModules, setExpandedModules] = useState(new Set());

  useEffect(() => {
    if (roleId) {
      fetchData();
    }
  }, [roleId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch role details
      const roleResponse = await roleAPI.getRoleById(roleId);
      setRole(roleResponse.data || roleResponse);

      // Fetch all permission modules
      const modulesResponse = await permissionAPI.getAllPermissionModules();
      const modulesData = modulesResponse.data || modulesResponse || [];
      setModules(Array.isArray(modulesData) ? modulesData : []);

      // Expand all modules by default
      const allModuleIds = new Set(modulesData.map(m => m.module_id));
      setExpandedModules(allModuleIds);

      // Fetch role permissions
      const permissionsResponse = await permissionAPI.getRolePermissions(roleId);
      const permissionsData = permissionsResponse.data || permissionsResponse || [];
      setRolePermissions(Array.isArray(permissionsData) ? permissionsData : []);

      // Convert permissions array to object for easier access
      const permissionsObj = {};
      permissionsData.forEach(perm => {
        permissionsObj[perm.permission_id] = {
          can_create: perm.can_create || false,
          can_read: perm.can_read || false,
          can_update: perm.can_update || false,
          can_delete: perm.can_delete || false,
          can_export: perm.can_export || false,
        };
      });
      setPermissions(permissionsObj);

    } catch (err) {
      console.error('Fetch data error:', err);
      if (err.errors && Array.isArray(err.errors)) {
        const errorMessages = err.errors.map(e => `${e.field}: ${e.message}`).join(', ');
        setError(`Validation Error: ${errorMessages}`);
      } else {
        setError(err.message || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionId, action, value) => {
    setPermissions(prev => ({
      ...prev,
      [permissionId]: {
        ...(prev[permissionId] || {
          can_create: false,
          can_read: false,
          can_update: false,
          can_delete: false,
          can_export: false,
        }),
        [action]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSelectAll = (permissionId) => {
    setPermissions(prev => ({
      ...prev,
      [permissionId]: {
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true,
        can_export: true,
      },
    }));
    setHasChanges(true);
  };

  const handleDeselectAll = (permissionId) => {
    setPermissions(prev => ({
      ...prev,
      [permissionId]: {
        can_create: false,
        can_read: false,
        can_update: false,
        can_delete: false,
        can_export: false,
      },
    }));
    setHasChanges(true);
  };

  const handleModuleSelectAll = (module) => {
    const newPermissions = { ...permissions };
    module.permissions.forEach(perm => {
      newPermissions[perm.permission_id] = {
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true,
        can_export: true,
      };
    });
    setPermissions(newPermissions);
    setHasChanges(true);
  };

  const handleModuleDeselectAll = (module) => {
    const newPermissions = { ...permissions };
    module.permissions.forEach(perm => {
      newPermissions[perm.permission_id] = {
        can_create: false,
        can_read: false,
        can_update: false,
        can_delete: false,
        can_export: false,
      };
    });
    setPermissions(newPermissions);
    setHasChanges(true);
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!hasChanges) {
      alert('ℹ️ No changes to save');
      return;
    }

    try {
      setSaving(true);

      // Convert permissions object to array format
      const permissionsArray = Object.entries(permissions)
        .filter(([_, perms]) => {
          // Only include permissions that have at least one action enabled
          return Object.values(perms).some(val => val === true);
        })
        .map(([permissionId, perms]) => ({
          permission_id: parseInt(permissionId, 10),
          ...perms,
        }));

      await permissionAPI.assignPermissions({
        role_id: parseInt(roleId, 10),
        permissions: permissionsArray,
      });

      alert('✅ Permissions saved successfully');
      setHasChanges(false);
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Save permissions error:', err);
      if (err.errors && Array.isArray(err.errors)) {
        const errorMessages = err.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${err.message || 'Failed to save permissions'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/roles');
      }
    } else {
      navigate('/roles');
    }
  };

  const filteredModules = modules.filter(module => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    const moduleMatch = module.module_name?.toLowerCase().includes(search) ||
                       module.module_key?.toLowerCase().includes(search);
    
    const permissionMatch = module.permissions?.some(perm =>
      perm.permission_name?.toLowerCase().includes(search) ||
      perm.permission_key?.toLowerCase().includes(search)
    );
    
    return moduleMatch || permissionMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/roles')}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-secondary-700">Manage Role Permissions</h1>
              <p className="text-sm text-gray-500 mt-1">
                Configure permissions for: <span className="font-semibold text-gray-700">{role?.role_name}</span>
                {role?.is_system_role && (
                  <span className="ml-2 px-2 py-0.5 bg-accent-lightBlue text-accent-blue rounded text-xs font-semibold">
                    SYSTEM ROLE
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            {/* Search */}
            <div className="flex-1 min-w-[250px] max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const allExpanded = expandedModules.size === modules.length;
                  if (allExpanded) {
                    setExpandedModules(new Set());
                  } else {
                    setExpandedModules(new Set(modules.map(m => m.module_id)));
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700"
              >
                {expandedModules.size === modules.length ? 'Collapse All' : 'Expand All'}
              </button>
              
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving || role?.is_system_role}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Error Loading Permissions</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* System Role Warning */}
        {role?.is_system_role && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium">System Role - Read Only</p>
              <p className="mt-1">System roles have predefined permissions that cannot be modified.</p>
            </div>
          </div>
        )}

        {/* Changes Indicator */}
        {hasChanges && !role?.is_system_role && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">You have unsaved changes</p>
              <p className="mt-1">Click "Save Changes" to apply your permission updates.</p>
            </div>
          </div>
        )}

        {/* Permission Modules */}
        <div className="space-y-4">
          {filteredModules.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-gray-500 text-sm font-medium">No permissions found</p>
              <p className="text-gray-400 text-xs mt-1">
                {searchTerm ? 'Try adjusting your search' : 'No permission modules available'}
              </p>
            </div>
          ) : (
            filteredModules.map((module) => (
              <PermissionModuleCard
                key={module.module_id}
                module={module}
                permissions={permissions}
                isExpanded={expandedModules.has(module.module_id)}
                isReadOnly={role?.is_system_role}
                onToggle={() => toggleModule(module.module_id)}
                onPermissionChange={handlePermissionChange}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onModuleSelectAll={handleModuleSelectAll}
                onModuleDeselectAll={handleModuleDeselectAll}
              />
            ))
          )}
        </div>

        {/* Footer Summary */}
        {!loading && modules.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Total Modules:</span>
                  <span className="font-bold text-gray-900">{modules.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Total Permissions:</span>
                  <span className="font-bold text-gray-900">
                    {modules.reduce((sum, m) => sum + (m.permissions?.length || 0), 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Assigned:</span>
                  <span className="font-bold text-primary-600">
                    {Object.values(permissions).filter(p => 
                      Object.values(p).some(v => v === true)
                    ).length}
                  </span>
                </div>
              </div>
              
              {hasChanges && !role?.is_system_role && (
                <span className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></span>
                  Unsaved Changes
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolePermissions;
