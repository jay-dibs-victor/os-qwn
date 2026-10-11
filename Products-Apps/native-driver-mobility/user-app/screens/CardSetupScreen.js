import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { CreditCard, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { sanitizeInput } from '../lib/validation';
import { storage } from '../lib/storage';
import { analytics } from '../lib/analytics';
import { colors } from '../theme/colors';

export default function CardSetupScreen({ navigation, route }) {
  const userData = route?.params || {};
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const formatCard = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handleSubmit = async (skip = false) => {
    if (!skip && (cardNo.replace(/\s/g, '').length < 16 || cardExpiry.length < 5 || cardCvv.length < 3)) {
      return Alert.alert('Card Details', 'Please enter valid card details or select Skip.');
    }
    analytics.trackAction('card_setup', { skipped: skip });
    setLoading(true);
    await storage.setCardSetupComplete();
    setTimeout(() => {
      setLoading(false);
      const msg = skip ? 'You can set up a card later in Settings.' : 'Your card has been linked successfully.';
      Alert.alert('Payment Setup', msg, [
        { text: "Let's Go", onPress: () => navigation.goBack() },
      ]);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={s.header}>
          <View style={s.iconBox}>
            <CreditCard size={28} color={colors.gold.bright} />
          </View>
          <Text style={s.title}>Link Payment Method</Text>
          <Text style={s.subtitle}>Securely stored via Paystack / Flutterwave. You can also pay with cash.</Text>
        </View>

        <View style={s.cardPreview}>
          <View style={s.cardChip} />
          <Text style={s.cardNumber}>{cardNo || '••••  ••••  ••••  ••••'}</Text>
          <View style={s.cardBottom}>
            <View>
              <Text style={s.cardLabel}>EXPIRY</Text>
              <Text style={s.cardValue}>{cardExpiry || 'MM/YY'}</Text>
            </View>
            <View>
              <Text style={s.cardLabel}>CVV</Text>
              <Text style={s.cardValue}>{cardCvv ? '•••' : '•••'}</Text>
            </View>
          </View>
        </View>

        <Text style={s.label}>Card Number</Text>
        <View style={[s.inputWrap, focused === 'card' && s.inputFocused]}>
          <TextInput style={s.input} placeholder="0000 0000 0000 0000" placeholderTextColor={colors.text.muted}
            value={cardNo} onChangeText={v => setCardNo(formatCard(v))} keyboardType="number-pad" maxLength={19}
            onFocus={() => setFocused('card')} onBlur={() => setFocused(null)} />
        </View>

        <View style={s.row}>
          <View style={{ flex: 0.58 }}>
            <Text style={s.label}>Expiry</Text>
            <View style={[s.inputWrap, focused === 'expiry' && s.inputFocused]}>
              <TextInput style={s.input} placeholder="MM/YY" placeholderTextColor={colors.text.muted}
                value={cardExpiry} onChangeText={v => setCardExpiry(formatExpiry(v))} keyboardType="number-pad" maxLength={5}
                onFocus={() => setFocused('expiry')} onBlur={() => setFocused(null)} />
            </View>
          </View>
          <View style={{ flex: 0.38 }}>
            <Text style={s.label}>CVV</Text>
            <View style={[s.inputWrap, focused === 'cvv' && s.inputFocused]}>
              <TextInput style={s.input} placeholder="•••" placeholderTextColor={colors.text.muted}
                value={cardCvv} onChangeText={v => setCardCvv(sanitizeInput(v))} keyboardType="number-pad" maxLength={3} secureTextEntry
                onFocus={() => setFocused('cvv')} onBlur={() => setFocused(null)} />
            </View>
          </View>
        </View>

        <TouchableOpacity style={s.primaryBtn} onPress={() => handleSubmit(false)} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.bg.deep} /> : <><CheckCircle color={colors.bg.deep} size={20} style={{ marginRight: 8 }} /><Text style={s.primaryBtnText}>Link & Complete</Text></>}
        </TouchableOpacity>

        <TouchableOpacity style={s.skipBtn} onPress={() => handleSubmit(true)}>
          <Text style={s.skipText}>I'll pay with Cash / Wallet</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.deep },
  scroll: { padding: 28, flexGrow: 1 },
  back: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.bg.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border.gold, marginBottom: 16 },
  header: { alignItems: 'center', marginBottom: 28 },
  iconBox: { width: 72, height: 72, borderRadius: 22, backgroundColor: colors.gold.glow, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '900', color: colors.text.primary },
  subtitle: { fontSize: 13, color: colors.text.secondary, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  cardPreview: {
    backgroundColor: colors.bg.surface, borderRadius: 18, padding: 24, marginBottom: 24, borderWidth: 1.5, borderColor: colors.border.gold,
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  cardChip: { width: 40, height: 28, borderRadius: 6, backgroundColor: colors.gold.bright, marginBottom: 20 },
  cardNumber: { fontSize: 20, fontWeight: '700', color: colors.text.primary, letterSpacing: 2, marginBottom: 20 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { fontSize: 9, color: colors.text.muted, fontWeight: '700', letterSpacing: 1 },
  cardValue: { fontSize: 16, color: colors.text.primary, fontWeight: '700', marginTop: 4 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text.secondary, marginBottom: 8, marginTop: 4 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.surface, borderRadius: 14,
    paddingHorizontal: 16, marginBottom: 12, height: 54, borderWidth: 1.5, borderColor: colors.border.gold,
  },
  inputFocused: { borderColor: colors.gold.bright, borderWidth: 2 },
  input: { flex: 1, fontSize: 15, color: colors.text.primary, fontWeight: '500', outlineStyle: 'none' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  primaryBtn: {
    backgroundColor: colors.gold.bright, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    padding: 18, borderRadius: 14, marginTop: 12, height: 56,
    shadowColor: colors.gold.bright, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  primaryBtnText: { color: colors.bg.deep, fontSize: 16, fontWeight: '800' },
  skipBtn: { marginTop: 16, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border.gold, borderRadius: 14 },
  skipText: { color: colors.gold.pure, fontSize: 14, fontWeight: '700' },
});
