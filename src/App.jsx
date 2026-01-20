import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Projects from './pages/Projects';
import Team from './pages/Team';
import TeamTree from './pages/TeamTree';
import Documents from './pages/Documents';
import UserManagement from './pages/UserModal/UserManagement';
import Organizations from './pages/Organizations/Organizations';
import Sites from './pages/Sites/Sites';
import Departments from './pages/Departments/Departments';
import Designations from './pages/Designations/Designations';
import Roles from './pages/Roles/Roles';
import RolePermissions from './pages/Roles/RolePermissions';
import Employees from './pages/Employees/Employees';
import Shifts from './pages/Shifts/Shifts';
import Locations from './pages/Locations/Locations';
import Attendance from './pages/Attendance/Attendance';
import Leaves from './pages/Leaves/Leaves';
import Salary from './pages/Salary/Salary';
import Payroll from './pages/Payroll/Payroll';
import LoRaWANProfiles from './pages/LoRaWAN/LoRaWANProfiles';
import LoRaWANGateways from './pages/LoRaWAN/LoRaWANGateways';
import Devices from './pages/Device/Devices';
import DeviceData from './pages/Device/DeviceData';
import Applications from './pages/Device/Applications';
import Geofences from './pages/Geofences/Geofences';
import Permissions from './pages/Permissions/Permissions';
import RoleList from './components/Roles/RoleList';
import RoleForm from './components/Roles/RoleForm';
import PermissionAssignment from './components/Roles/PermissionAssignment';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Layout Wrapper for Protected Routes
const ProtectedLayout = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  );
};

// 404 Not Found Component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
      <p className="text-slate-600 mb-6">Page not found</p>
      <a 
        href="/dashboard" 
        className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
      >
        Go to Dashboard
      </a>
    </div>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Routes with Layout */}
      <Route element={<ProtectedLayout />}>
        {/* Main Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Organization Routes */}
        <Route path="/organization" element={<Organizations />} />
        <Route path="/organization/sites" element={<Sites />} />
        <Route path="/organization/departments" element={<Departments />} />
        <Route path="/organization/designations" element={<Designations />} />
        
        {/* Legacy organization routes (for backward compatibility) */}
        <Route path="/site" element={<Sites />} />
        <Route path="/department" element={<Departments />} />
        <Route path="/designations" element={<Designations />} />

        {/* HR Routes */}
        <Route path="/hr/employees" element={<Employees />} />
        <Route path="/hr/roles" element={<Roles />} />
        <Route path="/hr/roles/:roleId/permissions" element={<RolePermissions />} />
        <Route path="/hr/permissions" element={<Permissions />} />

        <Route path="/hr/attendance" element={<Attendance />} />
        <Route path="/hr/leaves" element={<Leaves />} />
        <Route path="/hr/salary" element={<Salary />} />
        <Route path="/hr/payroll" element={<Payroll />} />
        
        {/* Legacy HR routes (for backward compatibility) */}
        <Route path="/employees" element={<Employees />} />
        {/* <Route path="/roles" element={<Roles />} /> */}
        {/* <Route path="/roles/:roleId/permissions" element={<RolePermissions />} /> */}
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leaves" element={<Leaves />} />
        <Route path="/salary" element={<Salary />} />
        <Route path="/payroll" element={<Payroll />} />




        <Route path="/roles" element={<RoleList />} />
        <Route path="/roles/create" element={<RoleForm />} />
        <Route path="/roles/edit/:roleId" element={<RoleForm />} />
        <Route path="/roles/:roleId/permissions" element={<PermissionAssignment />} />



        {/* Workforce Routes */}
        <Route path="/workforce/shifts" element={<Shifts />} />
        <Route path="/workforce/locations" element={<Locations />} />
        
        {/* Legacy workforce routes */}
        <Route path="/shifts" element={<Shifts />} />
        <Route path="/locations" element={<Locations />} />

        {/* IoT Management Routes */}
        <Route path="/iot/lorawan-profiles" element={<LoRaWANProfiles />} />
        <Route path="/iot/lorawan-gateways" element={<LoRaWANGateways />} />
        <Route path="/iot/devices" element={<Devices />} />
        <Route path="/iot/device-data" element={<DeviceData />} />
        <Route path="/iot/applications" element={<Applications />} />
        <Route path="/iot/geofences" element={<Geofences />} />
        
        {/* Legacy IoT routes */}
        <Route path="/loRaWANProfiles" element={<LoRaWANProfiles />} />
        <Route path="/loRaWANGateways" element={<LoRaWANGateways />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/deviceData" element={<DeviceData />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/geofences" element={<Geofences />} />

        {/* Other Routes */}
        <Route path="/projects" element={<Projects />} />
        <Route path="/team-tree" element={<TeamTree />} />
        <Route path="/team" element={<Team />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/usermanagement" element={<UserManagement />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
