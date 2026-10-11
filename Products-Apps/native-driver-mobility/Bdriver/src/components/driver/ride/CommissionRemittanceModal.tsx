import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { useDriverStore, SavedCard } from '../../../store/driver';

type Step = 'main' | 'card_payment' | 'add_card' | 'top_up' | 'pay_later' | 'payment_success';

type Props = {
  visible: boolean;
  amount: number;
  rideId: string;
  walletBalance: number;
  loading?: boolean;
  onPayNow: (method: 'wallet' | 'bank_card') => Promise<boolean>;
  onSkip: () => void;
  onTopUp: (amount: number) => void;
  onPaymentComplete: () => void;
};

const PAYMENT_METHODS = [
  { id: 'paypal', label: 'Paypal', icon: 'logo-paypal' },
  { id: 'googlepay', label: 'Google Pay', icon: 'logo-google' },
  { id: 'applepay', label: 'Apple Pay', icon: 'logo-apple' },
  { id: 'card', label: 'Bank Card', icon: 'card-outline' },
  { id: 'kuda', label: 'Kuda Pay', icon: 'wallet-outline' },
  { id: 'opay', label: 'Opay', icon: 'cash-outline' },
];

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000];

export default function CommissionRemittanceModal({
  visible,
  amount,
  rideId,
  walletBalance,
  loading,
  onPayNow,
  onSkip,
  onTopUp,
  onPaymentComplete,
}: Props) {
  const savedCards = useDriverStore(s => s.savedCards);
  const addCard = useDriverStore(s => s.addCard);
  const isSufficient = walletBalance >= amount;

  const [step, setStep] = useState<Step>('main');

  // Card flow state
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [location, setLocation] = useState('');
  const [zip, setZip] = useState('');

  // Top up state
  const [topUpAmount, setTopUpAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // Processing state
  const [processingPayment, setProcessingPayment] = useState(false);

  // Pay later state
  const [payLaterConfirmed, setPayLaterConfirmed] = useState(false);

  const reset = () => {
    setStep('main');
    setSelectedCardId(null);
    setCardNumber('');
    setHolderName('');
    setExpDate('');
    setCvv('');
    setLocation('');
    setZip('');
    setTopUpAmount('');
    setSelectedMethod(null);
    setPayLaterConfirmed(false);
  };

  if (!visible) return null;

  const numericTopUp = (() => {
    const n = Number(topUpAmount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  })();

  const renderMain = () => (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Commission Due</Text>
      </View>
      <Text style={styles.amountText}>₦{amount.toFixed(2)}</Text>

      {isSufficient ? (
        <>
          <Text style={styles.desc}>
            Your wallet balance of ₦{walletBalance.toFixed(2)} is sufficient. Pay now or defer.
          </Text>
          <Pressable
            style={[styles.btn, styles.payBtn]}
            onPress={() => onPayNow('wallet')}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnText}>Pay from Wallet</Text>
            )}
          </Pressable>
          <Pressable style={[styles.btn, styles.skipBtn]} onPress={() => setStep('pay_later')}>
            <Text style={[styles.btnTextSecondary]}>Pay Later (48h)</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={18} color="#E53E3E" />
            <Text style={styles.warningText}>
              Insufficient wallet balance (₦{walletBalance.toFixed(2)}). The commission is
              ₦{amount.toFixed(2)}.
            </Text>
          </View>

          <Pressable
            style={[styles.btn, styles.payBtn]}
            onPress={() => {
              if (savedCards.length > 0) {
                setStep('card_payment');
                setSelectedCardId(savedCards[0].id);
              } else {
                setStep('add_card');
              }
            }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnText}>Pay with Bank Card</Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.btn, styles.topUpBtn]}
            onPress={() => setStep('top_up')}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0F1A2B" />
            ) : (
              <Text style={[styles.btnText, { color: '#0F1A2B' }]}>Top Up Wallet</Text>
            )}
          </Pressable>

          <Pressable style={[styles.btn, styles.skipBtn]} onPress={() => setStep('pay_later')}>
            <Text style={[styles.btnTextSecondary]}>Pay Later (48h)</Text>
          </Pressable>
        </>
      )}
    </>
  );

  const renderCardPayment = () => (
    <>
      <View style={styles.headerRow}>
        <Pressable onPress={() => setStep('main')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F1A2B" />
        </Pressable>
        <Text style={styles.title}>Pay with Card</Text>
      </View>
      <Text style={styles.amountText}>₦{amount.toFixed(2)}</Text>

      <Text style={styles.sectionLabel}>Select Saved Card</Text>
      {savedCards.map(card => (
        <Pressable
          key={card.id}
          style={[styles.cardRow, selectedCardId === card.id && styles.cardRowActive]}
          onPress={() => setSelectedCardId(card.id)}
        >
          <Ionicons name="card-outline" size={24} color="#0F1A2B" />
          <View style={styles.cardInfo}>
            <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
            <Text style={styles.cardMeta}>
              {card.holder} | {card.exp}
            </Text>
          </View>
          <View style={[styles.radioOuter, selectedCardId === card.id && styles.radioActive]}>
            {selectedCardId === card.id && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
          </View>
        </Pressable>
      ))}

      <Pressable
        style={[styles.btn, styles.payBtn, { marginTop: 16 }]}
        onPress={async () => {
          if (!selectedCardId) return;
          setProcessingPayment(true);
          const ok = await onPayNow('bank_card');
          setProcessingPayment(false);
          if (ok) setStep('payment_success');
        }}
        disabled={processingPayment || !selectedCardId}
      >
        {processingPayment ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.btnText}>Pay ₦{amount.toFixed(2)}</Text>
        )}
      </Pressable>

      <Pressable
        style={[styles.btn, styles.outlineBtn, { marginTop: 8 }]}
        onPress={() => setStep('add_card')}
      >
        <Text style={[styles.btnTextSecondary]}>+ Add New Card</Text>
      </Pressable>
    </>
  );

  const renderAddCard = () => (
    <>
      <View style={styles.headerRow}>
        <Pressable onPress={() => setStep(savedCards.length > 0 ? 'card_payment' : 'main')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F1A2B" />
        </Pressable>
        <Text style={styles.title}>Add New Card</Text>
      </View>

      <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Card Number</Text>
          <View style={styles.inputWithIcon}>
            <TextInput
              placeholder="2345 6786 5400 5466"
              placeholderTextColor="#A0AEC0"
              style={styles.input}
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
            />
            <Ionicons name="scan-outline" size={20} color="#A0AEC0" />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cardholder Name</Text>
          <TextInput
            placeholder="John Doe"
            placeholderTextColor="#A0AEC0"
            style={styles.input}
            value={holderName}
            onChangeText={setHolderName}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Expiry Date</Text>
            <TextInput
              placeholder="MM/YY"
              placeholderTextColor="#A0AEC0"
              style={styles.input}
              value={expDate}
              onChangeText={setExpDate}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 0.6, marginLeft: 12 }]}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              placeholder="123"
              placeholderTextColor="#A0AEC0"
              style={styles.input}
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              placeholder="Nigeria"
              placeholderTextColor="#A0AEC0"
              style={styles.input}
              value={location}
              onChangeText={setLocation}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 0.6, marginLeft: 12 }]}>
            <Text style={styles.label}>Zip Code</Text>
            <TextInput
              placeholder="100001"
              placeholderTextColor="#A0AEC0"
              style={styles.input}
              value={zip}
              onChangeText={setZip}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.securityRow}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          <Text style={styles.securityText}>Secure & Encrypted Payment</Text>
        </View>

        <Pressable
          style={[styles.btn, styles.payBtn, { marginTop: 20 }]}
          onPress={() => {
            const last4 = cardNumber.slice(-4) || '0000';
            const name = holderName || 'Cardholder';
            const exp = expDate || '12/99';
            addCard({ last4, holder: name, exp, brand: 'Visa' });
            setCardNumber('');
            setHolderName('');
            setExpDate('');
            setCvv('');
            setLocation('');
            setZip('');
            setStep('card_payment');
          }}
        >
          <Text style={styles.btnText}>Add Card</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, styles.skipBtn, { marginBottom: 20 }]}
          onPress={() => setStep('main')}
        >
          <Text style={[styles.btnTextSecondary]}>Skip</Text>
        </Pressable>
      </ScrollView>
    </>
  );

  const renderTopUp = () => (
    <>
      <View style={styles.headerRow}>
        <Pressable onPress={() => setStep('main')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F1A2B" />
        </Pressable>
        <Text style={styles.title}>Top Up Wallet</Text>
      </View>

      <View style={styles.balanceRow}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceValue}>₦{walletBalance.toFixed(2)}</Text>
      </View>

      <Text style={styles.sectionLabel}>Select Payment Method</Text>
      {PAYMENT_METHODS.map(m => (
        <Pressable
          key={m.id}
          style={[styles.methodRow, selectedMethod === m.id && styles.methodRowActive]}
          onPress={() => setSelectedMethod(m.id)}
        >
          <View style={styles.methodLeft}>
            <Ionicons name={m.icon as any} size={22} color="#0F1A2B" />
            <Text style={styles.methodLabel}>{m.label}</Text>
          </View>
          <View style={[styles.radioOuter, selectedMethod === m.id && styles.radioActive]}>
            {selectedMethod === m.id && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
          </View>
        </Pressable>
      ))}

      <View style={styles.amountSection}>
        <Text style={styles.sectionLabel}>Amount</Text>
        <View style={styles.amountRowCustom}>
          <Text style={styles.amountPrefix}>₦</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            placeholderTextColor="#CBD5E0"
            value={topUpAmount}
            onChangeText={setTopUpAmount}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.quickAmounts}>
          {QUICK_AMOUNTS.map(q => (
            <Pressable
              key={q}
              style={[styles.quickChip, numericTopUp === q && styles.quickChipActive]}
              onPress={() => setTopUpAmount(String(q))}
            >
              <Text style={[styles.quickText, numericTopUp === q && styles.quickTextActive]}>
                ₦{q.toLocaleString()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        style={[styles.btn, styles.payBtn, { marginTop: 12 }]}
        onPress={() => {
          if (numericTopUp > 0) {
            onTopUp(numericTopUp);
          }
        }}
        disabled={loading || numericTopUp <= 0}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.btnText}>Top Up ₦{numericTopUp.toLocaleString()}</Text>
        )}
      </Pressable>
    </>
  );

  const renderPayLater = () => (
    <>
      <View style={styles.headerRow}>
        <Pressable onPress={() => setStep('main')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F1A2B" />
        </Pressable>
        <Text style={styles.title}>Pay Later</Text>
      </View>

      <View style={styles.payLaterIcon}>
        <Ionicons name="time-outline" size={48} color={colors.primary} />
      </View>

      <Text style={styles.payLaterTitle}>You have 48 hours to pay</Text>
      <Text style={styles.payLaterDesc}>
        Your commission of ₦{amount.toFixed(2)} is due within 48 hours. While you have an
        outstanding balance, you will not be able to accept new trips.
      </Text>

      <View style={styles.payLaterNotice}>
        <Ionicons name="information-circle" size={18} color="#1F4BFF" />
        <Text style={styles.payLaterNoticeText}>
          To resume accepting trips, pay your outstanding commission via the debt banner at the top
          of your dashboard.
        </Text>
      </View>

      <Pressable
        style={[styles.btn, styles.confirmBtn]}
        onPress={() => {
          setPayLaterConfirmed(true);
          onSkip();
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.btnText}>I Understand, Defer Payment</Text>
        )}
      </Pressable>

      <Pressable style={[styles.btn, styles.skipBtn]} onPress={() => setStep('main')}>
        <Text style={[styles.btnTextSecondary]}>Cancel</Text>
      </Pressable>
    </>
  );

  const renderPaymentSuccess = () => (
    <>
      <View style={styles.successContainer}>
        <View style={styles.successIconWrap}>
          <Ionicons name="checkmark-circle" size={72} color={colors.primary} />
        </View>
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successSubtitle}>
          Your commission of ₦{amount.toFixed(2)} has been paid successfully.
        </Text>
        <View style={styles.successDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>₦{amount.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Method</Text>
            <Text style={styles.detailValue}>Bank Card •••• {selectedCardId ? savedCards.find(c => c.id === selectedCardId)?.last4 : ''}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#38A169" />
              <Text style={styles.statusText}>Paid</Text>
            </View>
          </View>
        </View>
      </View>
      <Pressable
        style={[styles.btn, styles.payBtn, { marginTop: 8 }]}
        onPress={onPaymentComplete}
      >
        <Text style={styles.btnText}>Continue</Text>
      </Pressable>
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {step === 'main' && renderMain()}
          {step === 'card_payment' && renderCardPayment()}
          {step === 'add_card' && renderAddCard()}
          {step === 'top_up' && renderTopUp()}
          {step === 'pay_later' && renderPayLater()}
          {step === 'payment_success' && renderPaymentSuccess()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F1A2B',
  },
  amountText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFB800',
    textAlign: 'center',
    marginVertical: 12,
  },
  desc: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#C53030',
    fontWeight: '600',
    lineHeight: 18,
  },
  btn: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  payBtn: {
    backgroundColor: '#0F1A2B',
  },
  topUpBtn: {
    backgroundColor: '#FFB800',
  },
  confirmBtn: {
    backgroundColor: '#0F1A2B',
    marginTop: 8,
  },
  skipBtn: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  outlineBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0F1A2B',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnTextSecondary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#718096',
  },
  // Card payment styles
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F7FAFC',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cardRowActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,184,0,0.08)',
  },
  cardInfo: {
    flex: 1,
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1A2B',
  },
  cardMeta: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    backgroundColor: '#0F1A2B',
    borderColor: '#0F1A2B',
  },
  // Add card form
  formScroll: {
    maxHeight: 420,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#718096',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#0F1A2B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingRight: 12,
  },
  row: {
    flexDirection: 'row',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  securityText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
  },
  // Top up styles
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '700',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F1A2B',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  methodRowActive: {
    backgroundColor: 'rgba(255,184,0,0.06)',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: -8,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F1A2B',
  },
  amountSection: {
    marginTop: 16,
  },
  amountRowCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
  },
  amountPrefix: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F1A2B',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '900',
    color: '#0F1A2B',
    paddingVertical: 12,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
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
    fontSize: 12,
    fontWeight: '900',
    color: '#0F1A2B',
  },
  quickTextActive: {
    color: '#0F1A2B',
  },
  // Pay later styles
  payLaterIcon: {
    alignItems: 'center',
    marginVertical: 12,
  },
  payLaterTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F1A2B',
    textAlign: 'center',
    marginBottom: 8,
  },
  payLaterDesc: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  payLaterNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(31,75,255,0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  payLaterNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#1F4BFF',
    fontWeight: '600',
    lineHeight: 17,
  },
  // Payment success styles
  successContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIconWrap: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F1A2B',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  successDetails: {
    width: '100%',
    backgroundColor: '#F7FAFC',
    borderRadius: 14,
    padding: 16,
    gap: 14,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#0F1A2B',
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 13,
    color: '#38A169',
    fontWeight: '800',
  },
});
