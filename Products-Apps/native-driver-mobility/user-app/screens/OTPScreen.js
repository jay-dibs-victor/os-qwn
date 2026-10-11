import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';

export default function OTPScreen({ navigation, route }) {
  const phone = route?.params?.phone || '+234 812 345 6789';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setInterval(() => setResendTimer(r => r - 1), 1000);
      return () => clearInterval(t);
    }
  }, [resendTimer]);

  const handleChange = (val, index) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) inputs.current[index - 1]?.focus();
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length !== 6) return Alert.alert('OTP', 'Please enter the complete 6-digit code.');
    setLoading(true);
    setTimeout(() => { setLoading(false); navigation.replace('Home'); }, 1000);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={s.header}>
          <View style={s.iconBox}>
            <ShieldCheck size={32} color={colors.gold.bright} />
          </View>
          <Text style={s.title}>Verify your number</Text>
          <Text style={s.subtitle}>
            We sent a 6-digit code to <Text style={s.phone}>{phone}</Text>
          </Text>
        </View>

        <View style={s.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={ref => inputs.current[i] = ref}
              style={[s.otpBox, digit && s.otpBoxFilled]}
              value={digit}
              onChangeText={v => handleChange(v, i)}
              onKeyPress={e => handleKeyDown(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={i === 0}
            />
          ))}
        </View>

        <TouchableOpacity style={s.primaryBtn} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.bg.deep} /> : <Text style={s.primaryBtnText}>Verify & Continue</Text>}
        </TouchableOpacity>

        <View style={s.timerRow}>
          {resendTimer > 0 ? (
            <Text style={s.timerText}>Resend code in {resendTimer}s</Text>
          ) : (
            <TouchableOpacity onPress={() => { setResendTimer(30); setOtp(['', '', '', '', '', '']); Alert.alert('OTP Resent', 'Code 123456 has been resent.'); }}>
              <Text style={s.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.deep },
  scroll: { padding: 28, flexGrow: 1 },
  back: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.bg.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border.gold, marginBottom: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconBox: { width: 72, height: 72, borderRadius: 22, backgroundColor: colors.gold.glow, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: colors.text.primary },
  subtitle: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  phone: { fontWeight: '700', color: colors.gold.pure },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  otpBox: {
    width: 50, height: 56, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border.gold,
    backgroundColor: colors.bg.surface, textAlign: 'center', fontSize: 22, fontWeight: '800',
    color: colors.text.primary, outlineStyle: 'none',
  },
  otpBoxFilled: { borderColor: colors.gold.bright, borderWidth: 2 },
  primaryBtn: {
    backgroundColor: colors.gold.bright, padding: 18, borderRadius: 14, alignItems: 'center', height: 56,
    shadowColor: colors.gold.bright, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  primaryBtnText: { color: colors.bg.deep, fontSize: 16, fontWeight: '800' },
  timerRow: { alignItems: 'center', marginTop: 24 },
  timerText: { color: colors.text.secondary, fontSize: 14 },
  resendLink: { color: colors.gold.pure, fontSize: 14, fontWeight: '700' },
});
