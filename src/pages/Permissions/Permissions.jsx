import React, { useState, useEffect } from 'react';
import { 
  FiShield, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye,
  FiRefreshCw,
  FiSearch,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiLock,
  FiUnlock,
  FiSettings,
  FiGrid
} from 'react-icons/fi';
import { 
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
  IoPersonOutline,
  IoKeyOutline
} from 'react-icons/io5';
import { permissionAPI } from '../../services/permissionAPI';
import { organizationAPI } from '../../services/organizationAPI';
import RoleModal from '../../components/Roles/RoleModal';
import RoleDetailsModal from '../../components/Roles/RoleDetailsModal';
import PermissionMatrixModal from '../../components/Roles/PermissionMatrixModal';
import AssignUserRoleModal from '../../components/Roles/AssignUserRoleModal';

const Permissions = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [isAssignUserModalOpen, setIsAssignUserModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filterOrganization]);

  const fetchOrganizations = async () => {
    try {
      const response = await organizationAPI.getAllOrganizations({ pageSize: 100 });
      setOrganizations(response.data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filterOrganization !== 'all') {
        params.organization_id = parseInt(filterOrganization, 10);
      }

      const [rolesResponse, permissionsResponse] = await Promise.all([
        permissionAPI.getAllRoles(params),
        permissionAPI.getAllPermissions(),
      ]);

      const rolesData = rolesResponse.data || rolesResponse || [];
      const permissionsData = permissionsResponse.data || permissionsResponse || [];

      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(Array.isArray(permissionsData) ? permissionsData : []);
    } catch (err) {
      console.error('Fetch data error:', err);
      setError(err.message || 'Failed to fetch data');
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (role) => {
    try {
      const response = await permissionAPI.getRoleById(role.role_id);
      setSelectedRole(response.data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Error fetching role details:', err);
      alert(`❌ ${err.message || 'Failed to fetch role details'}`);
    }
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsRoleModalOpen(true);
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (window.confirm(`Delete role "${roleName}"?\n\nThis action cannot be undone and will:\n• Remove role from all users\n• Delete all permission assignments\n• Cannot be recovered\n\nAre you sure?`)) {
      try {
        await permissionAPI.deleteRole(roleId);
        alert('✅ Role deleted successfully');
        fetchData();
      } catch (err) {
        console.error('Delete error:', err);
        alert(`❌ ${err.message || 'Failed to delete role'}`);
      }
    }
  };

  const handleManagePermissions = (role) => {
    setSelectedRole(role);
    setIsMatrixModalOpen(true);
  };

  const handleAssignUsers = (role) => {
    setSelectedRole(role);
    setIsAssignUserModalOpen(true);
  };

  const getRoleIcon = (roleName) => {
    const name = roleName?.toLowerCase() || '';
    if (name.includes('admin') || name.includes('super')) {
      return { icon: <IoShieldCheckmarkOutline />, color: 'text-red-600', bg: 'bg-red-100' };
    } else if (name.includes('manager') || name.includes('supervisor')) {
      return { icon: <IoLockClosedOutline />, color: 'text-purple-600', bg: 'bg-purple-100' };
    } else if (name.includes('user') || name.includes('member')) {
      return { icon: <IoPersonOutline />, color: 'text-blue-600', bg: 'bg-blue-100' };
    }
    return { icon: <IoKeyOutline />, color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const filteredRoles = roles.filter(role => {
    if (searchTerm) {
      const name = (role.role_name || '').toLowerCase();
      const desc = (role.role_description || '').toLowerCase();
      if (!name.includes(searchTerm.toLowerCase()) && 
          !desc.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  const totalUsers = roles.reduce((sum, role) => sum + (role.user_count || 0), 0);
  const activeRoles = roles.filter(role => role.is_active).length;
  const totalPermissions = permissions.length;

  if (loading && roles.length === 0) {
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
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-secondary-700 flex items-center gap-3">
                <IoShieldCheckmarkOutline className="text-primary-500" />
                Roles & Permissions
              </h1>
              <p className="text-sm text-gray-500 mt-1 ml-11">
                Manage user roles and access control permissions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50"
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={() => {
                  setSelectedRole(null);
                  setIsRoleModalOpen(true);
                }}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <FiPlus />
                New Role
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Roles */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-primary-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiShield className="text-2xl text-white" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <IoKeyOutline className="text-primary-600" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Roles</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{roles.length}</p>
                <span className="text-xs text-gray-400">roles</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary-600">
                <FiCheckCircle className="text-sm" />
                <span className="font-medium">All roles</span>
              </div>
            </div>
          </div>

          {/* Active Roles */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiCheckCircle className="text-2xl text-white" />
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Active Roles</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{activeRoles}</p>
                <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                  {roles.length > 0 ? ((activeRoles / roles.length) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                <FiUnlock className="text-sm" />
                <span className="font-medium">Enabled roles</span>
              </div>
            </div>
          </div>

          {/* Total Users */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiUsers className="text-2xl text-white" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <IoPersonOutline className="text-blue-600" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Users</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
                <span className="text-xs text-gray-400">users</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-blue-600">
                <FiUsers className="text-sm" />
                <span className="font-medium">Assigned users</span>
              </div>
            </div>
          </div>

          {/* Total Permissions */}
          <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-bl-full"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiLock className="text-2xl text-white" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <FiSettings className="text-purple-600" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Permissions</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{totalPermissions}</p>
                <span className="text-xs text-gray-400">available</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-purple-600">
                <FiLock className="text-sm" />
                <span className="font-medium">Access controls</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[300px] relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search roles by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
              />
            </div>

            {/* Organization Filter */}
            <select
              value={filterOrganization}
              onChange={(e) => setFilterOrganization(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">🏢 All Organizations</option>
              {organizations.map(org => (
                <option key={org.organization_id} value={org.organization_id}>
                  {org.organization_name}
                </option>
              ))}
            </select>

            {(searchTerm || filterOrganization !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterOrganization('all');
                }}
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <FiXCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <IoShieldCheckmarkOutline className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No roles found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm ? 'Try adjusting your search' : 'Click "New Role" to create your first role'}
              </p>
            </div>
          ) : (
            filteredRoles.map((role) => {
              const roleIcon = getRoleIcon(role.role_name);
              return (
                <div
                  key={role.role_id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-primary-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg ${roleIcon.bg} flex items-center justify-center shadow-md`}>
                          <span className={`text-xl ${roleIcon.color}`}>{roleIcon.icon}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition">
                            {role.role_name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {role.organization_name || `ID: ${role.role_id}`}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        role.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {role.is_active ? '● Active' : '○ Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Description */}
                    {role.role_description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {role.role_description}
                      </p>
                    )}

                    {/* Role Key */}
                    {role.role_key && (
                      <div className="text-xs bg-gray-50 rounded p-2 border border-gray-200">
                        <span className="text-gray-500">Key:</span>
                        <code className="ml-2 text-purple-600 font-mono">{role.role_key}</code>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2">
                          <FiUsers className="text-blue-600" />
                          <span className="text-xs font-medium text-blue-900">Users</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">{role.user_count || 0}</span>
                      </div>

                      <div className="flex items-center justify-between py-3 px-4 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-2">
                          <FiLock className="text-purple-600" />
                          <span className="text-xs font-medium text-purple-900">Perms</span>
                        </div>
                        <span className="text-lg font-bold text-purple-600">{role.permission_count || 0}</span>
                      </div>
                    </div>

                    {/* Created Date */}
                    {role.created_at && (
                      <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                        Created: {new Date(role.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(role)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleManagePermissions(role)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Manage Permissions"
                      >
                        <FiGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAssignUsers(role)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Assign Users"
                      >
                        <FiUsers className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="p-2 text-secondary-600 hover:bg-secondary-50 rounded-lg transition"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.role_id, role.role_name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      {isRoleModalOpen && (
        <RoleModal
          role={selectedRole}
          organizations={organizations}
          onClose={() => {
            setIsRoleModalOpen(false);
            setSelectedRole(null);
          }}
          onSuccess={() => {
            setIsRoleModalOpen(false);
            setSelectedRole(null);
            fetchData();
          }}
        />
      )}

      {isDetailsModalOpen && selectedRole && (
        <RoleDetailsModal
          role={selectedRole}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedRole(null);
          }}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            setIsRoleModalOpen(true);
          }}
          onRefresh={fetchData}
        />
      )}

      {isMatrixModalOpen && selectedRole && (
        <PermissionMatrixModal
          role={selectedRole}
          permissions={permissions}
          onClose={() => {
            setIsMatrixModalOpen(false);
            setSelectedRole(null);
          }}
          onSuccess={() => {
            setIsMatrixModalOpen(false);
            setSelectedRole(null);
            fetchData();
          }}
        />
      )}

      {isAssignUserModalOpen && selectedRole && (
        <AssignUserRoleModal
          role={selectedRole}
          onClose={() => {
            setIsAssignUserModalOpen(false);
            setSelectedRole(null);
          }}
          onSuccess={() => {
            setIsAssignUserModalOpen(false);
            setSelectedRole(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default Permissions;
