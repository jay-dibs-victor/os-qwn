import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthActionButton } from '@/ui/AuthFlow';
import { Screen } from '@/ui/Screen';

export default function PaymentWizard() {
  const { planTitle, planPrice, planDuration, planDesc } = useLocalSearchParams<{ planTitle?: string; planPrice?: string; planDuration?: string; planDesc?: string }>();
  const subscription = { name: planTitle ?? 'Plan', summary: `${planDuration ?? ''} / ${planDesc ?? ''}`.replace(/^\/\s*/, ''), amount: `₦${planPrice ?? '0'}` };

  const [activeStep, setActiveStep] = useState(0);
  const [hasCard, setHasCard] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<{ id: string; last4: string; holder: string; exp: string }[]>([
    { id: '1', last4: '5466', holder: 'Charge Patel', exp: '10/26' },
    { id: '2', last4: '1234', holder: 'Charge Patel', exp: '05/28' }
  ]);

  const next = () => {
    if (activeStep < 3) setActiveStep(s => s + 1);
  };
  
  const prev = () => {
    if (activeStep > 0) setActiveStep(s => s - 1);
  };

  const deleteCard = (id: string) => {
    setSavedCards(prev => prev.filter(c => c.id !== id));
  };

  const addCard = (last4: string, holder: string, exp: string) => {
    const newCard = { id: Date.now().toString(), last4, holder, exp };
    setSavedCards(prev => [...prev, newCard]);
    setHasCard(true);
  };

  return (
    <Screen noPadding style={styles.screen}>
      {activeStep === 0 && <PaymentMethod onNext={next} onAddCard={() => setActiveStep(1)} selectedMethod={selectedMethod} onSelectMethod={setSelectedMethod} hasCard={hasCard} />}
      {activeStep === 1 && <AddCard onSave={addCard} onBack={prev} savedCards={savedCards} onDeleteCard={deleteCard} onSkip={next} />}
      {activeStep === 2 && <ReviewPayment selectedMethod={selectedMethod} subscription={subscription} onBack={prev} onPay={next} />}
      {activeStep === 3 && <PaymentSuccess />}
    </Screen>
  );
}

const ALL_METHODS = [
  { id: 'paypal', label: 'Paypal', icon: 'logo-paypal' },
  { id: 'googlepay', label: 'Google Pay', icon: 'logo-google' },
  { id: 'applepay', label: 'Apple Pay', icon: 'logo-apple' },
  { id: 'card', label: 'Bank Card', icon: 'card-outline' },
  { id: 'kuda', label: 'Kuda Pay', icon: 'wallet-outline' },
  { id: 'opay', label: 'Opay', icon: 'cash-outline' },
  { id: 'alipay', label: 'Alipay', icon: 'phone-portrait-outline' },
  { id: 'moniepoint', label: 'Monie Point', icon: 'card-outline' },
];

const PAGE_SIZE = 6;

