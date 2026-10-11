import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDriverStore } from '../../../store/driver';
import { colors } from '../../../theme/colors';
import { playSuccessChime } from '../../../utils/sound';

type ViewState = 'summary' | 'receipt';

export default function TripSummaryCard() {
  const currentRide = useDriverStore(s => s.currentRide);
  const earnings = useDriverStore(s => s.earnings);
  const cashCollected = useDriverStore(s => s.cashCollected);
  const openToll = useDriverStore(s => s.openTollModal);
  const completeTrip = useDriverStore(s => s.completeTrip);
  const wallet = useDriverStore(s => s.wallet);

  const [view, setView] = useState<ViewState>('summary');

  if (!currentRide || cashCollected) return null;

  const paymentMethod = currentRide.paymentMethod;
  const isCash = paymentMethod === 'cash';
  const fareAmount = currentRide.fare.amount;
  const commissionAmount = currentRide.commissionAmount;
  const driverEarnings = fareAmount - commissionAmount;

  const handleContinue = () => {
    playSuccessChime();
    completeTrip();
  };

  const renderSummary = () => (
    <>
      <View style={styles.header}>
        <Pressable
          style={styles.closeBtn}
          accessibilityLabel="Close trip summary"
          onPress={() => {}}
        >
          <Ionicons name="close" size={20} color="#0F1A2B" />
        </Pressable>
        <Text style={styles.title}>{`Trip #${currentRide.id.slice(-4).toUpperCase()}`}</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.amountBlock}>
        <Text style={styles.amountValue}>
          {earnings.currency}
          {currentRide.fare.amount.toFixed(2)}
        </Text>
        <Text style={styles.amountLabel}>
          {isCash
            ? `Collect cash from ${currentRide.passenger.first_name} ${currentRide.passenger.last_name}`
            : `Payment from ${currentRide.passenger.first_name} ${currentRide.passenger.last_name}`}
        </Text>
      </View>

      <View style={styles.paymentBadgeRow}>
        <PaymentBadge method={paymentMethod} />
      </View>

      <View style={styles.divider} />

      <Pressable
        onPress={openToll}
        style={styles.detailsRow}
        accessibilityLabel="View more details or add toll"
      >
        <Text style={styles.detailsText}>VIEW MORE DETAILS</Text>
      </Pressable>

      <View style={styles.tollBlock}>
        <Text style={styles.tollLabel}>Toll</Text>
        <View style={styles.tollRow}>
          <Text style={styles.tollValue}>
            {earnings.currency}0
          </Text>
          <Pressable
            onPress={openToll}
            style={styles.tollBtn}
            accessibilityLabel="Add toll"
          >
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={styles.tollBtnText}>Add toll</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={() => {
          if (isCash) {
            completeTrip();
          } else {
            setView('receipt');
          }
        }}
        style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.92 }]}
        accessibilityRole="button"
        accessibilityLabel="Confirm trip done"
      >
        <Text style={styles.doneBtnText}>DONE</Text>
      </Pressable>
    </>
  );

  const renderReceipt = () => {
    const isVoucher = paymentMethod === 'voucher';
    const isQueensCoin = paymentMethod === 'queens_coin';

    return (
      <>
        <View style={styles.successIconWrap}>
          <Ionicons name="checkmark-circle" size={56} color="#38A169" />
        </View>
        <Text style={styles.receiptTitle}>Trip Complete!</Text>
        <Text style={styles.receiptSubtitle}>
          {isVoucher
            ? 'Rider paid with Voucher'
            : isQueensCoin
              ? 'Rider paid with Queens Coin'
              : 'Payment received'}
        </Text>

        <View style={styles.receiptCard}>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Total fare</Text>
            <Text style={styles.receiptValue}>₦{fareAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Commission (10%)</Text>
            <Text style={styles.receiptValueSubtract}>-₦{commissionAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.receiptDivider} />
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabelBold}>Your earnings</Text>
            <Text style={styles.receiptValueBold}>{wallet.currency}{driverEarnings.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.receiptNote}>
          {isVoucher
            ? 'Voucher payment credited to your wallet.'
            : isQueensCoin
              ? 'Queens Coin equivalent credited to your wallet.'
              : 'Amount credited to your wallet.'}
        </Text>

        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.92 }]}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <Text style={styles.doneBtnText}>Continue</Text>
        </Pressable>
      </>
    );
  };

  return (
    <View style={styles.sheet}>
      {view === 'summary' ? renderSummary() : renderReceipt()}
    </View>
  );
}

function PaymentBadge({ method }: { method: string }) {
  let icon: string;
  let label: string;
  let color: string;

  switch (method) {
    case 'cash':
      icon = 'cash-outline';
      label = 'Cash Trip';
      color = '#38A169';
      break;
    case 'wallet':
      icon = 'wallet-outline';
      label = 'Wallet Trip';
      color = '#1F4BFF';
      break;
    case 'bank_card':
      icon = 'card-outline';
      label = 'Card Trip';
      color = '#0F1A2B';
      break;
    case 'voucher':
      icon = 'pricetag-outline';
      label = 'Voucher Trip';
      color = '#D69E2E';
      break;
    case 'queens_coin':
      icon = 'logo-usd';
      label = 'Coin Trip';
      color = '#DD6B20';
      break;
    default:
      icon = 'card-outline';
      label = 'Trip';
      color = '#718096';
  }

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Ionicons name={icon as any} size={12} color="#FFFFFF" />
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#0F1A2B',
    fontSize: 17,
    fontWeight: '900',
  },
  amountBlock: {
    alignItems: 'center',
    marginTop: 16,
  },
  amountValue: {
    color: '#0F1A2B',
    fontSize: 32,
    fontWeight: '900',
  },
  amountLabel: {
    color: '#718096',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  paymentBadgeRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 16,
  },
  detailsRow: {
    alignItems: 'center',
  },
  detailsText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  tollBlock: {
    marginTop: 18,
    paddingHorizontal: 4,
  },
  tollLabel: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  tollValue: {
    color: '#0F1A2B',
    fontSize: 20,
    fontWeight: '900',
  },
  tollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,184,0,0.16)',
    borderRadius: 14,
  },
  tollBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  doneBtn: {
    marginTop: 22,
    backgroundColor: '#0F1A2B',
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  // Receipt styles
  successIconWrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F1A2B',
    textAlign: 'center',
  },
  receiptSubtitle: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  receiptCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '600',
  },
  receiptValue: {
    fontSize: 14,
    color: '#0F1A2B',
    fontWeight: '700',
  },
  receiptValueSubtract: {
    fontSize: 14,
    color: '#E53E3E',
    fontWeight: '700',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  receiptLabelBold: {
    fontSize: 15,
    color: '#0F1A2B',
    fontWeight: '900',
  },
  receiptValueBold: {
    fontSize: 18,
    color: '#38A169',
    fontWeight: '900',
  },
  receiptNote: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 17,
  },
});
