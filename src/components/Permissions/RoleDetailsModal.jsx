// Add this import at the top
import { useNavigate } from 'react-router-dom';

// Inside the component
const navigate = useNavigate();

// Replace the "Manage Permissions" section in RoleDetailsModal with:
<div className="bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-5">
  <div className="flex items-start gap-3">
    <div className="h-10 w-10 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-bold text-secondary-700 mb-1">Role Permissions</h4>
      <p className="text-xs text-gray-600 mb-3">
        Configure specific permissions for this role to control access to different features and resources.
      </p>
      <button 
        onClick={() => navigate(`/roles/${role.role_id}/permissions`)}
        className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-xs font-medium"
      >
        Manage Permissions
      </button>
    </div>
  </div>
</div>
