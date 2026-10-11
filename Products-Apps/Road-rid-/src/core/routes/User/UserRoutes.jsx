import React, { Suspense, lazy } from "react";

import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '../AuthGuard';

// Views
const Dashboard = lazy(() => import("../../../views/User/Dashboard/Dashboard"));
const Home = lazy(() => import("../../../views/User/Home/Home"));
const Register = lazy(() => import("../../../views/User/Register/Register"));
const Login = lazy(() => import("../../../views/User/Login/Login"));
const ForgotPassword = lazy(() => import("../../../views/User/ForgotPassword/ForgotPassword"));
const OTPVerification = lazy(() => import("../../../views/User/OTPVerification/OTPVerification"));
const ResetPassword = lazy(() => import("../../../views/User/ResetPassword/ResetPassword"));
const Profile = lazy(() => import("../../../views/User/Profile/Profile"));
const BookingFlow = lazy(() => import("../../../views/User/Plan/Plan"));
const PreferenceWizard = lazy(() => import("../../../views/User/PreferenceWizard"));
const PaymentHistory = lazy(() => import("../../../views/User/Wallet/WalletHistory"));
const RideHistory = lazy(() => import("../../../views/User/History/RideHistory"));
const Notifications = lazy(() => import("../../../views/User/Notifications/notifications"));
const CheckOut = lazy(() => import("../../../views/User/CheckOut/CheckOut"));
const SOS = lazy(() => import("../../../views/User/SOS/SOS"));
const VoucherRedeem = lazy(() => import("../../../views/User/Voucher/VoucherRedeem"));
const VoucherWallet = lazy(() => import("../../../views/User/Voucher/VoucherWallet"));
const RewardsDashboard = lazy(() => import("../../../views/User/Rewards/RewardsDashboard"));
const ShippingLanding = lazy(() => import("../../../views/User/Shipping/ShippingLanding"));
const ShippingSearchHome = lazy(() => import("../../../views/User/Shipping/ShippingSearchHome"));
const ShippingTracking = lazy(() => import("../../../views/User/Shipping/ShippingTracking"));
const ShippingHistory = lazy(() => import("../../../views/User/Shipping/ShippingHistory"));

// Flight Bookings
const FlightSearch = lazy(() => import("../../../views/User/flightBookings/FlightSearchHome"));
const FlightResults = lazy(() => import("../../../views/User/flightBookings/FlightResults"));
const FlightDetail = lazy(() => import("../../../views/User/flightBookings/FlightDetail"));
const FlightMapWizard = lazy(() => import("../../../views/User/flightBookings/FlightMapWizard"));
const FlightCheckout = lazy(() => import("../../../views/User/flightBookings/FlightCheckout"));

// Support / Powered Pages
const AboutUs = lazy(() => import("../../../views/User/Support/AboutUs"));
const TermsOfService = lazy(() => import("../../../views/User/Support/TermsOfService"));
const PrivacyPolicy = lazy(() => import("../../../views/User/Support/PrivacyPolicy"));




import RouteLoader from "./RouteLoader";

/**
 * UserRoutes — taxibooking-userapp
 * Upgraded to React Router v6.
 */
const UserRoutes = () => {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/flights" element={<FlightSearch />} />
        <Route path="/flights/results" element={<FlightResults />} />
        <Route path="/flights/detail/:id" element={<FlightDetail />} />
        <Route path="/flights/explore" element={<FlightMapWizard />} />
        <Route path="/shipping" element={<ShippingLanding />} />
        <Route path="/shipping/new" element={<ShippingSearchHome />} />
        <Route path="/shipping/track/:trackingNumber" element={<ShippingTracking />} />
        <Route path="/shipping/history" element={<ShippingHistory />} />

        {/* Protected Routes */}
        <Route element={<AuthGuard />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/preferences" element={<PreferenceWizard />} />
          <Route path="/book-ride" element={<BookingFlow />} />
          <Route path="/plan" element={<BookingFlow />} />
          <Route path="/checkout" element={<CheckOut />} />
          <Route path="/redeem/:hash" element={<VoucherRedeem />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/ride-history" element={<RideHistory />} />
          <Route path="/vouchers" element={<VoucherWallet />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/sos" element={<SOS />} />
          <Route path="/rewards" element={<RewardsDashboard />} />

          {/* Flight Bookings */}

          <Route path="/flights/checkout" element={<FlightCheckout />} />

          {/* Support / Powered Pages */}
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Route>


        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default UserRoutes;
