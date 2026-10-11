import { Pressable, StyleSheet, Text, View, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDriverStore } from '../../../store/driver';
import { colors } from '../../../theme/colors';

export default function DrivingToPickup() {
  const currentRide = useDriverStore(s => s.currentRide);
  const openToll = useDriverStore(s => s.openTollModal);
  const openCancel = useDriverStore(s => s.openCancelReason);
  const arrivedAtPickup = useDriverStore(s => s.arrivedAtPickup);
  const routeEtaMin = useDriverStore(s => s.currentRouteEtaMin);
  const routeDistanceKm = useDriverStore(s => s.currentRouteDistanceKm);

  if (!currentRide) return null;

  const handleCall = () => {
    if (currentRide.passenger.phone) {
      Linking.openURL(`tel:${currentRide.passenger.phone}`).catch(() =>
        Alert.alert('Unable to start call', 'Phone dialer is not available on this device.'),
      );
    } else {
      Alert.alert('No phone number', 'This rider has not provided a phone number.');
    }
  };

  const handleChat = () => {
    Alert.alert(
      'Open chat',
      `In-app messaging will be available once chat is integrated with the backend. (Mock: texting ${currentRide.passenger.first_name})`,
    );
  };

  const handleMessage = () => {
    if (currentRide.passenger.phone) {
      Linking.openURL(`sms:${currentRide.passenger.phone}`).catch(() =>
        Alert.alert('Unable to send SMS', 'Messaging is not available on this device.'),
      );
    } else {
      Alert.alert('No phone number', 'This rider has not provided a phone number.');
    }
  };

  return (
    <View style={styles.sheet}>
      <View style={styles.routeCard}>
        <Ionicons name="location" size={18} color="#1F4BFF" />
        <View style={styles.routeInfo}>
          <Text style={styles.routeLabel}>Pickup</Text>
          <Text style={styles.routeAddress} numberOfLines={2}>{currentRide.pickup_address}</Text>
          <Text style={[styles.routeLabel, { marginTop: 8 }]}>Drop-off</Text>
          <Text style={styles.routeAddress} numberOfLines={2}>{currentRide.destination_address}</Text>
        </View>
        <Pressable
          onPress={handleCall}
          style={styles.iconBtn}
          accessibilityLabel="Call passenger"
          accessibilityRole="button"
        >
          <Ionicons name="call" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.bottomInfo}>
          <Text style={styles.etaValue}>{routeEtaMin > 0 ? routeEtaMin.toFixed(0) : currentRide.duration_min} min · {routeDistanceKm > 0 ? routeDistanceKm.toFixed(1) : currentRide.distance_km.toFixed(1)} km</Text>
          <Text style={styles.etaLabel}>Picking up {currentRide.passenger.first_name}</Text>
        </View>
        <Pressable
          onPress={arrivedAtPickup}
          style={styles.navigateBtn}
          accessibilityRole="button"
          accessibilityLabel="I've arrived at pickup"
        >
          <Ionicons name="checkmark-circle" size={14} color="#1F4BFF" />
          <Text style={styles.navigateText}>Arrived</Text>
        </Pressable>
      </View>

      <View style={styles.actionRow}>
        <ActionBtn icon="chatbubble-ellipses" label="Chat" onPress={handleChat} />
        <ActionBtn icon="mail" label="Message" onPress={handleMessage} />
        <ActionBtn icon="close" label="Cancel Trip" onPress={openCancel} danger />
      </View>
    </View>
  );
}

function ActionBtn({ icon, label, onPress, danger }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void; danger?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.actionIcon, danger && { backgroundColor: 'rgba(255,59,71,0.12)' }]}>
        <Ionicons name={icon} size={20} color={danger ? '#FF3B47' : '#0F1A2B'} />
      </View>
      <Text style={[styles.actionLabel, danger && { color: '#FF3B47' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  routeInfo: {
    flex: 1,
    gap: 2,
  },
  routeLabel: {
    color: '#718096',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  routeAddress: {
    color: '#0F1A2B',
    fontSize: 14,
    fontWeight: '800',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,184,0,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomInfo: {
    alignItems: 'center',
    flex: 1,
  },
  etaValue: {
    color: '#0F1A2B',
    fontSize: 16,
    fontWeight: '900',
  },
  etaLabel: {
    color: '#718096',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(31,75,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  navigateText: {
    color: '#1F4BFF',
    fontSize: 12,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 18,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F4F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: '#0F1A2B',
    fontSize: 12,
    fontWeight: '800',
  },
});
