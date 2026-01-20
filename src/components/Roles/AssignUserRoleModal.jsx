import React, { useState, useEffect } from 'react';
import { FiUsers, FiPlus, FiTrash2, FiCheckCircle, FiSearch } from 'react-icons/fi';
import { IoPersonOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';
import { permissionAPI } from '../../services/permissionAPI';
import { userAPI } from '../../services/userAPI';

const AssignUserRoleModal = ({ role, onClose, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      // Fetch all users
      const usersResponse = await userAPI.getAllUsers({ pageSize: 1000 });
      const usersData = usersResponse.data || usersResponse || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
      
      // Fetch users with this role (mock - implement based on your API)
      // For now, we'll use user_count from role
      setAssignedUsers([]);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUserId) {
      alert('Please select a user');
      return;
    }

    setLoading(true);
    try {
      await permissionAPI.assignRoleToUser(selectedUserId, role.role_id);
      
      const user = users.find(u => u.user_id === parseInt(selectedUserId));
      if (user) {
        setAssignedUsers([...assignedUsers, user]);
      }
      setSelectedUserId('');
      alert('✅ User assigned to role successfully');
    } catch (err) {
      console.error('Assign user error:', err);
      alert(`❌ ${err.message || 'Failed to assign user'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId, userName) => {
    if (window.confirm(`Remove "${userName}" from this role?`)) {
      try {
        await permissionAPI.removeRoleFromUser(userId, role.role_id);
        setAssignedUsers(assignedUsers.filter(u => u.user_id !== userId));
        alert('✅ User removed from role successfully');
      } catch (err) {
        console.error('Remove user error:', err);
        alert(`❌ ${err.message || 'Failed to remove user'}`);
      }
    }
  };

  const availableUsers = users.filter(
    user => !assignedUsers.some(au => au.user_id === user.user_id)
  );

  const filteredAssignedUsers = assignedUsers.filter(user => {
    if (!searchTerm) return true;
    const name = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

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
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FiUsers className="text-2xl text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary-700">Assign Users to Role</h3>
              <p className="text-sm text-gray-500">{role.role_name}</p>
            </div>
          </div>

          {/* Assign New User */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">Assign New User</h4>
            <div className="flex gap-3">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={loadingUsers}
                className="flex-1 px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm bg-white disabled:bg-gray-100"
              >
                <option value="">Select a user...</option>
                {availableUsers.map(user => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignUser}
                disabled={!selectedUserId || loading}
                className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlus />
                Assign
              </button>
            </div>
            {availableUsers.length === 0 && !loadingUsers && (
              <p className="text-xs text-blue-700 mt-2">
                All users are already assigned to this role
              </p>
            )}
          </div>

          {/* Role Info */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6 border border-purple-200">
            <div className="flex items-center gap-3">
              <IoShieldCheckmarkOutline className="text-2xl text-purple-600" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{role.role_name}</p>
                <p className="text-sm text-gray-600">
                  {role.permission_count || 0} permissions • {role.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Assigned Users</p>
                <p className="text-2xl font-bold text-purple-600">{assignedUsers.length}</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          {assignedUsers.length > 0 && (
            <div className="mb-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assigned users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                />
              </div>
            </div>
          )}

          {/* Assigned Users List */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiCheckCircle className="text-green-600" />
              Assigned Users ({filteredAssignedUsers.length})
            </h4>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="text-gray-500 ml-3">Loading users...</p>
              </div>
            ) : filteredAssignedUsers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <IoPersonOutline className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No users assigned</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm ? 'No users match your search' : 'Select a user above to assign them to this role'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAssignedUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center">
                        <IoPersonOutline className="text-white text-xl" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.is_active && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Active
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveUser(user.user_id, `${user.first_name} ${user.last_name}`)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Remove user"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                onSuccess();
              }}
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignUserRoleModal;
