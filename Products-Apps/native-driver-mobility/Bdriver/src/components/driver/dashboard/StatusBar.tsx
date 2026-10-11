import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDriverStore } from '../../../store/driver';
import { colors } from '../../../theme/colors';

export default function StatusBar() {
  const isOnline = useDriverStore(s => s.isOnline);
  const earnings = useDriverStore(s => s.earnings);
  const rating = useDriverStore(s => s.profile.rating);

  if (!isOnline) {
    return (
      <View style={styles.bar}>
        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="My trips"
            style={({ pressed }) => [styles.cornerBtn, styles.cornerBtnLeft, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="person" size={20} color="#FFFFFF" />
          </Pressable>

          <View style={styles.centerStatus} pointerEvents="none">
            <Text style={styles.statusText}>You&apos;re offline</Text>
            <View style={styles.toggleTrack}>
              <View style={styles.toggleOff} />
              <Text style={styles.toggleLabel}>Offline</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Recenter map"
            style={({ pressed }) => [styles.cornerBtn, styles.cornerBtnRight, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="locate" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(33,150,83,0.18)' }]}>
              <Ionicons name="checkmark" size={14} color="#219653" />
            </View>
            <View>
              <Text style={styles.metricValue}>{earnings.acceptance_rate.toFixed(1)}%</Text>
              <Text style={styles.metricLabel}>Acceptance</Text>
            </View>
          </View>
          <View style={styles.metric}>
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(255,184,0,0.18)' }]}>
              <Ionicons name="star" size={14} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.metricValue}>{rating.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>Rating</Text>
            </View>
          </View>
          <View style={styles.metric}>
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(255,59,71,0.18)' }]}>
              <Ionicons name="close" size={14} color="#FF3B47" />
            </View>
            <View>
              <Text style={styles.metricValue}>{earnings.cancellation_rate.toFixed(1)}%</Text>
              <Text style={styles.metricLabel}>Cancellation</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.bar}>
      <View style={styles.onlineRow}>
        <View style={styles.statusBlock}>
          <Text style={styles.statusText}>You&apos;re online</Text>
          <View style={styles.toggleTrack}>
            <Text style={styles.toggleLabelOnline}>Online</Text>
            <View style={styles.toggleOn} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingBottom: 22,
    paddingHorizontal: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cornerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0F1A2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerBtnLeft: {},
  cornerBtnRight: {},
  centerStatus: {
    alignItems: 'center',
    flex: 1,
  },
  statusBlock: {
    alignItems: 'center',
  },
  statusText: {
    color: '#0F1A2B',
    fontSize: 18,
    fontWeight: '900',
  },
  toggleTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  toggleOff: {
    width: 18,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#A0AEC0',
  },
  toggleOn: {
    width: 18,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#219653',
  },
  toggleLabel: {
    color: '#A0AEC0',
    fontSize: 12,
    fontWeight: '700',
  },
  toggleLabelOnline: {
    color: '#219653',
    fontSize: 12,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  metric: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    color: '#0F1A2B',
    fontSize: 16,
    fontWeight: '900',
  },
  metricLabel: {
    color: '#718096',
    fontSize: 11,
    fontWeight: '700',
  },
  onlineRow: {
    alignItems: 'center',
  },
});
