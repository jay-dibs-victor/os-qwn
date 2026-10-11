import { useEffect, useState } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/store/auth';
import { LocationProvider } from '../../src/components/LocationProvider';
import { useDriverStore } from '../../src/store/driver';

const SPLASH_MIN_MS = 1000;

export default function AppLayout() {
  const token = useAuthStore(s => s.token);
  const hasHydrated = useAuthStore(s => s.hasHydrated);
  const user = useAuthStore(s => s.user);
  const profile = useDriverStore(s => s.profile);
  const isOnline = useDriverStore(s => s.isOnline);
  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinDelayDone(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  if (!hasHydrated || !minDelayDone) return null;
  if (!token) return <Redirect href="/(auth)/welcome" />;

  // Routing rules:
  //   - No user record             → onboarding required.
  //   - Vetting not approved       → vetting pending screen.
  //   - Vetting approved           → dashboard.
  const vettingStatus = user?.vettingStatus ?? profile?.documents ? 'PENDING' : 'NOT_SUBMITTED';
  const adminVerified = user?.adminVerified ?? false;

  if (!adminVerified) {
    // Allow mock mode to skip straight to the dashboard so the demo is usable.
    if (process.env.EXPO_PUBLIC_USE_MOCK_AUTH !== 'false') {
      // fall through to dashboard in mock mode
    } else if (vettingStatus === 'NOT_SUBMITTED' || !user) {
      return <Redirect href="/(app)/onboarding" />;
    } else {
      return <Redirect href="/(app)/vetting-pending" />;
    }
  }

  return (
    <LocationProvider>
      <Stack screenOptions={{ headerShown: false, title: '', animation: 'none' }} />
    </LocationProvider>
  );
}
