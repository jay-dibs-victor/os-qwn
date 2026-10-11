import { Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Home from './routes/Home.jsx';
import Dashboard from './routes/Dashboard.jsx';
import Business from './routes/Business.jsx';
import BusinessOnboarding from './routes/BusinessOnboarding.jsx';
import BusinessDashboard from './routes/BusinessDashboard.jsx';
import DashboardSubPage from './routes/DashboardSubPage.jsx';
import Marketplace from './routes/Marketplace.jsx';
import Ride from './routes/Ride.jsx';
import RideHistory from './routes/RideHistory.jsx';
import Reserve from './routes/Reserve.jsx';
import Courier from './routes/Courier.jsx';
import DrivePage from './routes/Drive.jsx';
import Eats from './routes/Eats.jsx';
import Freight from './routes/Freight.jsx';
import ContactSales from './routes/ContactSales.jsx';
import CarbonFootprint from './routes/resources/CarbonFootprint.jsx';
import EmployeeBenefits from './routes/resources/EmployeeBenefits.jsx';
import SustainabilityRoad from './routes/resources/SustainabilityRoad.jsx';
import NotFound from './routes/NotFound.jsx';
import Login from './routes/Login.jsx';
import Signup from './routes/Signup.jsx';
import About from './routes/About.jsx';
import HowItWorks from './routes/HowItWorks.jsx';
import Newsroom from './routes/Newsroom.jsx';
import Investors from './routes/Investors.jsx';
import Careers from './routes/Careers.jsx';
import Safety from './routes/Safety.jsx';
import AccountLayout from './routes/account/AccountLayout.jsx';
import AccountHome from './routes/account/AccountHome.jsx';
import AccountPersonalInfo from './routes/account/AccountPersonalInfo.jsx';
import AccountSecurity from './routes/account/AccountSecurity.jsx';
import AccountPrivacy from './routes/account/AccountPrivacy.jsx';
import Wallet from './routes/Wallet.jsx';
import Support from './routes/Support.jsx';

// Missing Views from user-frontend
import FlightSearch from './views/User/flightBookings/FlightSearchHome';
import FlightResults from './views/User/flightBookings/FlightResults';
import FlightDetail from './views/User/flightBookings/FlightDetail';
import FlightMapWizard from './views/User/flightBookings/FlightMapWizard';
import FlightCheckout from './views/User/flightBookings/FlightCheckout';
import ShippingLanding from './views/User/Shipping/ShippingLanding';
import ShippingSearchHome from './views/User/Shipping/ShippingSearchHome';
import ShippingTracking from './views/User/Shipping/ShippingTracking';
import ShippingHistory from './views/User/Shipping/ShippingHistory';
import SOS from './views/User/SOS/SOS';
import VoucherWallet from './views/User/Voucher/VoucherWallet';
import VoucherRedeem from './views/User/Voucher/VoucherRedeem';
import RewardsDashboard from './views/User/Rewards/RewardsDashboard';
import PreferenceWizard from './views/User/PreferenceWizard';
import Notifications from './views/User/Notifications/notifications';
import ToastContainer from './core/components/ToastContainer';

export default function App() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  return (
    <div className="app-shell">
      <NavBar />
      <main className={(location.pathname.startsWith('/ride') || location.pathname.startsWith('/drive')) ? "portal-content" : "page-content"}>
        <Routes>
          <Route path="/" element={isLoggedIn ? <Dashboard /> : <Home />} />
          <Route path="/ride" element={<ProtectedRoute><Ride /></ProtectedRoute>} />
          <Route path="/ride/history" element={<ProtectedRoute><RideHistory /></ProtectedRoute>} />
          <Route path="/reserve" element={<ProtectedRoute><Reserve /></ProtectedRoute>} />
          <Route path="/courier" element={<ProtectedRoute><Courier /></ProtectedRoute>} />
          <Route path="/drive" element={<ProtectedRoute><DrivePage /></ProtectedRoute>} />
          <Route path="/drive/wallet" element={<ProtectedRoute><DrivePage /></ProtectedRoute>} />
          <Route path="/drive/activity" element={<ProtectedRoute><DrivePage /></ProtectedRoute>} />
          <Route path="/drive/ratings" element={<ProtectedRoute><DrivePage /></ProtectedRoute>} />
          <Route path="/drive/profile" element={<ProtectedRoute><DrivePage /></ProtectedRoute>} />
          <Route path="/drive/earnings" element={<ProtectedRoute><DrivePage /></ProtectedRoute>} />
          <Route path="/drive/help" element={<ProtectedRoute><DrivePage /></ProtectedRoute>} />
          <Route path="/drive/settings" element={<ProtectedRoute><DrivePage /></ProtectedRoute>} />
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
          
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/newsroom" element={<Newsroom />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/safety" element={<Safety />} />

          <Route path="/account" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
            <Route index element={<AccountHome />} />
            <Route path="personal-info" element={<AccountPersonalInfo />} />
            <Route path="security" element={<AccountSecurity />} />
            <Route path="privacy" element={<AccountPrivacy />} />
          </Route>
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/help" element={<Support />} />

          {/* Flights */}
          <Route path="/flights" element={<FlightSearch />} />
          <Route path="/flights/results" element={<FlightResults />} />
          <Route path="/flights/detail/:id" element={<FlightDetail />} />
          <Route path="/flights/explore" element={<FlightMapWizard />} />
          <Route path="/flights/checkout" element={<ProtectedRoute><FlightCheckout /></ProtectedRoute>} />

          {/* Shipping / Logistics */}
          <Route path="/shipping" element={<ShippingLanding />} />
          <Route path="/shipping/new" element={<ShippingSearchHome />} />
          <Route path="/shipping/track/:trackingNumber" element={<ShippingTracking />} />
          <Route path="/shipping/history" element={<ProtectedRoute><ShippingHistory /></ProtectedRoute>} />

          {/* SOS Safety Hub */}
          <Route path="/sos" element={<ProtectedRoute><SOS /></ProtectedRoute>} />

          {/* Vouchers & Rewards */}
          <Route path="/vouchers" element={<ProtectedRoute><VoucherWallet /></ProtectedRoute>} />
          <Route path="/redeem/:hash" element={<ProtectedRoute><VoucherRedeem /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><RewardsDashboard /></ProtectedRoute>} />

          {/* User Preferences & Notifications */}
          <Route path="/preferences" element={<ProtectedRoute><PreferenceWizard /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
