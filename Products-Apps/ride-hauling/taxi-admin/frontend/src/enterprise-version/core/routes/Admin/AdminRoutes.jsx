
import { Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, lazy } from "react";
import RouteLoader from "./RouteLoader";

// Lazy load pages
const Dashboard = lazy(() => import("../../../views/Admin/Dashboard/Dashboard"));
const ManageUsers = lazy(() => import("../../../views/Admin/Users/ManageUsers"));
const ManageDrivers = lazy(() => import("../../../views/Admin/Drivers/ManageDrivers"));
const ManageAdmins = lazy(() => import("../../../views/Admin/Admins/ManageAdmins"));
const ManageCars = lazy(() => import("../../../views/Admin/Fleet/ManageCars"));
const ManageInspection = lazy(() => import("../../../views/Admin/Fleet/ManageInspection"));
const ManageBookings = lazy(() => import("../../../views/Admin/Bookings/ManageBookings"));
const ManageSOS = lazy(() => import("../../../views/Admin/SOS/ManageSOS"));
const ManageTickets = lazy(() => import("../../../views/Admin/Tickets/ManageTickets"));
const ManageFaqs = lazy(() => import("../../../views/Admin/Faq/ManageFaqs"));
const ManageSettings = lazy(() => import("../../../views/Admin/Settings/ManageSettings"));
const WalletHistory = lazy(() => import("../../../views/Admin/Wallet/WalletHistory"));
const ManagePlans = lazy(() => import("../../../views/Admin/Plans/ManagePlans"));
const ManagePrivileges = lazy(() => import("../../../views/Admin/Privileges/ManagePrivileges"));
const ManagePartners = lazy(() => import("../../../views/Admin/Partners/ManagePartners"));
const ManageEarnings = lazy(() => import("../../../views/Admin/Earnings/ManageEarnings"));
const Trips = lazy(() => import("../../../views/Admin/Bookings/Trips"));
const WalletHistoryAdmin = lazy(() => import("../../../views/Admin/Wallet/WalletHistoryAdmin"));
const Payments = lazy(() => import("../../../views/Admin/PaymentModule/users/Payments"));
const AuditLogs = lazy(() => import("../../../views/Admin/AuditLogs/AuditLogs"));
const ActivityLogger = lazy(() => import("../../../views/Admin/ActivityLogger/ActivityLogger"));
const Notifications = lazy(() => import("../../../views/Admin/Notifications/notifications"));
const PlanPackage = lazy(() => import("../../../views/Admin/PlanPackage/Plan/PlanPackage"));

// Flight Management
const ManageFlights = lazy(() => import("../../../views/Admin/FlightMgt/FlightMgt"));
const ManageFlightBookings = lazy(() => import("../../../views/Admin/FlightMgt/BookingMgt"));

// Admin Detail
const AdminUserDetail = lazy(() => import("../../../views/Admin/AdminMgt/userDetail/UserDetail"));
import AuthGuard from '../AuthGuard';
import AdminLayout from '../../../core/components/AdminLayout';

// Auth Views
import Home from '../../../views/Admin/Home/Home';

// Resource Management Views


/**
 * AdminRoutes — taxi-admin
 * Upgraded to React Router v6.
 * Implements AuthGuard for the entire admin dashboard area.
 */
const AdminRoutes = () => {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Home />} />

        {/* Protected Admin Area */}
        <Route element={<AuthGuard />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* User Management */}
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/manage-drivers" element={<ManageDrivers />} />
            <Route path="/manage-admins" element={<ManageAdmins />} />

            {/* Fleet & Logistics */}
            <Route path="/manage-cars" element={<ManageCars />} />
            <Route path="/manage-inspections" element={<ManageInspection />} />
            <Route path="/manage-bookings" element={<ManageBookings />} />
            <Route path="/manage-trips" element={<Trips />} />
            <Route path="/manage-flights" element={<ManageFlights />} />
            <Route path="/manage-flight-bookings" element={<ManageFlightBookings />} />

            {/* Support & Safety */}
            <Route path="/manage-sos" element={<ManageSOS />} />
            <Route path="/manage-tickets" element={<ManageTickets />} />
            <Route path="/manage-faqs" element={<ManageFaqs />} />

            {/* Finance & Payments */}
            <Route path="/wallet-history" element={<WalletHistory />} />
            <Route path="/payment-history" element={<WalletHistoryAdmin />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/manage-plans" element={<ManagePlans />} />
            <Route path="/plan-packages" element={<PlanPackage />} />
            <Route path="/manage-partners" element={<ManagePartners />} />
            <Route path="/manage-earnings" element={<ManageEarnings />} />

            {/* Access Control */}
            <Route path="/manage-privileges" element={<ManagePrivileges />} />

            {/* Compliance & Activity */}
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/activity-logs" element={<ActivityLogger />} />

            {/* Platform Comms */}
            <Route path="/notifications" element={<Notifications />} />

            {/* Settings */}
            <Route path="/settings" element={<ManageSettings />} />
            <Route path="/settings/:section" element={<ManageSettings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
