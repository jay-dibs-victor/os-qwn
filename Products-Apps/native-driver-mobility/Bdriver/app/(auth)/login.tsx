import React, { useCallback, useState } from 'react';
import { Alert, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuthStore } from '@/store/auth';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import {
  AuthActionButton,
  AuthField,
  AuthFlowShell,
  GoogleGlyph,
  OrDivider,
  authColors,
} from '@/ui/AuthFlow';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);
  const loading = useAuthStore(s => s.loading);
  const storeError = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);
  const { signIn: googleSignIn, loading: googleLoading } = useGoogleSignIn();

  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const canContinue = !!email.trim() && !!password;

  const handleBackPress = useCallback(() => {
    if (emailMode) {
      setEmailMode(false);
      return true;
    }

    if (router.canGoBack()) {
      router.back();
      return true;
    }

    router.replace('/(auth)/auth-choice');
    return true;
  }, [emailMode, router]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }, [handleBackPress])
  );

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    let coords: { lat?: number; lng?: number } = {};
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      }
    } catch {}

    const result = await login(email.trim(), password, coords);
    if (result.success) {
      router.replace('/(app)/vetting-pending');
    } else if (result.requiresVerification) {
      router.push({ pathname: '/(auth)/verify', params: { email: email.trim() } });
    } else {
      Alert.alert('Error', result.error || 'Account does not exist');
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await googleSignIn();
    if (result.success) {
      router.replace('/(app)/vetting-pending');
    } else {
      Alert.alert('Error', result.error || 'Google sign-in failed');
    }
  };

  const footerElement = emailMode ? (
    <View style={{ gap: 14 }} collapsable={false}>
      <AuthActionButton
        variant="primary"
        onPress={handleLogin}
        disabled={loading || !canContinue}
        style={styles.continueButton}
        textStyle={styles.continueText}
      >
        {loading ? 'Please wait...' : 'Continue'}
      </AuthActionButton>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create a new account"
        onPress={() => router.push('/(auth)/register')}
        disabled={loading}
        hitSlop={8}
        style={styles.signupPrompt}
      >
        <Text style={styles.signupText}>
          Don&apos;t have an account? <Text style={styles.signupLink}>Sign up</Text>
        </Text>
      </Pressable>
    </View>
  ) : undefined;

  return (
    <AuthFlowShell
      title="Log in to your account"
      scroll
      onBackPress={handleBackPress}
      subtitle={
        <>
          By signing up you are agreeing to our{' '}
          <Text style={styles.link} onPress={() => router.push('/(auth)/terms-and-conditions')}>
            terms and conditions
          </Text>{' '}
          and{' '}
          <Text style={styles.link} onPress={() => router.push('/(auth)/privacy-policy')}>
            privacy policy
          </Text>
          .
        </>
      }
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

      <AuthActionButton
        variant="google"
        icon={<GoogleGlyph />}
        onPress={handleGoogleSignIn}
        disabled={googleLoading || loading}
        style={styles.socialButton}
      >
        {googleLoading ? 'Signing in...' : 'Continue with Google'}
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
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="password"
            editable={!loading}
            trailing={
              <Pressable hitSlop={12} onPress={() => setShowPassword(v => !v)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={31} color="rgba(255,255,255,0.68)" />
              </Pressable>
            }
          />

          <Pressable onPress={() => router.push('/(auth)/forgot-password')} disabled={loading} hitSlop={8}>
            <Text style={styles.forgot}>Forgot password?</Text>
          </Pressable>
        </View>
      )}
    </AuthFlowShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingBottom: 34,
  },
  link: {
    color: authColors.text,
    fontWeight: '800',
    textDecorationLine: 'underline',
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
  socialButton: {
    marginTop: 4,
  },
  emailChoice: {
    marginTop: 24,
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
  forgot: {
    color: authColors.primary,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'right',
    marginTop: -8,
  },
  continueButton: {
    minHeight: 66,
    marginTop: 10,
    marginBottom: 34,
    backgroundColor: '#FFB800',
  },
  continueText: {
    fontSize: 20,
  },
  signupPrompt: {
    alignSelf: 'center',
    paddingVertical: 8,
    marginBottom: 18,
  },
  signupText: {
    color: authColors.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  signupLink: {
    color: '#FFB800',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
