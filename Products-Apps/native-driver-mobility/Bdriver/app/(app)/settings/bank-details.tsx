import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDriverStore } from '../../../src/store/driver';
import { colors } from '../../../src/theme/colors';

export default function BankDetailsScreen() {
  const profile = useDriverStore(s => s.profile);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>BANKING</Text>
          <Text style={styles.title}>Bank details</Text>
          <Text style={styles.subtitle}>
            Earnings are settled to this account every Monday.
          </Text>
        </View>

        <View style={styles.cardHero}>
          <View style={styles.bankRow}>
            <View style={styles.bankIcon}>
              <Ionicons name="business" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bankName}>{profile.bank.bank_name}</Text>
              <Text style={styles.bankAccount}>{profile.bank.account_number}</Text>
              <Text style={styles.bankHolder}>{profile.bank.account_holder}</Text>
            </View>
            <View style={styles.verifiedChip}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <SpecRow label="Bank" value={profile.bank.bank_name} />
          <SpecRow label="Account holder" value={profile.bank.account_holder} />
          <SpecRow label="Account number" value={profile.bank.account_number} />
          <SpecRow label="Routing / SWIFT" value={profile.bank.routing_number} />
          <SpecRow label="Settlement day" value="Every Monday" last />
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            accessibilityLabel="Replace bank account"
            style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }]}
          >
            <Ionicons name="swap-horizontal" size={16} color="#0F1A2B" />
            <Text style={styles.secondaryText}>Replace account</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="View settlement history"
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
          >
            <Ionicons name="time" size={16} color="#0F1A2B" />
            <Text style={styles.primaryText}>Settlement history</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SpecRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View>
      <View style={styles.specRow}>
        <Text style={styles.specLabel}>{label}</Text>
        <Text style={styles.specValue}>{value}</Text>
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
  subtitle: {
    color: '#718096',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    lineHeight: 20,
  },
  cardHero: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 22,
    padding: 18,
    borderRadius: 18,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bankIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0F1A2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: {
    color: '#0F1A2B',
    fontSize: 16,
    fontWeight: '900',
  },
  bankAccount: {
    color: '#0F1A2B',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: 1,
  },
  bankHolder: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#219653',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 16,
    padding: 4,
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
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 22,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  secondaryText: {
    color: '#0F1A2B',
    fontSize: 13,
    fontWeight: '800',
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: '#0F1A2B',
    fontSize: 13,
    fontWeight: '900',
  },
});
