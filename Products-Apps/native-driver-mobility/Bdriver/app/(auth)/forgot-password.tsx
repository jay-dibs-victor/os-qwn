import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { AuthField, AuthActionButton, AuthFlowShell, authColors } from '@/ui/AuthFlow';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const forgotPassword = useAuthStore(s => s.forgotPassword);
  const loading = useAuthStore(s => s.loading);

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    const result = await forgotPassword(email.trim());
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error ?? 'Something went wrong. Please try again.');
    }
  };

  // ── Sent state ────────────────────────────────────────────────
  if (sent) {
    return (
      <AuthFlowShell
        title="Check your email"
        subtitle={`We sent a reset code to ${email}`}
        scroll
        contentStyle={styles.content}
      >
        <View style={styles.successCard}>
          <View style={styles.successIconWrap}>
            <Ionicons name="mail-outline" size={44} color={authColors.primary} />
          </View>
          <Text style={styles.successHeadline}>Reset code sent</Text>
          <Text style={styles.successBody}>
            Open the email and copy the 6-digit code, then tap the button below to set a new password.
          </Text>
        </View>

        <AuthActionButton
          variant="primary"
          onPress={() => router.push({ pathname: '/(auth)/reset-password', params: { email: email.trim() } })}
          style={styles.primaryBtn}
        >
          Enter reset code
        </AuthActionButton>

        <Pressable
          onPress={() => { setSent(false); setEmail(''); }}
          hitSlop={10}
          style={styles.retryRow}
        >
          <Ionicons name="arrow-back-outline" size={18} color={authColors.muted} />
          <Text style={styles.retryText}>Try a different email</Text>
        </Pressable>
      </AuthFlowShell>
    );
  }

  // ── Email entry state ─────────────────────────────────────────
  return (
    <AuthFlowShell
      title="Forgot password?"
      subtitle="Enter the email on your account and we'll send a reset code."
      scroll
      contentStyle={styles.content}
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
        autoComplete="email"
        editable={!loading}
      />

      <AuthActionButton
        variant="primary"
        onPress={handleSend}
        disabled={loading || !email.trim()}
        style={[styles.primaryBtn, { backgroundColor: authColors.primary, borderColor: authColors.primary }]}
        textStyle={{ color: '#111111' }}
      >
        {loading ? 'Sending…' : 'Send reset code'}
      </AuthActionButton>

      <Pressable
        onPress={() => router.push('/(auth)/login')}
        hitSlop={10}
        style={styles.retryRow}
      >
        <Ionicons name="arrow-back-outline" size={18} color={authColors.muted} />
        <Text style={styles.retryText}>Back to login</Text>
      </Pressable>
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
    marginTop: 6,
  },
  retryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: 8,
  },
  retryText: {
    color: authColors.muted,
    fontSize: 16,
    fontWeight: '600',
  },
  // ── Success state
  successCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.22)',
    backgroundColor: 'rgba(255,184,0,0.07)',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginTop: 8,
  },
  successIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,184,0,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successHeadline: {
    color: authColors.text,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },
  successBody: {
    color: authColors.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
