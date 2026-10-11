import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDriverStore } from '../../../src/store/driver';
import { WalletLedgerEntryDTO } from '../../../src/api/dto';
import { colors } from '../../../src/theme/colors';

const WITHDRAW_QUICK = [50, 100, 200, 500];

export default function WalletScreen() {
  const wallet = useDriverStore(s => s.wallet);
  const isProcessing = useDriverStore(s => s.isLoading);
  const requestWithdrawal = useDriverStore(s => s.requestWithdrawal);
  const [showFull, setShowFull] = useState(true);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const grouped = wallet.ledger.reduce<Record<string, WalletLedgerEntryDTO[]>>((acc, entry) => {
    const month = entry.date.slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(entry);
    return acc;
  }, {});

  const monthLabel = (key: string) => {
    const [year, month] = key.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const numericAmount = useMemo(() => {
    const n = Number(withdrawAmount);
    return Number.isFinite(n) ? n : 0;
  }, [withdrawAmount]);

  const handleWithdraw = async () => {
    if (numericAmount <= 0) {
      Alert.alert('Enter an amount', 'Please enter a value greater than zero.');
      return;
    }
    if (numericAmount > wallet.balance) {
      Alert.alert('Insufficient balance', `You can only withdraw up to ${wallet.currency}${wallet.balance.toFixed(2)}.`);
      return;
    }
    await requestWithdrawal(numericAmount);
    setWithdrawOpen(false);
    setWithdrawAmount('');
    Alert.alert(
      'Withdrawal submitted',
      `${wallet.currency}${numericAmount.toFixed(2)} will be sent to your bank account within 1 business day.`,
    );
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
            <Text style={styles.title}>My wallet</Text>
          </View>
          <Pressable
            onPress={() => setShowFull(v => !v)}
            accessibilityLabel={showFull ? 'Hide balance' : 'Show balance'}
            style={({ pressed }) => [styles.eyeBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name={showFull ? 'eye' : 'eye-off'} size={18} color="#0F1A2B" />
          </Pressable>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available balance</Text>
          <Text style={styles.balanceAmount}>
            {showFull ? `${wallet.currency}${wallet.balance.toFixed(2)}` : '••••••'}
          </Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceSubBlock}>
              <Text style={styles.subLabel}>Pending</Text>
              <Text style={styles.subValue}>
                {showFull ? `${wallet.currency}${wallet.pending_balance.toFixed(2)}` : '••••'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.balanceSubBlock}>
              <Text style={styles.subLabel}>Lifetime</Text>
              <Text style={styles.subValue}>
                {showFull ? `${wallet.currency}${wallet.lifetime_earnings.toFixed(0)}` : '••••'}
              </Text>
            </View>
          </View>

          <View style={styles.ctaRow}>
            <Pressable
              onPress={() => router.push('/wallet/add-money')}
              accessibilityLabel="Add money"
              style={({ pressed }) => [styles.ctaBtn, styles.ctaPrimary, pressed && { opacity: 0.9 }]}
            >
              <Ionicons name="add" size={16} color="#0F1A2B" />
              <Text style={styles.ctaPrimaryText}>Add money</Text>
            </Pressable>
            <Pressable
              disabled={isProcessing || wallet.balance <= 0}
              onPress={() => setWithdrawOpen(true)}
              accessibilityLabel="Withdraw funds"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.ctaBtn,
                styles.ctaGhost,
                (isProcessing || wallet.balance <= 0) && { opacity: 0.5 },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
              <Text style={styles.ctaGhostText}>Withdraw</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.txnHeader}>
          <Text style={styles.txnTitle}>Transactions</Text>
          <View style={styles.exportChip}>
            <Ionicons name="download-outline" size={12} color="#0F1A2B" />
            <Text style={styles.exportText}>Export</Text>
          </View>
        </View>

        {Object.keys(grouped).length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={36} color="#A0AEC0" />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
          </View>
        ) : (
          Object.keys(grouped).map(monthKey => (
            <View key={monthKey} style={styles.monthBlock}>
              <Text style={styles.monthLabel}>{monthLabel(monthKey)}</Text>
              {grouped[monthKey].map(entry => (
                <LedgerRow key={entry.id} entry={entry} />
              ))}
            </View>
          ))
        )}

        <View style={styles.spacer} />
      </ScrollView>

      <Modal
        visible={withdrawOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setWithdrawOpen(false)}
      >
        <View style={styles.modalOverlay} pointerEvents="box-none">
          <Pressable style={styles.modalBackdrop} onPress={() => setWithdrawOpen(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>WITHDRAW</Text>
                <Text style={styles.modalTitle}>Send to your bank</Text>
              </View>
              <Pressable
                onPress={() => setWithdrawOpen(false)}
                accessibilityLabel="Close withdraw"
                style={({ pressed }) => [styles.modalClose, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="close" size={20} color="#0F1A2B" />
              </Pressable>
            </View>

            <View style={styles.modalAvailable}>
              <Text style={styles.modalAvailableLabel}>Available balance</Text>
              <Text style={styles.modalAvailableValue}>
                {wallet.currency}{wallet.balance.toFixed(2)}
              </Text>
            </View>

            <View style={styles.modalAmountRow}>
              <Text style={styles.modalCurrency}>{wallet.currency}</Text>
              <TextInput
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder="0.00"
                placeholderTextColor="#A0AEC0"
                keyboardType="decimal-pad"
                style={styles.modalInput}
                accessibilityLabel="Withdrawal amount"
              />
            </View>

            <View style={styles.modalQuickRow}>
              {WITHDRAW_QUICK.map(q => (
                <Pressable
                  key={q}
                  onPress={() => setWithdrawAmount(String(q))}
                  accessibilityLabel={`Withdraw ${q} dollars`}
                  style={({ pressed }) => [
                    styles.modalQuickChip,
                    numericAmount === q && styles.modalQuickChipActive,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={[styles.modalQuickText, numericAmount === q && styles.modalQuickTextActive]}>
                    {wallet.currency}{q}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => setWithdrawAmount(wallet.balance.toFixed(2))}
                accessibilityLabel="Withdraw entire balance"
                style={({ pressed }) => [
                  styles.modalQuickChip,
                  numericAmount === wallet.balance && styles.modalQuickChipActive,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={[styles.modalQuickText, numericAmount === wallet.balance && styles.modalQuickTextActive]}>
                  Max
                </Text>
              </Pressable>
            </View>

            <View style={styles.modalBankRow}>
              <View style={styles.modalBankIcon}>
                <Ionicons name="business" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalBankName}>GTBank ·••• 4521</Text>
                <Text style={styles.modalBankSubtitle}>Settles in 1 business day</Text>
              </View>
            </View>

            <View style={styles.modalCtaRow}>
              <Pressable
                onPress={() => setWithdrawOpen(false)}
                accessibilityLabel="Cancel withdraw"
                style={({ pressed }) => [styles.modalCtaSecondary, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.modalCtaSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleWithdraw}
                disabled={numericAmount <= 0 || isProcessing}
                accessibilityLabel="Confirm withdrawal"
                style={({ pressed }) => [
                  styles.modalCtaPrimary,
                  (numericAmount <= 0 || isProcessing) && { opacity: 0.5 },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.modalCtaPrimaryText}>
                  Withdraw {wallet.currency}{numericAmount.toFixed(2)}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function LedgerRow({ entry }: { entry: WalletLedgerEntryDTO }) {
  const isCredit = entry.type === 'credit';
  const iconMap: Record<typeof entry.category, keyof typeof Ionicons.glyphMap> = {
    ride: 'car-sport',
    bonus: 'gift',
    tip: 'heart',
    withdrawal: 'arrow-up-circle',
    refund: 'refresh-circle',
    toll: 'map',
    fee: 'alert-circle',
  };
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, isCredit ? styles.rowIconCredit : styles.rowIconDebit]}>
        <Ionicons name={iconMap[entry.category]} size={18} color={isCredit ? '#219653' : '#FF3B47'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{entry.description}</Text>
        <Text style={styles.rowDate}>{entry.date} · {entry.time}</Text>
      </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.rowAmount, isCredit ? styles.amountCredit : styles.amountDebit]}>
            {isCredit ? '+' : '-'}{entry.currency}{entry.amount.toFixed(2)}
          </Text>
          <Text style={styles.rowStatus}>{entry.status.toUpperCase()}</Text>
          {entry.commissionDebtId && entry.status === 'pending' && (
            <Pressable
              onPress={() => Alert.alert('Settle', 'Settle this commission?')}
              style={styles.settleBtn}
            >
              <Text style={styles.settleText}>Settle</Text>
            </Pressable>
          )}
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
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
  balanceCard: {
    backgroundColor: '#0F1A2B',
    marginHorizontal: 20,
    marginTop: 22,
    padding: 24,
    borderRadius: 22,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 12,
  },
  balanceSubBlock: {
    flex: 1,
  },
  subLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  subValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: 12,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  ctaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  ctaPrimary: {
    backgroundColor: colors.primary,
  },
  ctaPrimaryText: {
    color: '#0F1A2B',
    fontSize: 14,
    fontWeight: '900',
  },
  ctaGhost: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ctaGhostText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  txnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  txnTitle: {
    color: '#0F1A2B',
    fontSize: 16,
    fontWeight: '900',
  },
  exportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  exportText: {
    color: '#0F1A2B',
    fontSize: 11,
    fontWeight: '800',
  },
  monthBlock: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  monthLabel: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconCredit: {
    backgroundColor: 'rgba(33,150,83,0.16)',
  },
  rowIconDebit: {
    backgroundColor: 'rgba(255,59,71,0.16)',
  },
  rowTitle: {
    color: '#0F1A2B',
    fontSize: 13,
    fontWeight: '800',
  },
  rowDate: {
    color: '#718096',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: '900',
  },
  amountCredit: {
    color: '#219653',
  },
  amountDebit: {
    color: '#FF3B47',
  },
  rowStatus: {
    color: '#A0AEC0',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.6,
  },
  settleBtn: {
    backgroundColor: '#FF3B47',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  settleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    color: '#0F1A2B',
    fontSize: 15,
    fontWeight: '800',
  },
  spacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 26, 43, 0.45)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    shadowColor: '#0F1A2B',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    boxShadow: '0 -8px 24px rgba(15, 26, 43, 0.18)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalEyebrow: {
    color: '#FFB800',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  modalTitle: {
    color: '#0F1A2B',
    fontSize: 20,
    fontWeight: '800',
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvailable: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  modalAvailableLabel: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalAvailableValue: {
    color: '#0F1A2B',
    fontSize: 28,
    fontWeight: '800',
  },
  modalAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  modalCurrency: {
    color: '#718096',
    fontSize: 22,
    fontWeight: '700',
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    color: '#0F1A2B',
    fontSize: 22,
    fontWeight: '800',
    padding: 0,
  },
  modalQuickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  modalQuickChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalQuickChipActive: {
    backgroundColor: '#0F1A2B',
    borderColor: '#0F1A2B',
  },
  modalQuickText: {
    color: '#0F1A2B',
    fontSize: 13,
    fontWeight: '700',
  },
  modalQuickTextActive: {
    color: '#FFB800',
  },
  modalBankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    gap: 12,
  },
  modalBankIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0F1A2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBankName: {
    color: '#0F1A2B',
    fontSize: 14,
    fontWeight: '800',
  },
  modalBankSubtitle: {
    color: '#718096',
    fontSize: 12,
    marginTop: 2,
  },
  modalCtaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCtaSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCtaSecondaryText: {
    color: '#0F1A2B',
    fontSize: 14,
    fontWeight: '700',
  },
  modalCtaPrimary: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FFB800',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCtaPrimaryText: {
    color: '#0F1A2B',
    fontSize: 14,
    fontWeight: '800',
  },
});
