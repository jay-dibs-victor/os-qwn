import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDriverStore } from '../../../src/store/driver';
import { colors } from '../../../src/theme/colors';

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function EarningsScreen() {
  const earnings = useDriverStore(s => s.earnings);
  const refresh = useDriverStore(s => s.refreshEarnings);
  const isLoading = useDriverStore(s => s.isLoading);
  const history = useDriverStore(s => s.history);

  const maxBar = Math.max(...earnings.weekly_breakdown.map(d => d.amount), 1);

  const completed = history.filter(h => h.status === 'completed').length;
  const totalDistance = history.reduce((sum, h) => sum + h.distance_km, 0);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>EARNINGS</Text>
            <Text style={styles.title}>This week</Text>
          </View>
          <Pressable
            onPress={refresh}
            disabled={isLoading}
            style={({ pressed }) => [styles.refreshBtn, pressed && { opacity: 0.8 }]}
            accessibilityLabel="Refresh earnings"
          >
            <Ionicons name="refresh" size={16} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.bigAmount}>
          <Text style={styles.currency}>{earnings.currency}</Text>
          <Text style={styles.amount}>{earnings.weekly_earnings.toFixed(2)}</Text>
          <Text style={styles.period}>Week-to-date · {earnings.weekly_rides} rides</Text>
        </View>

        <View style={styles.metricsRow}>
          <MetricCard
            icon="time"
            label="Online hours"
            value={`${(earnings.today_minutes / 60).toFixed(1)}h`}
            accent="rgba(255,184,0,0.18)"
            iconColor={colors.primary}
          />
          <MetricCard
            icon="speedometer"
            label="Acceptance"
            value={`${earnings.acceptance_rate.toFixed(0)}%`}
            accent="rgba(33,150,83,0.18)"
            iconColor="#219653"
          />
          <MetricCard
            icon="close-circle"
            label="Cancellation"
            value={`${earnings.cancellation_rate.toFixed(1)}%`}
            accent="rgba(255,59,71,0.18)"
            iconColor="#FF3B47"
          />
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Daily breakdown</Text>
            <View style={styles.tierBadge}>
              <Ionicons name="diamond" size={12} color="#0F1A2B" />
              <Text style={styles.tierText}>{earnings.driver_tier} Driver</Text>
            </View>
          </View>
          <View style={styles.chartRow}>
            {earnings.weekly_breakdown.map((d, i) => (
              <View key={`${d.day}-${i}`} style={styles.barColumn}>
                <Text style={styles.barAmount}>{earnings.currency}{d.amount.toFixed(0)}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${(d.amount / maxBar) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{WEEK_LABELS[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.kpiRow}>
          <KPIBlock label="Today" value={`${earnings.currency}${earnings.today_earnings.toFixed(2)}`} />
          <KPIBlock label="Rides today" value={`${earnings.today_rides}`} />
          <KPIBlock label="Completed (week)" value={`${completed}`} />
          <KPIBlock label="Distance" value={`${totalDistance.toFixed(1)} km`} />
        </View>

        <View style={styles.ctaCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Cash out your wallet</Text>
            <Text style={styles.ctaSubtitle}>Transfer earnings to your bank in seconds.</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.9 }]}
            accessibilityLabel="Cash out"
          >
            <Text style={styles.ctaBtnText}>Cash out</Text>
            <Ionicons name="arrow-forward" size={14} color="#0F1A2B" />
          </Pressable>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  icon,
  label,
  value,
  accent,
  iconColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  accent: string;
  iconColor: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: accent }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function KPIBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpiBlock}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scroll: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigAmount: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  currency: {
    color: '#0F1A2B',
    fontSize: 18,
    fontWeight: '900',
  },
  amount: {
    color: '#0F1A2B',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
  },
  period: {
    color: '#718096',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 22,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    color: '#718096',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  metricValue: {
    color: '#0F1A2B',
    fontSize: 18,
    fontWeight: '900',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: 18,
    padding: 18,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartTitle: {
    color: '#0F1A2B',
    fontSize: 16,
    fontWeight: '900',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,184,0,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    color: '#0F1A2B',
    fontSize: 11,
    fontWeight: '800',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 16,
    height: 160,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barAmount: {
    color: '#718096',
    fontSize: 9,
    fontWeight: '700',
  },
  barTrack: {
    width: 16,
    height: 110,
    borderRadius: 8,
    backgroundColor: '#EDF2F7',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 8,
    minHeight: 4,
  },
  barLabel: {
    color: '#718096',
    fontSize: 10,
    fontWeight: '800',
  },
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 18,
  },
  kpiBlock: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
  },
  kpiLabel: {
    color: '#718096',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  kpiValue: {
    color: '#0F1A2B',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  ctaCard: {
    marginHorizontal: 20,
    marginTop: 22,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#0F1A2B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  ctaSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  ctaBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaBtnText: {
    color: '#0F1A2B',
    fontSize: 12,
    fontWeight: '900',
  },
  spacer: {
    height: 40,
  },
});
