import React, { useCallback, useMemo, useState } from 'react';
import { Alert, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import {
  AuthActionButton,
  AuthField,
  AuthFlowShell,
  CheckBox,
  GoogleGlyph,
  OrDivider,
  Requirement,
  authColors,
} from '@/ui/AuthFlow';

export default function DriverRegisterScreen() {
  const router = useRouter();
  const loading = useAuthStore(s => s.loading);
  const storeError = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);
  const { signIn: googleSignIn, loading: googleLoading } = useGoogleSignIn();

  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const requirements = useMemo(() => ({
    length: password.length > 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }), [password]);

  const passwordValid = Object.values(requirements).every(Boolean);
  const passwordError = passwordTouched && password.length > 0 && !passwordValid
    ? 'Password must meet all requirements'
    : null;
  const normalizedEmail = email.trim().toLowerCase();
  const canContinue = !!normalizedEmail && passwordValid && agreeTerms;

  const handleBackPress = useCallback(() => {
    if (emailMode) {
      setEmailMode(false);
      return true;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(auth)/auth-choice');
  }, [emailMode, router]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }, [handleBackPress])
  );

  const handleGoogleSignUp = async () => {
    if (!agreeTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return;
    }

    const result = await googleSignIn();
    if (result.success) {
      router.replace('/(app)/dashboard');
    } else {
      Alert.alert('Error', result.error || 'Google sign-up failed');
    }
  };

  const handleSignup = () => {
    if (!normalizedEmail || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!passwordValid) {
      setPasswordTouched(true);
      Alert.alert('Error', 'Password must meet all requirements');
      return;
    }
    if (!agreeTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return;
    }

    // Go to OTP verify screen (Requirement 2)
    router.push({
      pathname: '/(auth)/verify',
      params: { email: normalizedEmail, password },
    });
  };

  const footerElement = emailMode ? (
    <AuthActionButton
      variant="primary"
      onPress={handleSignup}
      disabled={loading || !canContinue}
      style={styles.continueButton}
      textStyle={styles.continueText}
    >
      {loading ? 'Please wait...' : 'Continue'}
    </AuthActionButton>
  ) : undefined;

  return (
    <AuthFlowShell
      title="Create an account"
      scroll
      onBackPress={handleBackPress}
      contentStyle={styles.shellContent}
      footer={footerElement}
    >
      {!!storeError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>{storeError}</Text>
          <Pressable onPress={clearError} hitSlop={8}>
            <Text style={styles.errorDismiss}>Ok</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.termsPreview}>
        <Pressable onPress={() => setAgreeTerms(v => !v)} hitSlop={12}>
          <CheckBox checked={agreeTerms} />
        </Pressable>
        <Text style={styles.termsPreviewText}>
          I agree to the{' '}
          <Text style={styles.link} onPress={() => router.push('/(auth)/terms-and-conditions')}>
            Terms and Conditions
          </Text>{' '}
          and{' '}
          <Text style={styles.link} onPress={() => router.push('/(auth)/privacy-policy')}>
            Privacy Policy
          </Text>
          .
        </Text>
      </View>

      <AuthActionButton
        variant="google"
        icon={<GoogleGlyph />}
        onPress={handleGoogleSignUp}
        disabled={googleLoading || loading || !agreeTerms}
        style={styles.socialButton}
      >
        {googleLoading ? 'Signing up...' : 'Continue with Google'}
      </AuthActionButton>

      {!emailMode ? (
        <AuthActionButton
          icon={<Ionicons name="mail-outline" size={33} color={authColors.text} />}
          onPress={() => setEmailMode(true)}
          disabled={loading}
          style={styles.emailChoice}
          textStyle={styles.emailChoiceText}
        >
          Use email
        </AuthActionButton>
      ) : (
        <View style={styles.form}>
          <OrDivider />

          <AuthField
            label="Email"
            placeholder="Input your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
            icon="mail-outline"
          />

          <AuthField
            label="Password"
            placeholder="Input your password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setPasswordTouched(true);
            }}
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            editable={!loading}
            error={passwordError}
            trailing={
              <Pressable hitSlop={12} onPress={() => setShowPassword(v => !v)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={31} color="rgba(255,255,255,0.68)" />
              </Pressable>
            }
          />

          <View style={styles.requirements}>
            <Requirement met={requirements.length}>Password must be more than 8 digits</Requirement>
            <Requirement met={requirements.lower}>Make sure to add at least a lowercase letter</Requirement>
            <Requirement met={requirements.upper}>Make sure to add at least a Uppercase letter</Requirement>
            <Requirement met={requirements.special}>Make sure to add at least a special character</Requirement>
          </View>
        </View>
      )}
    </AuthFlowShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingBottom: 34,
  },
  errorBox: {
    borderWidth: 1,
    borderColor: 'rgba(255,87,87,0.45)',
    backgroundColor: 'rgba(255,87,87,0.12)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  errorBoxText: {
    flex: 1,
    color: authColors.danger,
    fontSize: 17,
    lineHeight: 24,
  },
  errorDismiss: {
    color: authColors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  termsPreview: {
    minHeight: 88,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: authColors.borderStrong,
    backgroundColor: authColors.field,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 22,
    paddingVertical: 18,
    marginBottom: 24,
  },
  termsPreviewText: {
    flex: 1,
    color: authColors.text,
    fontSize: 18,
    lineHeight: 26,
  },
  socialButton: {
    marginBottom: 24,
  },
  emailChoice: {
    minHeight: 62,
    borderRadius: 31,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: '#000000',
  },
  emailChoiceText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  form: {
    gap: 22,
  },
  requirements: {
    gap: 10,
    marginTop: -8,
  },
  safetyTerms: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: authColors.borderStrong,
    backgroundColor: authColors.field,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 18,
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  safetyText: {
    flex: 1,
    color: authColors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  link: {
    color: authColors.primary,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  continueButton: {
    minHeight: 66,
    marginTop: 18,
    marginBottom: 34,
    backgroundColor: '#FFB800',
    borderColor: '#FFB800',
  },
  continueText: {
    fontSize: 20,
  },
});
