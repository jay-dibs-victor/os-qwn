import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthActionButton, AuthFlowShell, authColors } from '@/ui/AuthFlow';

export default function RegistrationSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email?: string;
    phoneNumber?: string;
    category?: string;
    country?: string;
    countryCode?: string;
    phoneCountry?: string;
    phoneCountryCode?: string;
    callingCode?: string;
  }>();

  const continueToProfile = () => {
    router.push({
      pathname: '/(auth)/profile-step-one',
      params,
    });
  };

  return (
    <AuthFlowShell
      title="Account created"
      subtitle="You have a few more onboarding steps before we conclude your registration for verification."
      contentStyle={styles.shellContent}
      scroll
    >
      <View style={styles.successCard}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark" size={52} color="#111111" />
        </View>
        <Text style={styles.cardTitle}>You are almost there</Text>
        <Text style={styles.cardCopy}>
          Next, complete your profile and onboarding details. After that, your registration will be ready for review and verification.
        </Text>
      </View>

      <View style={styles.steps}>
        <Step label="Profile setup" active />
        <Step label="Onboarding details" />
        <Step label="Verification review" />
      </View>

      <View style={styles.spacer} />

      <AuthActionButton
        variant="primary"
        onPress={continueToProfile}
        style={styles.continueButton}
        textStyle={styles.continueText}
      >
        Continue
      </AuthActionButton>
    </AuthFlowShell>
  );
}

function Step({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepDot, active && styles.stepDotActive]} />
      <Text style={[styles.stepText, active && styles.stepTextActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingBottom: 34,
  },
  successCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.24)',
    backgroundColor: 'rgba(255,184,0,0.1)',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
    marginTop: 12,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: authColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  cardTitle: {
    color: authColors.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    textAlign: 'center',
    marginBottom: 10,
  },
  cardCopy: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  steps: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#1B1B1B',
    padding: 18,
    marginTop: 24,
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  stepDotActive: {
    backgroundColor: authColors.primary,
  },
  stepText: {
    color: authColors.muted,
    fontSize: 16,
    fontWeight: '800',
  },
  stepTextActive: {
    color: authColors.text,
  },
  spacer: {
    height: 56,
  },
  continueButton: {
    minHeight: 66,
  },
  continueText: {
    fontSize: 20,
  },
});
