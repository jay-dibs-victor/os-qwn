import React, { Suspense, lazy } from "react";

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthGuard from '../AuthGuard';



import ProtectedRoute from '../../components/ProtectedRoute.jsx';

import Home2 from '../../../views/Guests/Home.jsx';
import Dashboard2 from '../../../views/Guests/Dashboard.jsx';
import Business from '../../../views/Guests/Business.jsx';
import BusinessOnboarding from '../../../views/Guests/BusinessOnboarding.jsx';
import BusinessDashboard from '../../../views/Guests/BusinessDashboard.jsx';
import DashboardSubPage from '../../../views/Guests/DashboardSubPage.jsx';
import Marketplace from '../../../views/Guests/Marketplace.jsx';
import Ride from '../../../views/Guests/Ride.jsx';
import RideHistory2 from '../../../views/Guests/RideHistory.jsx';
import Reserve from '../../../views/Guests/Reserve.jsx';
import Courier from '../../../views/Guests/Courier.jsx';
import DrivePage from '../../../views/Guests/Drive.jsx';
import Eats from '../../../views/Guests/Eats.jsx';
import Freight from '../../../views/Guests/Freight.jsx';
import ContactSales from '../../../views/Guests/ContactSales.jsx';
import CarbonFootprint from '../../../views/Guests/resources/CarbonFootprint.jsx';
import EmployeeBenefits from '../../../views/Guests/resources/EmployeeBenefits.jsx';
import SustainabilityRoad from '../../../views/Guests/resources/SustainabilityRoad.jsx';
import NotFound2 from '../../../views/Guests/NotFound.jsx';
import Login2 from '../../../views/Guests/Login.jsx';
import Signup2 from '../../../views/Guests/Signup.jsx';
import About from '../../../views/Guests/About.jsx';
import HowItWorks from '../../../views/Guests/HowItWorks.jsx';
import Newsroom from '../../../views/Guests/Newsroom.jsx';
import Investors from '../../../views/Guests/Investors.jsx';
import Careers from '../../../views/Guests/Careers.jsx';
import Safety from '../../../views/Guests/Safety.jsx';
import AccountLayout from '../../../views/Guests/account/AccountLayout.jsx';
import AccountHome from '../../../views/Guests/account/AccountHome.jsx';
import AccountPersonalInfo from '../../../views/Guests/account/AccountPersonalInfo.jsx';
import AccountSecurity from '../../../views/Guests/account/AccountSecurity.jsx';
import AccountPrivacy from '../../../views/Guests/account/AccountPrivacy.jsx';
import Wallet from '../../../views/Guests/Wallet.jsx';
import Support from '../../../views/Guests/Support.jsx';



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

//Import Notifications from '../../../views/User/Notifications/notifications';
import ToastContainer from '../../components/ToastContainer';
import { useAuthStore } from "../../store/useAuthStore.js";

import RouteLoader from "./RouteLoader";

/**
 * UserRoutes — taxibooking-userapp
 * Upgraded to React Router v6.
 */
const UserRoutes = () => {

  const token = useAuthStore((s) => s.token);
  const isLoggedIn = !!token;
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Public Routes */}
        {/* <Route path="/" element={<Dashboard2 />} /> */}
        <Route path="/" element={isLoggedIn ?

          <Home /> : <Home2 />} />

        {/* <Route path="/login" element={<Login2 />} />
          <Route path="/signup" element={<Signup2 />} /> */}

        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/newsroom" element={<Newsroom />} />
        <Route path="/investors" element={<Investors />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/safety" element={<Safety />} />


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
          <Route path="/book-ride" element={<Ride />} />
          <Route path="/plan" element={<Ride />} />
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


        <Route path="/ride" element={<Ride />} />
        <Route path="/ride/history" element={<RideHistory2 />} />
        <Route path="/reserve" element={<Reserve />} />
        <Route path="/courier" element={<Courier />} />
        <Route path="/drive" element={<DrivePage />} />
        <Route path="/drive/wallet" element={<DrivePage />} />
        <Route path="/drive/activity" element={<DrivePage />} />
        <Route path="/drive/ratings" element={<DrivePage />} />
        <Route path="/drive/profile" element={<DrivePage />} />
        <Route path="/drive/earnings" element={<DrivePage />} />
        <Route path="/drive/help" element={<DrivePage />} />
        <Route path="/drive/settings" element={<DrivePage />} />
        <Route path="/eat" element={<Eats />} />
        <Route path="/freight" element={<Freight />} />
        <Route path="/business" element={<Business />} />
        <Route path="/business/onboarding" element={<BusinessOnboarding />} />
        <Route path="/business/dashboard" element={<BusinessDashboard />}>
          <Route index element={<DashboardSubPage title="Home" />} />
          <Route path="programs" element={<DashboardSubPage title="Your Programs" />} />
          <Route path="travel" element={<DashboardSubPage title="Travel Program" />} />
          <Route path="central" element={<DashboardSubPage title="Central" />} />
          <Route path="team" element={<DashboardSubPage title="Team" />} />
          <Route path="activity" element={<DashboardSubPage title="Activity" />} />
          <Route path="reports" element={<DashboardSubPage title="Reports & Insights" />} />
          <Route path="billing" element={<DashboardSubPage title="Billing" />} />
          <Route path="support" element={<DashboardSubPage title="Support Hub" />} />
          <Route path="settings" element={<DashboardSubPage title="Settings" />} />
          <Route path="security" element={<DashboardSubPage title="Security" />} />
          <Route path="marketplace" element={<Marketplace />} />
        </Route>
        <Route path="/contact-sales" element={<ContactSales />} />
        <Route path="/resources/carbon-footprint" element={<CarbonFootprint />} />
        <Route path="/resources/employee-benefits" element={<EmployeeBenefits />} />
        <Route path="/resources/sustainability-road" element={<SustainabilityRoad />} />







        <Route element={<AuthGuard />}>

          {/*authurized pages*/}



          {/* SOS Safety Hub */}
          <Route path="/sos" element={<SOS />} />

          {/* Vouchers & Rewards */}
          <Route path="/vouchers" element={<VoucherWallet />} />
          <Route path="/redeem/:hash" element={<VoucherRedeem />} />
          <Route path="/rewards" element={<RewardsDashboard />} />

          {/* User Preferences & Notifications */}
          <Route path="/preferences" element={<PreferenceWizard />} />
          <Route path="/notifications" element={<Notifications />} />


          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<AccountHome />} />
            <Route path="personal-info" element={<AccountPersonalInfo />} />
            <Route path="security" element={<AccountSecurity />} />
            <Route path="privacy" element={<AccountPrivacy />} />
          </Route>
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/help" element={<Support />} />

        </Route>








        <Route path="*" element={<NotFound2 />} />




        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default UserRoutes;
