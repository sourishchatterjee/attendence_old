

// //import { roleAPI } from '../../services/roleAPI';

// export const UserTypePermissions = {
//   SuperAdmin: [
//     '/dashboard',
//     '/hr/roles',
//     '/hr/roles/',           // Covers /hr/roles/:roleId
//     '/hr/employees',
//     '/hr/attendance',
//     '/hr/leaves',
//     '/hr/salary',
//     '/hr/payroll',
//     '/iot/devices',
//     '/iot/lorawan-profiles',
//     '/iot/lorawan-gateways',
//     '/iot/device-data',
//     '/iot/applications',
//     '/iot/geofences',
//     '/organization',
//     '/organization/sites',
//     '/organization/departments',
//     '/organization/designations',
//     '/workforce/shifts',
//     '/workforce/locations'
//     // Add ALL your routes here
//   ],
//   HR_ADMIN: [
//     '/dashboard',
//     '/hr/roles',
//     '/hr/roles/',           // Covers sub-routes
//     '/hr/employees',
//     '/hr/attendance',
//     '/hr/leaves',
//     '/hr/salary'
//   ],
//   MANAGER: [
//     '/dashboard',
//     '/hr/employees',
//     '/hr/attendance',
//     '/hr/leaves'
//   ],
//   EMPLOYEE: [
//     '/dashboard'
//   ]
// };

// // 🔥 FIXED matcher - handles params & sub-routes PERFECTLY
// export const canAccessRoute = (pathname, userType) => {
//   if (!userType || !pathname) return false;
  
//   const allowedPaths = UserTypePermissions[userType] || [];
  
//   return allowedPaths.some(allowedPath => {
//     // Case 1: Exact match
//     if (pathname === allowedPath) return true;
    
//     // Case 2: Path is prefix (covers sub-routes)
//     if (pathname.startsWith(allowedPath)) return true;
    
//     return false;
//   });
// };










export const UserTypePermissions = {
  SuperAdmin: [
    // Dashboard
    '/dashboard',
    
    // Organization (all)
    '/organization',
    '/organization/sites',
    '/organization/departments', 
    '/organization/designations',
    
    // HR (all)
    '/hr/employees',
    '/hr/roles',
    '/hr/roles/',           // Covers /hr/roles/:roleId/permissions
    '/hr/permissions',
    '/hr/attendance',
    '/hr/leaves',
    '/hr/salary',
    '/hr/payroll',
    
    // Workforce (all)
    '/workforce/shifts',
    '/workforce/locations',
    '/workforce/grouplocationsettings',
    
    // IoT (all)
    '/iot/lorawan-profiles',
    '/iot/lorawan-gateways', 
    '/iot/devices',
    '/iot/device-data',
    '/iot/applications',
    '/iot/geofences',
    
    // Role management
    '/roles',
    '/roles/',
    
    // Other
    '/projects',
    '/team-tree',
    '/team',
    '/calendar',
    '/documents',
    '/usermanagement',
    
    // Legacy routes
    '/site', '/department', '/designations',
    '/employees', '/attendance', '/leaves', '/salary', '/payroll',
    '/shifts', '/locations',
    '/loRaWANProfiles', '/loRaWANGateways', '/devices', '/deviceData', '/applications', '/geofences'
  ],
  
  HR_ADMIN: [
    // Dashboard
    '/dashboard',
    
    // HR (limited)
    '/hr/employees',
    '/hr/roles',
    '/hr/roles/',           // Role permissions
    '/hr/attendance',
    '/hr/leaves',
    '/hr/salary',
    
    // Legacy HR
    '/employees', '/attendance', '/leaves', '/salary', '/payroll'
  ],
  
  MANAGER: [
    // Dashboard
    '/dashboard',
    
    // View-only HR
    '/hr/employees',
    '/hr/attendance',
    '/hr/leaves',
    
    // Legacy
    '/employees', '/attendance', '/leaves'
  ],
  
  Employee: [
    // Dashboard
    '/dashboard',
    
    // Organization (all)
    '/organization',
    '/organization/sites',
    '/organization/departments', 
    '/organization/designations',
    
    // HR (all)
    '/hr/employees',
    '/hr/roles',
    '/hr/roles/',           // Covers /hr/roles/:roleId/permissions
    '/hr/permissions',
    '/hr/attendance',
    '/hr/leaves',
    '/hr/salary',
    '/hr/payroll', 
    
    // Workforce (all)
    '/workforce/shifts',
    '/workforce/locations',
    '/workforce/grouplocationsettings',
    
    // IoT (all)
    '/iot/lorawan-profiles',
    '/iot/lorawan-gateways', 
    '/iot/devices',
    '/iot/device-data',
    '/iot/applications',
    '/iot/geofences',
    
    // Role management
    '/roles',
    '/roles/',
    
    // Other
    '/projects',
    '/team-tree',
    '/team',
    '/calendar',
    '/documents',
    '/usermanagement',
    
    // Legacy routes
    '/site', '/department', '/designations',
    '/employees', '/attendance', '/leaves', '/salary', '/payroll',
    '/shifts', '/locations',
    '/loRaWANProfiles', '/loRaWANGateways', '/devices', '/deviceData', '/applications', '/geofences'
  ]
};

// 🔥 PERFECT matcher for all your routes
export const canAccessRoute = (pathname, userType) => {
  if (!userType || !pathname) return false;
  
  const allowedPaths = UserTypePermissions[userType] || [];
  
  return allowedPaths.some(allowedPath => {
    // Exact match
    if (pathname === allowedPath) return true;
    
    // Prefix match (covers sub-routes like /hr/roles/123)
    if (pathname.startsWith(allowedPath)) return true;
    
    return false;
  });
};
