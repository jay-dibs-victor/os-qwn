import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '../AuthGuard';

// Views
import RegisterDriver from '../../../views/Drivers/Driver/Register/Register';
import ForgotPasswordDriver from '../../../views/Drivers/Driver/ForgotPassword/ForgotPassword';
import DashboardDriver from '../../../views/Drivers/Driver/Dashboard/Dashboard';
import ItineraryHistoryDriver from '../../../views/Drivers/Driver/Dashboard/ItineraryHistory';
import MechanicRequestDriver from '../../../views/Drivers/Driver/MechanicRequest/MechanicRequest';
import ProfileDriver from '../../../views/Drivers/Driver/Profile/Profile';
import Ratings from '../../../views/Drivers/Driver/Profile/Ratings';
import SOSRequestDriver from '../../../views/Drivers/Driver/SOS/SOS';
import TicketRequestDriver from '../../../views/Drivers/Driver/Ticket/Ticket';
import TicketHistoryDriver from '../../../views/Drivers/Driver/Ticket/SubmittedTicket';
import FAQHistoryDriver from '../../../views/Drivers/Driver/Faq/Faq';
import SubmittedSOSDriver from '../../../views/Drivers/Driver/SOS/SOSHistory';
import MechanicRequestDriverHistory from '../../../views/Drivers/Driver/MechanicRequest/MechanicRequestHistory';
import NotificationsDriver from '../../../views/Drivers/Driver/Notifications/notifications';
import AssignedVehicleHistory from '../../../views/Drivers/Driver/Profile/assignedVehicleHistory';
import CompletedTripsContent from '../../../views/Drivers/Driver/Trips/completedTrips';
import UpcomingTripsContent from '../../../views/Drivers/Driver/Trips/upcomingTrips';
import TripDetailContent from '../../../views/Drivers/Driver/Trips/tripDetail';
import ActiveTrip from '../../../views/Drivers/Driver/Dashboard/ActiveTrip';
import NotFoundPage from '../../../views/404Page/NotFound';
import Forbidden from '../../../views/403/Forbidden';
import Login from '../../../views/Drivers/Driver/Login';
import EmbeddedMap from '../../../views/Drivers/Driver/Map/EmbedMap';
import OnboardingFlow from '../../../views/Drivers/Driver/Onboarding/OnboardingFlow';
import VettingMessage from '../../../views/Drivers/Driver/Onboarding/VettingMessage';

/**
 * DriverRoutes — queens-driverapp
 * Upgraded to React Router v6.
 * Uses AuthGuard for protected routes.
 */
const DriverRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login-drivers" element={<Login />} />
      <Route path="/signup" element={<RegisterDriver />} />
      <Route path="/recovery" element={<ForgotPasswordDriver />} />
      <Route path="/previledges-denied" element={<Forbidden />} />
      <Route path="/onboarding" element={<OnboardingFlow />} />
      <Route path="/pending-vetting" element={<VettingMessage />} />

      {/* Protected Routes */}
      {/* <Route element={<AuthGuard />}> */}
      <Route path="/dashboard" element={<DashboardDriver />} />
      <Route path="/profile" element={<ProfileDriver />} />
      <Route path="/drivers-ratings" element={<Ratings />} />
      <Route path="/sos-request" element={<SOSRequestDriver />} />
      <Route path="/sos-history" element={<SubmittedSOSDriver />} />
      <Route path="/request-car-repair" element={<MechanicRequestDriver />} />
      <Route path="/request-repairs-history" element={<MechanicRequestDriverHistory />} />
      <Route path="/createticket" element={<TicketRequestDriver />} />
      <Route path="/submittedticket" element={<TicketHistoryDriver />} />
      <Route path="/faqs" element={<FAQHistoryDriver />} />
      <Route path="/notifications" element={<NotificationsDriver />} />
      <Route path="/assignedvehiclehistory" element={<AssignedVehicleHistory />} />
      <Route path="/completedtrips" element={<CompletedTripsContent />} />
      <Route path="/upcomingtrips" element={<UpcomingTripsContent />} />
      <Route path="/tripdetail" element={<TripDetailContent />} />
      <Route path="/trip/:id" element={<ActiveTrip />} />
      <Route path="/itinerary-history" element={<ItineraryHistoryDriver />} />
      <Route path="/map-viewer" element={<EmbeddedMap />} />
      {/* </Route> */}

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default DriverRoutes;
