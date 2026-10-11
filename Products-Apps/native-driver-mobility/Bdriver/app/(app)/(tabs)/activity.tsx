import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDriverStore } from '../../../src/store/driver';
import { TripHistoryItemDTO } from '../../../src/api/dto';
import { colors } from '../../../src/theme/colors';

type FilterKey = 'all' | 'completed' | 'cancelled' | 'no_show';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'no_show', label: 'No-show' },
];

export default function ActivityScreen() {
  const history = useDriverStore(s => s.history);
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return history;
    return history.filter(h => h.status === filter);
  }, [history, filter]);

  const totals = useMemo(() => {
    const completed = history.filter(h => h.status === 'completed');
    return {
      total: history.length,
      completed: completed.length,
      earnings: completed.reduce((sum, h) => sum + h.fare.amount, 0),
    };
  }, [history]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ACTIVITY</Text>
          <Text style={styles.title}>Trip history</Text>
        </View>

        <View style={styles.totalsRow}>
          <View style={styles.totalCard}>
            <Text style={styles.totalValue}>{totals.total}</Text>
            <Text style={styles.totalLabel}>Trips</Text>
          </View>
          <View style={styles.totalCard}>
            <Text style={styles.totalValue}>{totals.completed}</Text>
            <Text style={styles.totalLabel}>Completed</Text>
          </View>
          <View style={styles.totalCard}>
            <Text style={[styles.totalValue, { color: colors.primary }]}>${totals.earnings.toFixed(2)}</Text>
            <Text style={styles.totalLabel}>Earnings</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map(f => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: filter === f.key }}
              style={({ pressed }) => [
                styles.filterPill,
                filter === f.key && styles.filterPillActive,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="archive-outline" size={36} color="#A0AEC0" />
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptySubtitle}>
              Your trip history will appear here once you complete your first ride.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map(trip => (
              <TripRow key={trip.id} trip={trip} onPress={() => router.push(`/ride/${trip.id}` as any)} />
            ))}
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TripRow({ trip, onPress }: { trip: TripHistoryItemDTO; onPress: () => void }) {
  const statusColor =
    trip.status === 'completed' ? '#219653' :
    trip.status === 'cancelled' ? '#FF3B47' :
    '#A0AEC0';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View trip ${trip.id}`}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.rowHeader}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={styles.tripId}>#{trip.id.toUpperCase()}</Text>
        <Text style={styles.tripDate}>{trip.date}</Text>
        <View style={styles.farePill}>
          <Text style={styles.fareText}>
            {trip.fare.currency}{trip.fare.amount.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.routeRow}>
        <View style={[styles.routeDot, { backgroundColor: '#1F4BFF' }]} />
        <Text style={styles.routeText} numberOfLines={1}>{trip.pickup}</Text>
      </View>
      <View style={styles.routeRow}>
        <View style={[styles.routeDot, { backgroundColor: '#0F1A2B' }]} />
        <Text style={styles.routeText} numberOfLines={1}>{trip.destination}</Text>
      </View>

      <View style={styles.metaRow}>
        <MetaItem icon="person" label={trip.passenger_name} />
        <MetaItem icon="navigate" label={`${trip.distance_km.toFixed(1)} km`} />
        <MetaItem icon="time" label={`${trip.duration_min} min`} />
        <MetaItem
          icon={trip.payment_method === 'cash' ? 'cash' : trip.payment_method === 'wallet' ? 'wallet' : 'card'}
          label={trip.payment_method.charAt(0).toUpperCase() + trip.payment_method.slice(1)}
        />
        {trip.commissionStatus === 'pending' && (
          <Pressable 
            style={styles.commissionPill}
            onPress={() => {
              // We'll need a global way to show the commission modal. 
              // For now, let's navigate to dashboard which triggers the modal on mount.
              router.push('/(app)/(tabs)/dashboard');
            }}
          >
            <Text style={styles.commissionText}>Settle Commission</Text>
          </Pressable>
        )}
        {typeof trip.rating_from_passenger === 'number' && (
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={11} color={colors.primary} />
            <Text style={styles.ratingText}>{trip.rating_from_passenger}</Text>
          </View>
        )}
      </View>

      <View style={styles.viewMoreRow}>
        <Text style={styles.viewMoreText}>View details</Text>
        <Ionicons name="chevron-forward" size={12} color="#A0AEC0" />
      </View>
    </Pressable>
  );
}

function MetaItem({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={12} color="#718096" />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scroll: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  eyebrow: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    color: '#0F1A2B',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  totalsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 18,
  },
  totalCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
  },
  totalValue: {
    color: '#0F1A2B',
    fontSize: 22,
    fontWeight: '900',
  },
  totalLabel: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  filterRow: {
    paddingHorizontal: 20,
    marginTop: 18,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#0F1A2B',
    borderColor: '#0F1A2B',
  },
  filterText: {
    color: '#0F1A2B',
    fontSize: 12,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 20,
    marginTop: 18,
    gap: 12,
  },
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tripId: {
    color: '#0F1A2B',
    fontSize: 13,
    fontWeight: '900',
  },
  tripDate: {
    color: '#718096',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  farePill: {
    backgroundColor: 'rgba(255,184,0,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fareText: {
    color: '#0F1A2B',
    fontSize: 12,
    fontWeight: '900',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeText: {
    flex: 1,
    color: '#0F1A2B',
    fontSize: 13,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  metaText: {
    color: '#0F1A2B',
    fontSize: 11,
    fontWeight: '700',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,184,0,0.16)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  commissionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,59,71,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  commissionText: {
    color: '#FF3B47',
    fontSize: 11,
    fontWeight: '800',
  },
  viewMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    color: '#0F1A2B',
    fontSize: 11,
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
  },
  emptySubtitle: {
    color: '#718096',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  spacer: {
    height: 40,
  },
});
