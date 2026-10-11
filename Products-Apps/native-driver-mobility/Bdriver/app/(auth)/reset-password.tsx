import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { AuthField, AuthActionButton, AuthFlowShell, authColors } from '@/ui/AuthFlow';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email: paramEmail } = useLocalSearchParams<{ email?: string }>();

  const resetPassword = useAuthStore(s => s.resetPassword);
  const loading = useAuthStore(s => s.loading);

  const [email, setEmail] = useState(paramEmail ? String(paramEmail) : '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    setError(null);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!code.trim() || code.trim().length !== 6) {
      setError('Enter the 6-digit reset code');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await resetPassword(email.trim(), code.trim(), password);

    if (result.success) {
      Alert.alert('Success', 'Password reset successfully');
      router.replace('/(auth)/login');
    } else {
      setError(result.error ?? 'Failed to reset password. Please try again.');
    }
  };

  const footerElement = (
    <View style={{ gap: 14 }} collapsable={false}>
      <AuthActionButton
        variant="primary"
        onPress={handleReset}
        disabled={loading}
        style={[styles.primaryBtn, { backgroundColor: authColors.primary, borderColor: authColors.primary }]}
        textStyle={{ color: '#111111' }}
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </AuthActionButton>

      <Pressable
        onPress={() => router.push('/(auth)/login')}
        hitSlop={10}
        style={styles.backRow}
      >
        <Ionicons name="arrow-back-outline" size={18} color={authColors.muted} />
        <Text style={styles.backText}>Back to login</Text>
      </Pressable>
    </View>
  );

  return (
    <AuthFlowShell
      title="Reset Password"
      subtitle="Enter the 6-digit code sent to your email and your new password."
      scroll
      contentStyle={styles.content}
      footer={footerElement}
    >
      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={20} color={authColors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <AuthField
        label="Email address"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <AuthField
        label="Reset code"
        placeholder="Enter 6-digit code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        editable={!loading}
      />

      <AuthField
        label="New password"
        placeholder="Enter new password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        editable={!loading}
        trailing={
          <Pressable hitSlop={12} onPress={() => setShowPassword(v => !v)}>
            <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={31} color="rgba(255,255,255,0.68)" />
          </Pressable>
        }
      />

      <AuthField
        label="Confirm password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showPassword}
        editable={!loading}
      />
    </AuthFlowShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
    gap: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,87,87,0.35)',
    backgroundColor: 'rgba(255,87,87,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  errorText: {
    flex: 1,
    color: authColors.danger,
    fontSize: 15,
    lineHeight: 21,
  },
  primaryBtn: {
    minHeight: 64,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
  },
  backText: {
    color: authColors.muted,
    fontSize: 16,
    fontWeight: '600',
  },
});
