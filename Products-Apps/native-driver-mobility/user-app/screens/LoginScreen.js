import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Phone, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { validateRequired, sanitizeInput } from '../lib/validation';

export default function LoginScreen({ navigation }) {
  const [phoneEmail, setPhoneEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleLogin = async () => {
    const emailError = validateRequired(phoneEmail, 'Email or phone');
    const passError = validateRequired(password, 'Password');
    if (emailError || passError) {
      return Alert.alert('Login', emailError || passError);
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Home');
    }, 800);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <View style={s.logoBox}>
            <Text style={s.logoText}>Q</Text>
          </View>
          <Text style={s.title}>Queens</Text>
          <Text style={s.subtitle}>Move safely around Lagos</Text>
        </View>

        <View style={s.form}>
          <Text style={s.label}>Email or Phone Number</Text>
          <View style={[s.inputWrap, focused === 'email' && s.inputFocused]}>
            <Mail size={18} color={colors.text.secondary} style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="Enter email or phone"
              placeholderTextColor={colors.text.muted}
              value={phoneEmail}
              onChangeText={v => setPhoneEmail(sanitizeInput(v))}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />
          </View>

          <Text style={s.label}>Password</Text>
          <View style={[s.inputWrap, focused === 'password' && s.inputFocused]}>
            <Lock size={18} color={colors.text.secondary} style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="Enter password"
              placeholderTextColor={colors.text.muted}
              value={password}
              onChangeText={v => setPassword(sanitizeInput(v))}
              secureTextEntry={!showPassword}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
              {showPassword ? <EyeOff size={18} color={colors.text.secondary} /> : <Eye size={18} color={colors.text.secondary} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.primaryBtn} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.bg.deep} />
            ) : (
              <>
                <Text style={s.primaryBtnText}>Login</Text>
                <ArrowRight color={colors.bg.deep} size={20} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={s.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={s.forgotText}>Forgot account PIN?</Text>
          </TouchableOpacity>

          <View style={s.dividerRow}>
            <View style={s.divider} />
            <Text style={s.dividerText}>OR</Text>
            <View style={s.divider} />
          </View>

          <TouchableOpacity style={s.googleBtn}>
            <Text style={s.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={s.signupRow}>
            <Text style={s.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={s.signupLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.disclaimer}>By continuing, you agree to our Terms of Service and Privacy Policy.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.deep },
  scroll: { padding: 28, flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: colors.gold.bright, justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, shadowColor: colors.gold.bright, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 10,
  },
  logoText: { fontSize: 36, fontWeight: '900', color: colors.bg.deep },
  title: { fontSize: 32, fontWeight: '900', color: colors.text.primary, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: colors.text.secondary, marginTop: 6 },
  form: { width: '100%' },
  label: { fontSize: 13, fontWeight: '700', color: colors.text.secondary, marginBottom: 8, marginTop: 12 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bg.surface, borderRadius: 14,
    paddingHorizontal: 16, marginBottom: 16, height: 54,
    borderWidth: 1.5, borderColor: colors.border.gold,
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
  },
  inputFocused: { borderColor: colors.gold.bright, borderWidth: 2 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: colors.text.primary, fontWeight: '500', outlineStyle: 'none' },
  eyeBtn: { padding: 4 },
  primaryBtn: {
    backgroundColor: colors.gold.bright, flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', padding: 18, borderRadius: 14, marginTop: 8, height: 56,
    shadowColor: colors.gold.bright, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  primaryBtnText: { color: colors.bg.deep, fontSize: 16, fontWeight: '800', marginRight: 8 },
  forgotBtn: { alignSelf: 'center', marginTop: 16 },
  forgotText: { color: colors.gold.pure, fontWeight: '600', fontSize: 14 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divider: { flex: 1, height: 1, backgroundColor: colors.border.gold },
  dividerText: { marginHorizontal: 16, color: colors.text.muted, fontSize: 13, fontWeight: '600' },
  googleBtn: {
    backgroundColor: colors.bg.surface, borderWidth: 1.5, borderColor: colors.border.gold,
    padding: 16, borderRadius: 14, alignItems: 'center', height: 54, justifyContent: 'center',
  },
  googleBtnText: { color: colors.text.primary, fontSize: 15, fontWeight: '700' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  signupText: { color: colors.text.secondary, fontSize: 14 },
  signupLink: { color: colors.gold.pure, fontSize: 14, fontWeight: '700' },
  disclaimer: { fontSize: 11, color: colors.text.muted, textAlign: 'center', marginTop: 24, lineHeight: 16 },
});
