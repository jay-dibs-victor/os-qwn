import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/auth';
import { AppSplash } from '../src/ui/AppSplash';

export default function Index() {
  const token = useAuthStore(s => s.token);
  const hasHydrated = useAuthStore(s => s.hasHydrated);

  if (!hasHydrated) return <AppSplash />;

  return <Redirect href={token ? '/(app)/dashboard' : '/(auth)/welcome'} />;
}
