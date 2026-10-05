import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import OfficerLayout from './layouts/OfficerLayout';

// User & Public Pages
import Home from './pages/user/Home';
import About from './pages/user/About';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import ForgotPassword from './pages/user/ForgotPassword';
import UserDashboard from './pages/user/UserDashboard';
import RegisterVehicle from './pages/user/RegisterVehicle';
import PassDetails from './pages/user/PassDetails';
import UserActivity from './pages/user/UserActivity';
import UserProfile from './pages/user/UserProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingApprovals from './pages/admin/PendingApprovals';
import VehicleManagement from './pages/admin/VehicleManagement';
import UserManagement from './pages/admin/UserManagement';
import GateManagement from './pages/admin/GateManagement';
import OfficerManagement from './pages/admin/OfficerManagement';
import ScanLogs from './pages/admin/ScanLogs';
import AuditLogs from './pages/admin/AuditLogs';
import ReportsAnalytics from './pages/admin/ReportsAnalytics';

// Officer Scanner Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerScanner from './pages/officer/OfficerScanner';
import OfficerShiftLogs from './pages/officer/OfficerShiftLogs';
import OfficerProfile from './pages/officer/OfficerProfile';

// Route Guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If admin tried to access user dashboard or vice versa, redirect gracefully
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'GATE_OFFICER') return <Navigate to="/scanner" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* User & Public Route Group */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="vehicles/register"
              element={
                <ProtectedRoute>
                  <RegisterVehicle />
                </ProtectedRoute>
              }
            />
            <Route
              path="pass/:id"
              element={
                <ProtectedRoute>
                  <PassDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="activity"
              element={
                <ProtectedRoute>
                  <UserActivity />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Management Route Group */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="approvals" element={<PendingApprovals />} />
            <Route path="vehicles" element={<VehicleManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="gates" element={<GateManagement />} />
            <Route path="officers" element={<OfficerManagement />} />
            <Route path="logs" element={<ScanLogs />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="reports" element={<ReportsAnalytics />} />
          </Route>

          {/* Gate Officer Mobile Scanner Route Group */}
          <Route
            path="/scanner"
            element={
              <ProtectedRoute allowedRoles={['GATE_OFFICER', 'ADMIN']}>
                <OfficerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OfficerDashboard />} />
            <Route path="scan" element={<OfficerScanner />} />
            <Route path="history" element={<OfficerShiftLogs />} />
            <Route path="profile" element={<OfficerProfile />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
export default App;