function PaymentMethod({ onNext, onAddCard, selectedMethod, onSelectMethod, hasCard }: { onNext: () => void, onAddCard: () => void, selectedMethod: string | null, onSelectMethod: (v: string | null) => void, hasCard: boolean }) {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [search]);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return ALL_METHODS;
    const q = debouncedSearch.toLowerCase();
    return ALL_METHODS.filter(m => m.label.toLowerCase().includes(q));
  }, [debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const isWalletMethod = selectedMethod && selectedMethod !== 'card';
  const handleBottomAction = () => {
    if (isWalletMethod) {
      setShowSuccess(true);
    } else {
      onAddCard();
    }
  };

  return (
    <View style={styles.inner}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.header}>Payment</Text>
      </View>
      <View style={styles.progressBar}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={[styles.progressSegment, step <= 1 ? styles.progressActive : styles.progressInactive]} />
        ))}
      </View>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#888" />
        <TextInput
          placeholder="Search payment method"
          placeholderTextColor="#666"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#888" />
          </Pressable>
        )}
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        {paged.map((m) => (
          <Pressable key={m.id} style={[styles.row, styles.methodRow]} onPress={() => { onSelectMethod(m.id); }}>
            <View style={styles.methodLeft}>
              <Ionicons name={m.icon as any} size={24} color="#fff" />
              <Text style={styles.text}>{m.label}</Text>
            </View>
            <View style={[styles.radio, selectedMethod === m.id && styles.radioActive]}>
              {selectedMethod === m.id && <Ionicons name="checkmark" size={14} color="#000" />}
            </View>
          </Pressable>
        ))}
        {filtered.length === 0 && (
          <Text style={styles.noResults}>No payment methods found.</Text>
        )}
        <View style={styles.paginationRow}>
          <Pressable
            style={[styles.pageArrow, safePage === 0 && styles.pageArrowDisabled]}
            disabled={safePage === 0}
            onPress={() => setPage(p => Math.max(0, p - 1))}
          >
            <Ionicons name="chevron-back" size={18} color={safePage === 0 ? '#555' : '#FFB800'} />
          </Pressable>
          <Text style={styles.pageLabel}>{safePage + 1} / {totalPages}</Text>
          <Pressable
            style={[styles.pageArrow, safePage >= totalPages - 1 && styles.pageArrowDisabled]}
            disabled={safePage >= totalPages - 1}
            onPress={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          >
            <Ionicons name="chevron-forward" size={18} color={safePage >= totalPages - 1 ? '#555' : '#FFB800'} />
          </Pressable>
        </View>
      </View>
      <Pressable style={styles.addButton} onPress={handleBottomAction}>
        <Text style={styles.addText}>{isWalletMethod ? 'Next' : '+ Add New Card'}</Text>
      </Pressable>

      <Modal visible={showSuccess} transparent animationType="slide" onRequestClose={() => setShowSuccess(false)}>
        <View style={styles.overlay}>
          <View style={styles.successSheet}>
            <View style={styles.sheetHandle} />
            <Ionicons name="checkmark-circle" size={64} color="#FFB800" />
            <Text style={styles.sheetTitle}>Payment Successful!</Text>
            <Text style={styles.sheetSubtitle}>Your subscription has been activated.</Text>
            <AuthActionButton variant="primary" onPress={() => router.replace('/(auth)/auth-choice')} style={styles.successButton} textStyle={styles.primaryText}>
              Completed
            </AuthActionButton>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function AddCard({ onSave, onBack, savedCards, onDeleteCard, onSkip }: { onSave: (last4: string, holder: string, exp: string) => void, onBack: () => void, savedCards: { id: string; last4: string; holder: string; exp: string }[], onDeleteCard: (id: string) => void, onSkip: () => void }) {
  const [showSaved, setShowSaved] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [location, setLocation] = useState('');
  const [zip, setZip] = useState('');

  return (
    <View style={styles.inner}>
      <View style={styles.headerRow}>
        <Pressable onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.header}>Add New Card</Text>
      </View>
      <View style={styles.progressBar}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={[styles.progressSegment, step <= 2 ? styles.progressActive : styles.progressInactive]} />
        ))}
      </View>

      {savedCards.length > 0 && (
        <View style={[styles.cardContainer, { marginBottom: 20 }]}>
          <Pressable style={styles.row} onPress={() => setShowSaved(!showSaved)}>
            <Text style={styles.sectionTitle}>View Saved Cards</Text>
            <Ionicons name={showSaved ? "chevron-up" : "chevron-down"} size={20} color="#fff" />
          </Pressable>
          {showSaved && savedCards.map((card) => (
            <View key={card.id} style={[styles.row, { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <Ionicons name="card-outline" size={24} color="#fff" />
                <View>
                  <Text style={styles.text}>**** **** **** {card.last4}</Text>
                  <Text style={[styles.label, { marginTop: 2 }]}>{card.holder} | {card.exp}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable onPress={() => {}}>
                  <Ionicons name="create-outline" size={20} color="#FFB800" />
                </Pressable>
                <Pressable onPress={() => onDeleteCard(card.id)}>
                  <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.cardContainer}>
        <Pressable style={{ alignItems: 'center', paddingVertical: 4 }} onPress={() => setShowAddCard(!showAddCard)}>
          <Text style={[styles.sectionTitle, { textAlign: 'center', marginBottom: 0 }]}>{showAddCard ? '−' : '+'}</Text>
        </Pressable>
        {showAddCard && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card Number</Text>
              <View style={styles.inputWithIcon}>
                <TextInput placeholder="23456 7865 4000 5466" placeholderTextColor="#666" style={styles.input} value={cardNumber} onChangeText={setCardNumber} />
                <Ionicons name="scan-outline" size={20} color="#fff" />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Holder Name</Text>
              <TextInput placeholder="Charge Patel" placeholderTextColor="#666" style={styles.input} value={holderName} onChangeText={setHolderName} />
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Expire Date</Text>
                <View style={styles.inputWithIcon}>
                  <TextInput placeholder="MM/YY" placeholderTextColor="#666" style={styles.input} value={expDate} onChangeText={setExpDate} />
                  <Ionicons name="calendar-outline" size={20} color="#fff" style={{ marginLeft: 10, marginRight: 5 }} />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 0.8, marginLeft: 12 }]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput placeholder="354" placeholderTextColor="#666" style={styles.input} value={cvv} onChangeText={setCvv} />
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Location</Text>
                <View style={styles.inputWithIcon}>
                  <TextInput placeholder="USA" placeholderTextColor="#666" style={styles.input} value={location} onChangeText={setLocation} />
                  <Ionicons name="chevron-down" size={20} color="#fff" />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 0.8, marginLeft: 12 }]}>
                <Text style={styles.label}>Zip Code</Text>
                <TextInput placeholder="3545" placeholderTextColor="#666" style={styles.input} value={zip} onChangeText={setZip} />
              </View>
            </View>
            <View style={styles.checkboxRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#FFB800" />
              <Text style={styles.checkboxText}>Secure & Encrypted Payment</Text>
            </View>
            <AuthActionButton variant="primary" onPress={() => { onSave(cardNumber.slice(-4) || '0000', holderName || 'User', expDate || '12/99'); setShowAddCard(false); setShowSaved(true); }} style={[styles.primaryButton, { marginTop: 20 }]} textStyle={styles.primaryText}>
              Add Card
            </AuthActionButton>
          </>
        )}
      </View>
      <Pressable style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipText}>Already Added Card</Text>
      </Pressable>
    </View>
  );
}

