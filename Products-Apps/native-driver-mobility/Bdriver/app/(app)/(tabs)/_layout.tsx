import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDriverStore } from '../../../src/store/driver';
import { colors } from '../../../src/theme/colors';

export default function TabsLayout() {
  const phase = useDriverStore(s => s.phase);
  const isOnline = useDriverStore(s => s.isOnline);
  const inTrip =
    phase === 'driving_to_pickup' ||
    phase === 'arrived' ||
    phase === 'in_progress' ||
    phase === 'trip_complete' ||
    phase === 'awaiting_rating' ||
    phase === 'cancelled';

  const showBar = !inTrip;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'rgba(15,26,43,0.45)',
        tabBarStyle: {
          display: showBar ? 'flex' : 'none',
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          paddingTop: 6,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarLabel: 'Earnings',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="wallet" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarLabel: 'Activity',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="time" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="person" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
