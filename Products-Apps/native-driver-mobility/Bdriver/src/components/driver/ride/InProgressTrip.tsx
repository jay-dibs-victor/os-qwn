import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDriverStore } from '../../../store/driver';
import { colors } from '../../../theme/colors';

export default function InProgressTrip() {
  const currentRide = useDriverStore(s => s.currentRide);
  const completeTrip = useDriverStore(s => s.completeTrip);
  const openToll = useDriverStore(s => s.openTollModal);
  const routeEtaMin = useDriverStore(s => s.currentRouteEtaMin);
  const routeDistanceKm = useDriverStore(s => s.currentRouteDistanceKm);

  if (!currentRide) return null;

  return (
    <View style={styles.sheet}>
      <View style={styles.routeCard}>
        <Ionicons name="location" size={18} color="#1F4BFF" />
        <View style={styles.routeInfo}>
          <Text style={styles.routeAddress} numberOfLines={2}>{currentRide.pickup_address}</Text>
          <Text style={styles.routeAddress} numberOfLines={2}>{currentRide.destination_address}</Text>
        </View>
        <Pressable style={styles.iconBtn} accessibilityLabel="Call passenger">
          <Ionicons name="call" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.bottomInfo}>
          <Text style={styles.etaValue}>{routeEtaMin > 0 ? routeEtaMin.toFixed(0) : currentRide.duration_min} min · {routeDistanceKm > 0 ? routeDistanceKm.toFixed(1) : currentRide.distance_km.toFixed(1)} km</Text>
          <Text style={styles.etaLabel}>Heading to {currentRide.destination_address.split(',')[0]}</Text>
        </View>
        <Pressable onPress={openToll} style={styles.navigateBtn} accessibilityLabel="Enter toll">
          <Ionicons name="receipt" size={14} color="#1F4BFF" />
          <Text style={styles.navigateText}>Add Toll</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={completeTrip}
        style={({ pressed }) => [styles.completeBtn, pressed && { opacity: 0.92 }]}
        accessibilityRole="button"
        accessibilityLabel="Complete trip"
      >
        <Text style={styles.completeBtnText}>COMPLETE</Text>
      </Pressable>
    </View>
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
    gap: 4,
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
    fontWeight: '700',
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
  completeBtn: {
    marginTop: 18,
    backgroundColor: '#0F1A2B',
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
});
