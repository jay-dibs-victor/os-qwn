import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useDriverStore } from '../../../src/store/driver';
import { colors } from '../../../src/theme/colors';

export default function RideDetailScreen() {
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const history = useDriverStore(s => s.history);
  const trip = useMemo(
    () => history.find(h => h.id === rideId),
    [history, rideId],
  );

  if (!trip) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="chevron-back" size={20} color="#0F1A2B" />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.eyebrow}>RIDE</Text>
            <Text style={styles.title}>Trip details</Text>
          </View>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.empty}>
          <Ionicons name="archive-outline" size={36} color="#A0AEC0" />
          <Text style={styles.emptyTitle}>Trip not found</Text>
          <Text style={styles.emptySubtitle}>
            We couldn't find a trip with ID #{rideId}. It may have been removed.
          </Text>
          <Pressable
            onPress={() => router.replace('/activity')}
            accessibilityLabel="Back to activity"
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.primaryBtnText}>Back to activity</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = trip.status === 'completed';
  const statusColor = isCompleted ? '#219653' : trip.status === 'cancelled' ? '#FF3B47' : '#A0AEC0';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Back"
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="chevron-back" size={20} color="#0F1A2B" />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.eyebrow}>RIDE #{trip.id.toUpperCase()}</Text>
          <Text style={styles.title}>{trip.date}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={[styles.statusPill, { backgroundColor: `${statusColor}22` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {trip.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.fareValue}>
            {trip.fare.currency}{trip.fare.amount.toFixed(2)}
          </Text>
          <Text style={styles.fareSubtitle}>
            {trip.distance_km.toFixed(1)} km · {trip.duration_min} min
          </Text>
          {trip.fare.surge > 1 && (
            <View style={styles.surgePill}>
              <Ionicons name="flash" size={12} color="#0F1A2B" />
              <Text style={styles.surgeText}>
                {trip.fare.surge.toFixed(1)}x surge applied
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.routeRow}>
            <View style={styles.routeIconCol}>
              <View style={[styles.routeDot, { backgroundColor: '#1F4BFF' }]} />
              <View style={styles.routeLine} />
              <View style={[styles.routeDot, { backgroundColor: '#0F1A2B' }]} />
            </View>
            <View style={styles.routeContent}>
              <View style={styles.routeItem}>
                <Text style={styles.routeLabel}>Pickup</Text>
                <Text style={styles.routeText}>{trip.pickup}</Text>
              </View>
              <View style={styles.routeItem}>
                <Text style={styles.routeLabel}>Drop-off</Text>
                <Text style={styles.routeText}>{trip.destination}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <DetailRow icon="person" label="Rider" value={trip.passenger_name} />
          <View style={styles.divider} />
          <DetailRow
            icon={trip.payment_method === 'cash' ? 'cash' : trip.payment_method === 'wallet' ? 'wallet' : 'card'}
            label="Payment"
            value={trip.payment_method.charAt(0).toUpperCase() + trip.payment_method.slice(1)}
          />
          <View style={styles.divider} />
          <DetailRow
            icon="car-sport"
            label="Service"
            value={trip.service_type.charAt(0).toUpperCase() + trip.service_type.slice(1)}
          />
          {typeof trip.rating_from_passenger === 'number' && (
            <>
              <View style={styles.divider} />
              <DetailRow
                icon="star"
                label="Rider rating"
                value={`${trip.rating_from_passenger.toFixed(1)} ★`}
              />
            </>
          )}
        </View>

        {isCompleted && (
          <View style={styles.card}>
            <Text style={styles.fareTitle}>Fare breakdown</Text>
            <FareRow label="Base fare" value={`${trip.fare.currency}${trip.fare.base_fare.toFixed(2)}`} />
            <FareRow label="Distance" value={`${trip.fare.currency}${trip.fare.distance_fare.toFixed(2)}`} />
            <FareRow label="Time" value={`${trip.fare.currency}${trip.fare.time_fare.toFixed(2)}`} />
            {trip.fare.tip > 0 && (
              <FareRow label="Tip" value={`${trip.fare.currency}${trip.fare.tip.toFixed(2)}`} />
            )}
            {trip.fare.toll > 0 && (
              <FareRow label="Toll" value={`${trip.fare.currency}${trip.fare.toll.toFixed(2)}`} />
            )}
            {trip.fare.surge > 1 && (
              <FareRow label={`Surge (${trip.fare.surge.toFixed(1)}x)`} value="included" />
            )}
            <View style={styles.fareDivider} />
            <FareRow
              label="Total"
              value={`${trip.fare.currency}${trip.fare.amount.toFixed(2)}`}
              bold
            />
          </View>
        )}

        {isCompleted && (
          <Pressable
            onPress={() => Alert.alert('Report issue', 'Issue reporting will be wired to support in a future build.')}
            accessibilityLabel="Report issue"
            style={({ pressed }) => [styles.supportBtn, pressed && { opacity: 0.9 }]}
          >
            <Ionicons name="help-circle" size={16} color="#FF3B47" />
            <Text style={styles.supportText}>Report an issue with this trip</Text>
          </Pressable>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={16} color="#0F1A2B" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function FareRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.fareRow}>
      <Text style={[styles.fareRowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.fareRowValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  eyebrow: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  title: {
    color: '#0F1A2B',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  scroll: {
    paddingBottom: 60,
  },
  heroCard: {
    backgroundColor: '#0F1A2B',
    marginHorizontal: 20,
    marginTop: 22,
    padding: 24,
    borderRadius: 22,
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  fareValue: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    marginTop: 10,
    letterSpacing: -0.5,
  },
  fareSubtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  surgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFB800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  surgeText: {
    color: '#0F1A2B',
    fontSize: 11,
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 16,
    padding: 16,
  },
  routeRow: {
    flexDirection: 'row',
    gap: 14,
  },
  routeIconCol: {
    alignItems: 'center',
    width: 16,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  routeContent: {
    flex: 1,
    gap: 12,
  },
  routeItem: {},
  routeLabel: {
    color: '#A0AEC0',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  routeText: {
    color: '#0F1A2B',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    color: '#A0AEC0',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailValue: {
    color: '#0F1A2B',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
  },
  fareTitle: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  fareRowLabel: {
    color: '#718096',
    fontSize: 13,
    fontWeight: '600',
  },
  fareRowValue: {
    color: '#0F1A2B',
    fontSize: 13,
    fontWeight: '800',
  },
  fareDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  bold: {
    color: '#0F1A2B',
    fontSize: 15,
    fontWeight: '900',
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
  },
  supportText: {
    color: '#FF3B47',
    fontSize: 13,
    fontWeight: '800',
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    color: '#0F1A2B',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  emptySubtitle: {
    color: '#718096',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
  },
  primaryBtnText: {
    color: '#0F1A2B',
    fontSize: 14,
    fontWeight: '900',
  },
  spacer: {
    height: 40,
  },
});
