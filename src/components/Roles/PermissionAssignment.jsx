// components/Roles/PermissionAssignment.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  CheckCircle, 
  X 
} from 'lucide-react';
import permissionAPI from '../../services/permissionAPI';

const PermissionAssignment = () => {
  const { roleId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [roleInfo, setRoleInfo] = useState(null);
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    fetchData();
  }, [roleId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roleResponse, modulesResponse] = await Promise.all([
        permissionAPI.getRoleById(roleId),
        permissionAPI.getPermissionModules()
      ]);

      if (roleResponse.success) {
        setRoleInfo(roleResponse.data);
      }

      if (modulesResponse.success) {
        setModules(modulesResponse.data);
        initializePermissions(modulesResponse.data);
        // Expand first module by default
        if (modulesResponse.data.length > 0) {
          setExpandedModules({ [modulesResponse.data[0].module_id]: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const initializePermissions = (modulesData) => {
    const permissionsObj = {};
    modulesData.forEach(module => {
      module.permissions.forEach(perm => {
        permissionsObj[perm.permission_id] = {
          permission_id: perm.permission_id,
          can_create: false,
          can_read: false,
          can_update: false,
          can_delete: false,
          can_export: false
        };
      });
    });
    setPermissions(permissionsObj);
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handlePermissionChange = (permissionId, action, checked) => {
    setPermissions(prev => ({
      ...prev,
      [permissionId]: {
        ...prev[permissionId],
        [action]: checked
      }
    }));
  };

  const handleSelectAll = (modulePermissions, checked) => {
    const updates = {};
    modulePermissions.forEach(perm => {
      updates[perm.permission_id] = {
        ...permissions[perm.permission_id],
        can_create: checked,
        can_read: checked,
        can_update: checked,
        can_delete: checked,
        can_export: checked
      };
    });
    setPermissions(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const permissionsArray = Object.values(permissions).filter(perm =>
        perm.can_create || perm.can_read || perm.can_update || perm.can_delete || perm.can_export
      );

      const response = await permissionAPI.assignPermissions({
        role_id: parseInt(roleId),
        permissions: permissionsArray
      });

      if (response.success) {
        setSuccess('Permissions assigned successfully');
        setTimeout(() => {
          navigate('/roles');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to assign permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/roles')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Roles
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Permissions</h1>
            {roleInfo && (
              <p className="text-gray-600 mt-1">Role: {roleInfo.role_name}</p>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Permissions
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Permission Modules */}
      <div className="space-y-4">
        {modules.map((module) => (
          <div key={module.module_id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Module Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleModule(module.module_id)}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    {expandedModules[module.module_id] ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {module.module_name}
                  </h2>
                  <span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                    {module.permissions?.length || 0} permissions
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSelectAll(module.permissions, true)}
                    className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => handleSelectAll(module.permissions, false)}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            </div>

            {/* Module Content */}
            {expandedModules[module.module_id] && (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Permission
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Create
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Read
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Update
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Delete
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Export
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {module.permissions?.map((perm) => (
                        <tr key={perm.permission_id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {perm.permission_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {perm.permission_key}
                              </div>
                            </div>
                          </td>
                          {['can_create', 'can_read', 'can_update', 'can_delete', 'can_export'].map(action => (
                            <td key={action} className="text-center py-3 px-4">
                              <input
                                type="checkbox"
                                checked={permissions[perm.permission_id]?.[action] || false}
                                onChange={(e) => handlePermissionChange(
                                  perm.permission_id,
                                  action,
                                  e.target.checked
                                )}
                                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => navigate('/roles')}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Permissions
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PermissionAssignment;
