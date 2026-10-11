import React, { useEffect, useRef, useState } from 'react';
import { Animated, Alert, Dimensions, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { AuthActionButton, AuthFlowShell, authColors } from '@/ui/AuthFlow';

const CODE_LENGTH = 6;
const MOCK_OTP = '482019';

export default function VerifyScreen() {
  const router = useRouter();
  const { email, password } = useLocalSearchParams<{ email?: string; password?: string }>();
  
  const verifyCode = useAuthStore(s => s.verifyCode);
  const resendCode = useAuthStore(s => s.resendCode);
  const loading = useAuthStore(s => s.loading);
  const hiddenInput = useRef<TextInput>(null);

  const [code, setCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Premium Notification Sensor simulation
  const [showToast, setShowToast] = useState(false);
  const toastY = useRef(new Animated.Value(-120)).current;
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const timer = resendTimer > 0 ? setTimeout(() => setResendTimer(value => value - 1), 1000) : undefined;
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendTimer]);

  // Simulate SMS/Email incoming sensor (Requirement 2)
  useEffect(() => {
    const sensorTimer = setTimeout(() => {
      // Trigger notification drop down
      setToastMessage(`📨 Queens Verification\nYour verification code is ${MOCK_OTP}. Auto-picking code...`);
      setShowToast(true);

      Animated.spring(toastY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }).start();

      // Typing animation simulation
      let currentString = '';
      MOCK_OTP.split('').forEach((char, index) => {
        setTimeout(() => {
          currentString += char;
          setCode(currentString);
        }, 800 + index * 180);
      });

      // Auto verify trigger
      setTimeout(() => {
        // Hide notification toast
        Animated.timing(toastY, {
          toValue: -150,
          duration: 350,
          useNativeDriver: true,
        }).start(() => setShowToast(false));
      }, 3500);

    }, 2200);

    return () => clearTimeout(sensorTimer);
  }, []);

  const handleVerify = async () => {
    if (!email) {
      Alert.alert('Error', 'Email is missing');
      return;
    }

    if (code.length !== CODE_LENGTH) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    const result = await verifyCode(String(email), code);
    if (result.success) {
      // Navigate to Setup Account (Category selection screen) on success (Requirement 2)
      router.replace({
        pathname: '/(auth)/setup-account',
        params: { email: String(email), password: String(password) },
      });
      return;
    }

    Alert.alert('Error', result.error || 'Verification failed');
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Error', 'Email is missing');
      return;
    }

    const result = await resendCode(String(email));
    if (result.success) {
      setResendTimer(60);
      Alert.alert('Success', 'Verification code sent to your email');
      return;
    }

    Alert.alert('Error', result.error || 'Could not resend code');
  };

  const footerElement = (
    <AuthActionButton
      variant="primary"
      onPress={handleVerify}
      disabled={loading || code.length !== CODE_LENGTH}
      style={styles.createButton}
      textStyle={styles.createText}
    >
      {loading ? 'Verifying...' : 'Verify Code'}
    </AuthActionButton>
  );

  return (
    <AuthFlowShell
      title="Verify Your Email"
      subtitle={
        <>
          We sent a verification code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </>
      }
      contentStyle={styles.shellContent}
      footer={footerElement}
    >
      {/* Premium SMS Toast Notification overlay */}
      {showToast && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastY }] }]}>
          <View style={styles.toastCard}>
            <View style={styles.toastIcon}>
              <Ionicons name="mail-unread" size={24} color="#111111" />
            </View>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}

      <Pressable style={styles.codeRow} onPress={() => hiddenInput.current?.focus()}>
        {Array.from({ length: CODE_LENGTH }).map((_, index) => (
          <View key={index} style={[styles.codeBox, code.length === index && styles.codeBoxFocused]}>
            <Text style={styles.codeText}>{code[index] || ''}</Text>
          </View>
        ))}
      </Pressable>

      <TextInput
        ref={hiddenInput}
        value={code}
        onChangeText={value => setCode(value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
        keyboardType="number-pad"
        maxLength={CODE_LENGTH}
        style={styles.hiddenInput}
        autoFocus
      />

      <Pressable onPress={handleResend} disabled={loading || resendTimer > 0} style={styles.resendButton}>
        <Text style={[styles.resend, (loading || resendTimer > 0) && styles.resendDisabled]}>
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
        </Text>
      </Pressable>
    </AuthFlowShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    alignItems: 'stretch',
    paddingBottom: 34,
  },
  email: {
    color: authColors.text,
    fontWeight: '800',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 26,
  },
  codeBox: {
    flex: 1,
    aspectRatio: 0.9,
    borderRadius: 14,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  codeBoxFocused: {
    borderColor: authColors.primary,
    backgroundColor: 'rgba(255,184,0,0.06)',
  },
  codeText: {
    color: authColors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  hiddenInput: {
    position: 'absolute',
    left: -9999,
    width: 200,
    height: 80,
    opacity: 0,
  },
  resendButton: {
    alignSelf: 'flex-end',
    marginTop: 20,
  },
  resend: {
    color: authColors.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  resendDisabled: {
    color: authColors.muted,
  },
  createButton: {
    minHeight: 66,
  },
  createText: {
    fontSize: 20,
  },
  // Premium Notification sensor styles
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 20,
    left: 20,
    right: 20,
    zIndex: 9999,
    elevation: 10,
  },
  toastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    boxShadow: '0px 16px 24px #000000',
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  toastIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFB800',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    flex: 1,
    color: '#111111',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
