// import React, { useState, useEffect } from 'react';
// import { 
//   FiShield, 
//   FiAlertCircle,
//   FiCheckCircle,
//   FiKey
// } from 'react-icons/fi';
// import { 
//   IoShieldCheckmarkOutline
// } from 'react-icons/io5';
// import { permissionAPI } from '../../services/permissionAPI';
// import { organizationAPI } from '../../services/organizationAPI';

// const RoleModal = ({ role, onClose, onSuccess }) => {
//   const [organizations, setOrganizations] = useState([]);
//   const [formData, setFormData] = useState({
//     organization_id: '',
//     role_name: '',
//     role_key: '',
//     role_description: '',
//     is_active: true,
//   });
//   const [loading, setLoading] = useState(false);
//   const [loadingOrgs, setLoadingOrgs] = useState(true);
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     fetchOrganizations();
//   }, []);

//   useEffect(() => {
//     if (role) {
//       setFormData({
//         organization_id: role.organization_id || '',
//         role_name: role.role_name || '',
//         role_key: role.role_key || '',
//         role_description: role.role_description || '',
//         is_active: role.is_active !== undefined ? role.is_active : true,
//       });
//     }
//   }, [role]);

//   const fetchOrganizations = async () => {
//     try {
//       setLoadingOrgs(true);
//       const response = await organizationAPI.getAllOrganizations({ pageSize: 100 });
//       setOrganizations(response.data || []);
//     } catch (err) {
//       console.error('Error fetching organizations:', err);
//     } finally {
//       setLoadingOrgs(false);
//     }
//   };

//   const generateRoleKey = (roleName) => {
//     return roleName
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '_')
//       .replace(/^_+|_+$/g, '');
//   };

//   const handleRoleNameChange = (e) => {
//     const name = e.target.value;
//     setFormData({
//       ...formData,
//       role_name: name,
//       role_key: generateRoleKey(name),
//     });

