import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDriverStore } from '../../../store/driver';
import { colors } from '../../../theme/colors';

type ServiceFilter = 'all' | 'economy' | 'business' | 'premium';

const FILTERS: { key: ServiceFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'economy', label: 'Economy' },
  { key: 'business', label: 'Business' },
  { key: 'premium', label: 'Premium' },
];

const RECENT_HIGHLIGHTS = [
  { id: 'last-trip', label: 'LAST TRIP', amount: 12.5, name: 'Rockdean', date: '2 May\'19 at 2:20 pm' },
  { id: 'today', label: 'TODAY, 7 May\'19', amount: 154.75, name: '08 Trips Completed', date: null },
];

export default function TripHighlights() {
  const history = useDriverStore(s => s.history);
  const earnings = useDriverStore(s => s.earnings);
  const lastTrip = history[0];
  const todayCount = earnings.today_rides;

  const slides = [
    {
      ...RECENT_HIGHLIGHTS[0],
      name: lastTrip?.passenger_name ?? RECENT_HIGHLIGHTS[0].name,
      date: lastTrip?.date ?? RECENT_HIGHLIGHTS[0].date,
      amount: lastTrip?.fare.amount ?? RECENT_HIGHLIGHTS[0].amount,
      target: lastTrip ? `/ride/${lastTrip.id}` : '/activity',
    },
    {
      ...RECENT_HIGHLIGHTS[1],
      name: `${String(todayCount).padStart(2, '0')} Trips Completed`,
      target: '/earnings',
    },
  ];

  return (
    <View style={styles.card}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.amountPill}>
              <Text style={styles.currency}>{earnings.currency}</Text>
              <Text style={styles.amount}>{slide.amount.toFixed(2)}</Text>
            </View>
            <Text style={styles.label}>{slide.label}</Text>
            <View style={styles.divider} />
            <Text style={styles.name}>{slide.name}</Text>
            {!!slide.date && <Text style={styles.date}>{slide.date}</Text>}
            <Pressable
              onPress={() => router.push(slide.target as any)}
              accessibilityRole="button"
              accessibilityLabel={slide.id === 'last-trip' ? 'View all trips' : 'View earnings summary'}
              style={({ pressed }) => [styles.viewBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.viewBtnText}>
                {slide.id === 'last-trip' ? 'VIEW ALL TRIPS' : 'VIEW SUMMARY'}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

export { FILTERS };
export type { ServiceFilter };

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 18,
    paddingBottom: 14,
  },
  scroll: {
    paddingHorizontal: 18,
  },
  slide: {
    width: 320,
    alignItems: 'center',
  },
  amountPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(255,184,0,0.16)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  currency: {
    color: '#0F1A2B',
    fontSize: 16,
    fontWeight: '900',
    marginRight: 2,
  },
  amount: {
    color: '#0F1A2B',
    fontSize: 28,
    fontWeight: '900',
  },
  label: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginTop: 10,
  },
  divider: {
    width: 36,
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  name: {
    color: '#0F1A2B',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  date: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  viewBtn: {
    marginTop: 14,
    backgroundColor: '#0F1A2B',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 22,
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E0',
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 18,
  },
});
