import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { User, Mail, Phone, Gift, ArrowLeft, ArrowRight, Check } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { validateRequired, validateEmail, validatePhone, sanitizeInput } from '../lib/validation';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referral, setReferral] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [consent, setConsent] = useState(false);

  const handleRegister = () => {
    const nameError = validateRequired(fullName, 'Full name');
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    const err = nameError || emailError || phoneError;
    if (err) return Alert.alert('Registration', err);
    if (!consent) return Alert.alert('Consent Required', 'You must agree to the Privacy Policy to continue.');
    setLoading(true);
    const safeName = sanitizeInput(fullName);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Home');
    }, 800);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={s.header}>
          <Text style={s.title}>Create Account</Text>
          <Text style={s.subtitle}>Join Queens and move safely around Lagos</Text>
        </View>

        <Text style={s.label}>Full Name</Text>
        <View style={[s.inputWrap, focused === 'name' && s.inputFocused]}>
          <User size={18} color={colors.text.secondary} style={s.icon} />
          <TextInput style={s.input} placeholder="Enter your full name" placeholderTextColor={colors.text.muted}
            value={fullName} onChangeText={v => setFullName(sanitizeInput(v))} autoCapitalize="words"
            onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
        </View>

        <Text style={s.label}>Email Address</Text>
        <View style={[s.inputWrap, focused === 'email' && s.inputFocused]}>
          <Mail size={18} color={colors.text.secondary} style={s.icon} />
          <TextInput style={s.input} placeholder="name@example.com" placeholderTextColor={colors.text.muted}
            value={email} onChangeText={v => setEmail(sanitizeInput(v))} keyboardType="email-address" autoCapitalize="none"
            onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
        </View>

        <Text style={s.label}>Phone Number</Text>
        <View style={[s.inputWrap, focused === 'phone' && s.inputFocused]}>
          <Phone size={18} color={colors.text.secondary} style={s.icon} />
          <Text style={s.prefix}>+234</Text>
          <TextInput style={s.input} placeholder="812 345 6789" placeholderTextColor={colors.text.muted}
            value={phone} onChangeText={v => setPhone(sanitizeInput(v))} keyboardType="phone-pad"
            onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} />
        </View>

        <Text style={s.label}>Referral Code (optional)</Text>
        <View style={[s.inputWrap, focused === 'referral' && s.inputFocused]}>
          <Gift size={18} color={colors.text.secondary} style={s.icon} />
          <TextInput style={s.input} placeholder="Enter referral code" placeholderTextColor={colors.text.muted}
            value={referral} onChangeText={v => setReferral(sanitizeInput(v))} autoCapitalize="characters"
            onFocus={() => setFocused('referral')} onBlur={() => setFocused(null)} />
        </View>

        {/* Consent checkbox */}
        <TouchableOpacity style={s.checkboxRow} onPress={() => setConsent(c => !c)} activeOpacity={0.7}>
          <View style={[s.checkboxBox, consent && s.checkboxBoxActive]}>
            {consent && <Check size={16} color={colors.bg.deep} strokeWidth={3} />}
          </View>
          <Text style={s.checkboxLabel}>
            I agree to the{' '}
            <Text style={s.checkboxLink} onPress={() => navigation.navigate('PrivacyPolicy')}>
              Privacy Policy
            </Text>
            {' '}and consent to the processing of my personal data.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.primaryBtn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.bg.deep} /> : (
            <><Text style={s.primaryBtnText}>Next: Payment Setup</Text><ArrowRight color={colors.bg.deep} size={20} /></>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={s.linkBtn} onPress={() => navigation.navigate('OTP')}>
          <Text style={s.linkText}>Already have an OTP code? Verify here</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.deep },
  scroll: { padding: 28, flexGrow: 1 },
  back: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.bg.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border.gold, marginBottom: 16 },
  header: { marginBottom: 28 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text.primary },
  subtitle: { fontSize: 14, color: colors.text.secondary, marginTop: 6 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text.secondary, marginBottom: 8, marginTop: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.surface, borderRadius: 14,
    paddingHorizontal: 16, marginBottom: 12, height: 54, borderWidth: 1.5, borderColor: colors.border.gold,
  },
  inputFocused: { borderColor: colors.gold.bright, borderWidth: 2 },
  icon: { marginRight: 12 },
  prefix: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: colors.text.primary, fontWeight: '500', outlineStyle: 'none' },
  primaryBtn: {
    backgroundColor: colors.gold.bright, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    padding: 18, borderRadius: 14, marginTop: 20, height: 56,
    shadowColor: colors.gold.bright, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  primaryBtnText: { color: colors.bg.deep, fontSize: 16, fontWeight: '800', marginRight: 8 },
  linkBtn: { alignSelf: 'center', marginTop: 20 },
  linkText: { color: colors.gold.pure, fontSize: 14, fontWeight: '600' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingVertical: 4 },
  checkboxBox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.border.gold, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxBoxActive: { backgroundColor: colors.gold.pure, borderColor: colors.gold.pure },
  checkboxLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.text.secondary, lineHeight: 20 },
  checkboxLink: { color: colors.gold.pure, fontWeight: '700' },
});
