import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDriverStore } from '../../../src/store/driver';
import { colors } from '../../../src/theme/colors';

const QUICK_AMOUNTS = [10, 20, 50, 100];

export default function AddMoneyScreen() {
  const wallet = useDriverStore(s => s.wallet);
  const isProcessing = useDriverStore(s => s.isLoading);
  const [amount, setAmount] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const numeric = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  const submit = () => {
    if (numeric <= 0) return;
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setAmount('');
      router.back();
    }, 1100);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="chevron-back" size={20} color="#0F1A2B" />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.eyebrow}>WALLET</Text>
            <Text style={styles.title}>Add money</Text>
          </View>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.balanceStrip}>
          <Text style={styles.balanceLabel}>Available balance</Text>
          <Text style={styles.balanceValue}>
            {wallet.currency}{wallet.balance.toFixed(2)}
          </Text>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Enter amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currency}>{wallet.currency}</Text>
            <Text style={styles.amountText}>{amount || '0'}</Text>
            <Text style={styles.amountCursor}>|</Text>
          </View>

          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map(q => (
              <Pressable
                key={q}
                onPress={() => setAmount(String(q))}
                accessibilityLabel={`Add ${q} dollars`}
                style={({ pressed }) => [
                  styles.quickChip,
                  numeric === q && styles.quickChipActive,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={[styles.quickText, numeric === q && styles.quickTextActive]}>
                  +{wallet.currency}{q}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>PAYMENT METHOD</Text>
        </View>
        <View style={styles.bankRow}>
          <View style={styles.bankIcon}>
            <Ionicons name="card" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bankName}>GTBank ·••• 4521</Text>
            <Text style={styles.bankSubtitle}>Default payment method</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#A0AEC0" />
        </View>

        <View style={styles.notice}>
          <Ionicons name="information-circle" size={16} color="#1F4BFF" />
          <Text style={styles.noticeText}>
            Funds are usually available instantly. A 1.5% processing fee may apply for cards.
          </Text>
        </View>

        <View style={styles.bottomBar}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>You're adding</Text>
            <Text style={styles.summaryValue}>{wallet.currency}{numeric.toFixed(2)}</Text>
          </View>
          <Pressable
            onPress={submit}
            disabled={numeric <= 0 || isProcessing || success}
            accessibilityLabel="Submit top up"
            style={({ pressed }) => [
              styles.cta,
              (numeric <= 0 || isProcessing) && { opacity: 0.5 },
              success && { backgroundColor: '#219653' },
              pressed && { opacity: 0.92 },
            ]}
          >
            {success ? (
              <View style={styles.ctaInner}>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.ctaText}>Top-up submitted</Text>
              </View>
            ) : (
              <Text style={styles.ctaText}>Submit request</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scroll: {
    paddingBottom: 140,
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
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  balanceStrip: {
    marginHorizontal: 20,
    marginTop: 22,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  balanceValue: {
    color: '#0F1A2B',
    fontSize: 18,
    fontWeight: '900',
  },
  amountCard: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    alignItems: 'center',
  },
  amountLabel: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  currency: {
    color: '#0F1A2B',
    fontSize: 24,
    fontWeight: '900',
    marginRight: 4,
  },
  amountText: {
    color: '#0F1A2B',
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -1,
  },
  amountCursor: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: '900',
    marginLeft: 2,
    marginBottom: 6,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,184,0,0.16)',
  },
  quickChipActive: {
    backgroundColor: colors.primary,
  },
  quickText: {
    color: '#0F1A2B',
    fontSize: 12,
    fontWeight: '900',
  },
  quickTextActive: {
    color: '#0F1A2B',
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 8,
  },
  sectionTitleText: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
  },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0F1A2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: {
    color: '#0F1A2B',
    fontSize: 15,
    fontWeight: '900',
  },
  bankSubtitle: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(31,75,255,0.1)',
    marginHorizontal: 20,
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
  },
  noticeText: {
    flex: 1,
    color: '#0F1A2B',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 20,
    paddingBottom: 28,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryValue: {
    color: '#0F1A2B',
    fontSize: 22,
    fontWeight: '900',
  },
  cta: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaText: {
    color: '#0F1A2B',
    fontSize: 16,
    fontWeight: '900',
  },
});
