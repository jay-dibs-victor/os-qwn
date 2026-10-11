import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Mail, ArrowLeft, Send } from 'lucide-react-native';
import { sanitizeInput } from '../lib/validation';
import { colors } from '../theme/colors';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRecovery = () => {
    if (!email.trim()) return Alert.alert('Recovery', 'Please enter your registered email address.');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Recovery Sent', 'Instructions to reset your PIN have been sent to your email.', [
        { text: 'OK', onPress: () => navigation.goBack() },
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
            <Mail size={28} color={colors.gold.bright} />
          </View>
          <Text style={s.title}>Forgot PIN?</Text>
          <Text style={s.subtitle}>Enter your registered email and we'll send recovery instructions.</Text>
        </View>

        <Text style={s.label}>Email Address</Text>
        <View style={s.inputWrap}>
          <Mail size={18} color={colors.text.secondary} style={{ marginRight: 12 }} />
          <TextInput style={s.input} placeholder="name@example.com" placeholderTextColor={colors.text.muted}
            value={email} onChangeText={v => setEmail(sanitizeInput(v))} keyboardType="email-address" autoCapitalize="none" />
        </View>

        <TouchableOpacity style={s.primaryBtn} onPress={handleRecovery} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.bg.deep} /> : (
            <><Send color={colors.bg.deep} size={18} style={{ marginRight: 8 }} /><Text style={s.primaryBtnText}>Send Recovery Link</Text></>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={s.linkBtn} onPress={() => navigation.goBack()}>
          <Text style={s.linkText}>Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.deep },
  scroll: { padding: 28, flexGrow: 1 },
  back: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.bg.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border.gold, marginBottom: 16 },
  header: { alignItems: 'center', marginBottom: 32 },
  iconBox: { width: 72, height: 72, borderRadius: 22, backgroundColor: colors.gold.glow, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '900', color: colors.text.primary },
  subtitle: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text.secondary, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.surface, borderRadius: 14,
    paddingHorizontal: 16, marginBottom: 20, height: 54, borderWidth: 1.5, borderColor: colors.border.gold,
  },
  input: { flex: 1, fontSize: 15, color: colors.text.primary, fontWeight: '500', outlineStyle: 'none' },
  primaryBtn: {
    backgroundColor: colors.gold.bright, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    padding: 18, borderRadius: 14, height: 56,
    shadowColor: colors.gold.bright, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  primaryBtnText: { color: colors.bg.deep, fontSize: 16, fontWeight: '800' },
  linkBtn: { alignSelf: 'center', marginTop: 24 },
  linkText: { color: colors.gold.pure, fontSize: 14, fontWeight: '600' },
});
