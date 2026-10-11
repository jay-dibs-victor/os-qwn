import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/ui/Screen';
import { PrimaryButton } from '../../src/ui/PrimaryButton';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/auth';

const POLL_INTERVAL_MS = 30_000;

export default function VettingPendingScreen() {
  const refreshDriverOnboardingStatus = useAuthStore(s => s.refreshDriverOnboardingStatus);
  const loading = useAuthStore(s => s.loading);
  const storeError = useAuthStore(s => s.error);
  const user = useAuthStore(s => s.user);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const result = await refreshDriverOnboardingStatus();
      if (cancelled) return;
      if (result.success) setLastChecked(new Date());
    };
    void tick();
    pollRef.current = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [refreshDriverOnboardingStatus]);

  const statusLabel = (() => {
    if (user?.adminVerified) return 'Approved — you may start driving.';
    if (user?.vettingStatus === 'REJECTED') return 'Application rejected. Please contact support.';
    return 'Verification in progress';
  })();

  return (
    <Screen style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark-outline" size={44} color="#111111" />
        </View>
        <Text style={styles.title}>{statusLabel}</Text>
        <Text style={styles.subtitle}>
          You will be notified if your driver verification is successful or if any requirement is needed before
          concluding your onboarding.
        </Text>

        {!!lastChecked && (
          <Text style={styles.metaText}>
            Last checked {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}

        {!!storeError && <Text style={styles.error}>{storeError}</Text>}

        <PrimaryButton
          onPress={async () => {
            const result = await refreshDriverOnboardingStatus();
            if (result.success) setLastChecked(new Date());
          }}
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Refresh status'}
        </PrimaryButton>

        {user?.adminVerified && (
          <PrimaryButton onPress={() => router.replace('/(app)/dashboard')}>
            Continue to dashboard
          </PrimaryButton>
        )}

        {__DEV__ && (
          <Pressable
            onPress={() => router.replace('/(app)/dashboard')}
            style={({ pressed }) => [styles.devBypass, pressed && styles.devBypassPressed]}
          >
            <Ionicons name="bug-outline" size={16} color={colors.danger} />
            <Text style={styles.devBypassText}>Dev Bypass → Dashboard</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    gap: 14,
    alignItems: 'stretch',
  },
  iconWrap: {
    alignSelf: 'center',
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  devBypass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${colors.danger}44`,
    backgroundColor: `${colors.danger}0A`,
  },
  devBypassPressed: {
    opacity: 0.7,
  },
  devBypassText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '800',
  },
});
