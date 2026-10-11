import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { addUnauthorizedListener } from '../src/api/unauthorized';
import { SocketProvider } from '../src/realtime/SocketProvider';
import { colors } from '../src/theme/colors';
import { useAuthStore } from '../src/store/auth';
import { useDriverStore } from '../src/store/driver';

export default function RootLayout() {
  const hydrateAuth = useAuthStore(s => s.hydrate);
  const logout = useAuthStore(s => s.logout);

  useEffect(() => {
    void hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    return addUnauthorizedListener(() => {
      void logout();
    });
  }, [logout]);

  // When the auth token changes, hydrate driver data and refresh in background.
  const token = useAuthStore(s => s.token);
  useEffect(() => {
    if (token) {
      void useDriverStore.getState().hydrate();
    }
  }, [token]);

  return (
    <SafeAreaProvider>
      <SocketProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'none',
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.bg },
          }}
        />
      </SocketProvider>
    </SafeAreaProvider>
  );
}