//     if (errors.role_name) {
//       setErrors({ ...errors, role_name: '' });
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.organization_id) {
//       newErrors.organization_id = 'Organization is required';
//     }
//     if (!formData.role_name || formData.role_name.trim() === '') {
//       newErrors.role_name = 'Role name is required';
//     } else if (formData.role_name.trim().length < 3) {
//       newErrors.role_name = 'Role name must be at least 3 characters';
//     }
//     if (!formData.role_key || formData.role_key.trim() === '') {
//       newErrors.role_key = 'Role key is required';
//     } else if (!/^[a-z0-9_]+$/.test(formData.role_key)) {
//       newErrors.role_key = 'Role key can only contain lowercase letters, numbers, and underscores';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);

//     try {
//       const submitData = {
//         organization_id: parseInt(formData.organization_id, 10),
//         role_name: formData.role_name.trim(),
//         role_key: formData.role_key.trim().toLowerCase(),
//         role_description: formData.role_description.trim() || null,
//         is_active: formData.is_active,
//       };

//       if (role) {
//         await permissionAPI.updateRole(role.role_id, submitData);
//         alert('✅ Role updated successfully');
//       } else {
//         await permissionAPI.createRole(submitData);
//         alert('✅ Role created successfully');
//       }

//       onSuccess();
//     } catch (error) {
//       console.error('Submit error:', error);
//       if (error.errors && Array.isArray(error.errors)) {
//         const errorMessages = error.errors.map(e => e.message).join('\n');
//         alert(`❌ Validation Error:\n${errorMessages}`);
//       } else {
//         alert(`❌ ${error.message || 'Failed to save role'}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value,
//     });

//     if (errors[name]) {
//       setErrors({ ...errors, [name]: '' });
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
//         {/* Backdrop */}
//         <div
//           className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
//           onClick={onClose}
//         ></div>

//         {/* Modal */}
//         <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
//           <div className="absolute top-4 right-4 z-10">
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600 transition"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           {/* Header */}
//           <div className="flex items-center gap-3 mb-6">
//             <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
//               <IoShieldCheckmarkOutline className="text-2xl text-primary-600" />
//             </div>
//             <h3 className="text-xl font-bold text-secondary-700">
//               {role ? 'Edit Role' : 'Create New Role'}
//             </h3>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {/* Organization */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                 Organization <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="organization_id"
//                 value={formData.organization_id}
//                 onChange={handleChange}
//                 disabled={!!role || loadingOrgs}
//                 className={`w-full px-3 py-2 border ${
//                   errors.organization_id ? 'border-red-500' : 'border-gray-300'
//                 } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:bg-gray-100`}
//               >
//                 <option value="">Select Organization</option>
//                 {organizations.map(org => (
//                   <option key={org.organization_id} value={org.organization_id}>
//                     {org.organization_name}
//                   </option>
//                 ))}
//               </select>
//               {errors.organization_id && (
//                 <p className="text-red-500 text-xs mt-1">{errors.organization_id}</p>
//               )}
//             </div>

//             {/* Role Name */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                 Role Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="role_name"
//                 value={formData.role_name}
//                 onChange={handleRoleNameChange}
//                 placeholder="e.g., Administrator, Manager, User"
//                 className={`w-full px-3 py-2 border ${
//                   errors.role_name ? 'border-red-500' : 'border-gray-300'
//                 } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
//               />
//               {errors.role_name && (
//                 <p className="text-red-500 text-xs mt-1">{errors.role_name}</p>
//               )}
//             </div>

//             {/* Role Key */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
//                 <FiKey className="text-gray-600" />
//                 Role Key <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="role_key"
//                 value={formData.role_key}
//                 onChange={handleChange}
//                 placeholder="e.g., administrator, manager, user"
//                 className={`w-full px-3 py-2 border ${
//                   errors.role_key ? 'border-red-500' : 'border-gray-300'
//                 } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm font-mono`}
//               />
//               {errors.role_key && (
//                 <p className="text-red-500 text-xs mt-1">{errors.role_key}</p>
//               )}
//               <p className="text-xs text-gray-500 mt-1">
//                 Unique identifier for the role (lowercase, numbers, underscores only). Auto-generated from role name.
//               </p>
//             </div>

//             {/* Description */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                 Description
//               </label>
//               <textarea
//                 name="role_description"
//                 value={formData.role_description}
//                 onChange={handleChange}
//                 rows={4}
//                 placeholder="Describe the purpose and responsibilities of this role..."
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
//               />
//             </div>

//             {/* Active Status */}
//             <div>
//               <label className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg cursor-pointer">
//                 <input
//                   type="checkbox"
//                   name="is_active"
//                   checked={formData.is_active}
//                   onChange={handleChange}
//                   className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
//                 />
//                 <div className="flex-1">
//                   <div className="font-semibold text-gray-900 flex items-center gap-2">
//                     <FiCheckCircle className="text-green-600" />
//                     Active Role
//                   </div>
//                   <div className="text-xs text-gray-600 mt-1">
//                     Enable this role to allow assignment to users
//                   </div>
//                 </div>
//               </label>
//             </div>

//             {/* Info Alert */}
//             <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
//               <div className="flex items-start gap-3">
//                 <FiAlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" />
//                 <div className="text-sm text-blue-800">
//                   <p className="font-semibold mb-1">Role Information</p>
//                   <ul className="list-disc list-inside space-y-1">
//                     <li>Role key must be unique within the organization</li>
//                     <li>After creating the role, you can assign specific permissions</li>
//                     <li>Users can be assigned multiple roles</li>
//                     <li>Inactive roles cannot be assigned to new users</li>
//                     <li>Deleting a role will remove it from all assigned users</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>

//             {/* Footer */}
//             <div className="flex gap-3 pt-6 border-t mt-6">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading || loadingOrgs}
//                 className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <FiShield />
//                     {role ? 'Update Role' : 'Create Role'}
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RoleModal;

















import React, { useState, useEffect } from 'react';
import { 
  FiShield, 
  FiAlertCircle,
  FiCheckCircle,
  FiKey
} from 'react-icons/fi';
import { 
  IoShieldCheckmarkOutline
} from 'react-icons/io5';
import { permissionAPI } from '../../services/permissionAPI';
import { organizationAPI } from '../../services/organizationAPI';
import { decodeJWT } from "../../utils/jwtHelper";

const RoleModal = ({ role, onClose, onSuccess }) => {
  const getOrganizationIdFromToken = () => {
    const token = localStorage.getItem("token");
    const payload = decodeJWT(token);
    return payload?.organizationId;
  };

  const [organizations, setOrganizations] = useState([]);
  const [formData, setFormData] = useState({
    organization_id: '',
    role_name: '',
    role_key: '',
    role_description: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [errors, setErrors] = useState({});
  const [hasOrgAccess, setHasOrgAccess] = useState(false);

  const orgId = Number(getOrganizationIdFromToken());

  useEffect(() => {
    if (orgId && !isNaN(orgId)) {
      setHasOrgAccess(true);
      fetchOrganizations();
      // Auto-populate organization for create mode
      if (!role) {
        setFormData(prev => ({ ...prev, organization_id: orgId.toString() }));
      }
    } else {
      setHasOrgAccess(false);
    }
  }, [orgId, role]);

  useEffect(() => {
    if (role) {
      setFormData({
        organization_id: role.organization_id || orgId.toString(),
        role_name: role.role_name || '',
        role_key: role.role_key || '',
        role_description: role.role_description || '',
        is_active: role.is_active !== undefined ? role.is_active : true,
      });
    }
  }, [role, orgId]);

  const fetchOrganizations = async () => {
    try {
      setLoadingOrgs(true);
      if (!orgId || isNaN(orgId)) {
        setOrganizations([]);
      } else {
        const response = await organizationAPI.getOrganizationById(orgId);
        setOrganizations(response.data ? [response.data] : []);
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setOrganizations([]);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const generateRoleKey = (roleName) => {
    return roleName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const handleRoleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      role_name: name,
      role_key: generateRoleKey(name),
    });

    if (errors.role_name) {
      setErrors({ ...errors, role_name: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }
    if (!formData.role_name || formData.role_name.trim() === '') {
      newErrors.role_name = 'Role name is required';
    } else if (formData.role_name.trim().length < 3) {
      newErrors.role_name = 'Role name must be at least 3 characters';
    }
    if (!formData.role_key || formData.role_key.trim() === '') {
      newErrors.role_key = 'Role key is required';
    } else if (!/^[a-z0-9_]+$/.test(formData.role_key)) {
      newErrors.role_key = 'Role key can only contain lowercase letters, numbers, and underscores';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!hasOrgAccess) {
      alert('❌ No organization access available');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        organization_id: parseInt(formData.organization_id, 10),
        role_name: formData.role_name.trim(),
        role_key: formData.role_key.trim().toLowerCase(),
        role_description: formData.role_description.trim() || null,
        is_active: formData.is_active,
      };

      if (role) {
        await permissionAPI.updateRole(role.role_id, submitData);
        alert('✅ Role updated successfully');
      } else {
        await permissionAPI.createRole(submitData);
        alert('✅ Role created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to save role'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  if (!hasOrgAccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md mx-4 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <FiAlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Organization Access</h3>
          <p className="text-gray-600 mb-6">
            You don't have access to any organization. Please contact your administrator.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
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
            <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <IoShieldCheckmarkOutline className="text-2xl text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-secondary-700">
              {role ? 'Edit Role' : 'Create New Role'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Organization - Now shows only user's organization or pre-filled for edit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Organization <span className="text-red-500">*</span>
              </label>
              <select
                name="organization_id"
                value={formData.organization_id}
                onChange={handleChange}
                disabled={!!role || loadingOrgs || organizations.length === 0}
                className={`w-full px-3 py-2 border ${
                  errors.organization_id ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:bg-gray-100 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {loadingOrgs ? 'Loading...' : organizations.length === 0 ? 'No Organization' : 'Select Organization'}
                </option>
                {organizations.map(org => (
                  <option key={org.organization_id} value={org.organization_id}>
                    {org.organization_name}
                  </option>
                ))}
              </select>
              {errors.organization_id && (
                <p className="text-red-500 text-xs mt-1">{errors.organization_id}</p>
              )}
              {!role && organizations.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Your organization: {organizations[0]?.organization_name}
                </p>
              )}
            </div>

            {/* Role Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="role_name"
                value={formData.role_name}
                onChange={handleRoleNameChange}
                placeholder="e.g., Administrator, Manager, User"
                className={`w-full px-3 py-2 border ${
                  errors.role_name ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
              />
              {errors.role_name && (
                <p className="text-red-500 text-xs mt-1">{errors.role_name}</p>
              )}
            </div>

            {/* Role Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <FiKey className="text-gray-600" />
                Role Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="role_key"
                value={formData.role_key}
                onChange={handleChange}
                placeholder="e.g., administrator, manager, user"
                className={`w-full px-3 py-2 border ${
                  errors.role_key ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm font-mono`}
              />
              {errors.role_key && (
                <p className="text-red-500 text-xs mt-1">{errors.role_key}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier for the role (lowercase, numbers, underscores only). Auto-generated from role name.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                name="role_description"
                value={formData.role_description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the purpose and responsibilities of this role..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
              />
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    <FiCheckCircle className="text-green-600" />
                    Active Role
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Enable this role to allow assignment to users
                  </div>
                </div>
              </label>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Role Information</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Role key must be unique within the organization</li>
                    <li>After creating the role, you can assign specific permissions</li>
                    <li>Users can be assigned multiple roles</li>
                    <li>Inactive roles cannot be assigned to new users</li>
                    <li>Deleting a role will remove it from all assigned users</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-6 border-t mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || loadingOrgs || !hasOrgAccess}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiShield />
                    {role ? 'Update Role' : 'Create Role'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleModal;
