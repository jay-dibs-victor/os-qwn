import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDriverStore } from '../../../src/store/driver';
import { DocumentStatus } from '../../../src/api/dto';
import { colors } from '../../../src/theme/colors';

export default function MyVehicleScreen() {
  const vehicle = useDriverStore(s => s.profile.vehicle);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>VEHICLE</Text>
          <Text style={styles.title}>My vehicle</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.carBadge}>
            <Ionicons name="car-sport" size={28} color="#0F1A2B" />
          </View>
          <Text style={styles.heroTitle}>{vehicle.make} {vehicle.model}</Text>
          <Text style={styles.heroSubtitle}>{vehicle.year} · {vehicle.color}</Text>
          <View style={styles.platePill}>
            <Text style={styles.plateText}>{vehicle.plate}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <SpecRow label="Make" value={vehicle.make} />
          <SpecRow label="Model" value={vehicle.model} />
          <SpecRow label="Year" value={`${vehicle.year}`} />
          <SpecRow label="Color" value={vehicle.color} />
          <SpecRow label="Plate number" value={vehicle.plate} />
          <SpecRow label="Type" value={vehicle.type.toUpperCase()} />
          <SpecRow label="Seats" value={`${vehicle.seats}`} last />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Insurance</Text>
          <SpecRow label="Provider" value={vehicle.insurance.provider} />
          <SpecRow label="Policy number" value={vehicle.insurance.policy_number} />
          <SpecRow label="Valid until" value={vehicle.insurance.expires} last />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inspection</Text>
          <SpecRow label="Last check" value={vehicle.inspection.last_date} />
          <SpecRow label="Next due" value={vehicle.inspection.next_date} />
          <SpecRow label="Status" value={vehicle.inspection.status.toUpperCase()} last status={vehicle.inspection.status} />
        </View>

        <Pressable
          accessibilityLabel="Edit vehicle"
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
        >
          <Ionicons name="create" size={16} color="#0F1A2B" />
          <Text style={styles.ctaText}>Edit vehicle details</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SpecRow({
  label,
  value,
  last,
  status,
}: {
  label: string;
  value: string;
  last?: boolean;
  status?: DocumentStatus;
}) {
  return (
    <View>
      <View style={styles.specRow}>
        <Text style={styles.specLabel}>{label}</Text>
        {status ? (
          <View
            style={[
              styles.statusPill,
              status === 'verified' && { backgroundColor: 'rgba(33,150,83,0.16)' },
              status === 'pending' && { backgroundColor: 'rgba(255,184,0,0.16)' },
              status === 'expired' && { backgroundColor: 'rgba(255,59,71,0.16)' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                status === 'verified' && { color: '#219653' },
                status === 'pending' && { color: '#0F1A2B' },
                status === 'expired' && { color: '#FF3B47' },
              ]}
            >
              {value}
            </Text>
          </View>
        ) : (
          <Text style={styles.specValue}>{value}</Text>
        )}
      </View>
      {!last && <View style={styles.divider} />}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scroll: {
    paddingBottom: 60,
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
  heroCard: {
    marginHorizontal: 20,
    marginTop: 22,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    alignItems: 'center',
  },
  carBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: '#0F1A2B',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 14,
  },
  heroSubtitle: {
    color: '#718096',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  platePill: {
    marginTop: 14,
    backgroundColor: '#0F1A2B',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  plateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 16,
    padding: 4,
  },
  cardTitle: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 4,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  specLabel: {
    color: '#718096',
    fontSize: 13,
    fontWeight: '700',
  },
  specValue: {
    color: '#0F1A2B',
    fontSize: 14,
    fontWeight: '800',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 12,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 22,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  ctaText: {
    color: '#0F1A2B',
    fontSize: 14,
    fontWeight: '900',
  },
});