function ReviewPayment({ selectedMethod, subscription, onBack, onPay }: { selectedMethod: string | null; subscription: { name: string; summary: string; amount: string }; onBack: () => void; onPay: () => void }) {
  return (
    <View style={styles.inner}>
      <View style={styles.headerRow}>
        <Pressable onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.header}>Confirm Payment</Text>
      </View>
      <View style={styles.progressBar}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={[styles.progressSegment, step <= 3 ? styles.progressActive : styles.progressInactive]} />
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <Text style={styles.text}>{subscription.name}</Text>
        <Text style={[styles.label, { marginTop: 4 }]}>{subscription.summary}</Text>
      </View>
      <View style={[styles.card, { marginTop: 16 }]}>
        <View style={styles.row}>
          <Text style={styles.text}>Amount</Text>
          <Text style={[styles.text, { fontWeight: 'bold' }]}>{subscription.amount}</Text>
        </View>
        <View style={[styles.row, { marginTop: 12 }]}>
          <Text style={styles.text}>Payment Mode</Text>
          <Text style={[styles.text, { fontWeight: 'bold', textTransform: 'capitalize' }]}>{selectedMethod || 'Card'}</Text>
        </View>
      </View>
      <AuthActionButton variant="primary" onPress={onPay} style={styles.primaryButton} textStyle={styles.primaryText}>
        Pay {subscription.amount}
      </AuthActionButton>
    </View>
  );
}

function PaymentSuccess() {
  const router = useRouter();

  return (
    <View style={[styles.inner, { justifyContent: 'center', alignItems: 'center' }]}>
      <View style={styles.progressBar}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={[styles.progressSegment, styles.progressActive]} />
        ))}
      </View>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={80} color="#FFB800" />
      </View>
      <Text style={styles.successTitle}>Payment Successful!</Text>
      <Text style={styles.successSubtitle}>Your subscription has been activated.</Text>
      <AuthActionButton variant="primary" onPress={() => router.replace('/(auth)/auth-choice')} style={styles.successButton} textStyle={styles.primaryText}>
        Completed
      </AuthActionButton>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#000' },
  inner: { flex: 1, paddingHorizontal: 32, backgroundColor: '#000' },
  header: { color: '#fff', fontSize: 24, fontWeight: '900' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  progressBar: { flexDirection: 'row', gap: 8, marginBottom: 30 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  progressActive: { backgroundColor: '#FFB800' },
  progressInactive: { backgroundColor: '#333' },
  card: { backgroundColor: '#1B1B1B', padding: 20, borderRadius: 20, gap: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  text: { color: '#fff', fontSize: 16 },
  radio: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#555', alignItems: 'center', justifyContent: 'center' },
  radioActive: { backgroundColor: '#FFB800', borderColor: '#FFB800' },
  sectionTitle: { color: '#fff', fontSize: 16, marginBottom: 15, fontWeight: 'bold' },
  methodRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  methodLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addButton: { padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#fff', marginTop: 20, alignItems: 'center', borderStyle: 'dashed', backgroundColor: '#fff' },
  addText: { color: '#000', fontWeight: '800' },
  primaryButton: { backgroundColor: '#FFB800', marginTop: 40, borderRadius: 30, paddingVertical: 16 },
  primaryText: { color: '#000', fontSize: 18, fontWeight: '900' },
  skipButton: { padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#fff', marginTop: 12, alignItems: 'center', backgroundColor: '#fff' },
  skipText: { color: '#000', fontWeight: '800' },
  inputGroup: { gap: 8 },
  label: { color: '#aaa', fontSize: 14 },
  cardContainer: { backgroundColor: '#1B1B1B', padding: 20, borderRadius: 20, gap: 15, borderWidth: 1, borderColor: '#333' },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', borderRadius: 12, borderWidth: 1, borderColor: '#333', paddingRight: 10 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  checkboxText: { color: '#fff' },
  input: { flex: 1, color: '#fff', backgroundColor: '#000', padding: 15, borderRadius: 12 },
  successIcon: { marginBottom: 24 },
  successTitle: { color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  successSubtitle: { color: '#aaa', fontSize: 16, textAlign: 'center', marginBottom: 48 },
  successButton: { backgroundColor: '#FFB800', marginTop: 40, borderRadius: 30, paddingVertical: 16, alignSelf: 'stretch' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  successSheet: { backgroundColor: '#1B1B1B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32, paddingBottom: 48, alignItems: 'center' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#555', marginBottom: 24 },
  sheetTitle: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 16, marginBottom: 8 },
  sheetSubtitle: { color: '#aaa', fontSize: 15, textAlign: 'center', marginBottom: 8 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1B1B1B', borderRadius: 12, borderWidth: 1, borderColor: '#333', paddingHorizontal: 12, marginBottom: 16, gap: 8 },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 12, fontSize: 14 },
  noResults: { color: '#666', textAlign: 'center', paddingVertical: 20 },
  paginationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
  pageArrow: { padding: 6, borderRadius: 6, borderWidth: 1, borderColor: '#333' },
  pageArrowDisabled: { opacity: 0.4 },
  pageLabel: { color: '#888', fontSize: 13 },
});
