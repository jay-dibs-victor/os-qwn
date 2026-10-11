import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthActionButton, AuthFlowShell, authColors } from '@/ui/AuthFlow';

export default function ProfileSavedScreen() {
  const router = useRouter();

  return (
    <AuthFlowShell
      title="Congratulations"
      subtitle="Your profile has been saved successfully."
      contentStyle={styles.shellContent}
      showBack={false}
      scroll
    >
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark" size={54} color="#111111" />
        </View>

        <Text style={styles.headline}>Profile saved</Text>
        <Text style={styles.copy}>
          But you will have to complete your driver verification by uploading all driver documents to be considered
          and made eligible to use Queens Driver App.
        </Text>
      </View>

      <View style={styles.requirements}>
        <Requirement label="Driver license and identity proof" />
        <Requirement label="Address and vehicle documents" />
        <Requirement label="Interior and exterior vehicle media" />
      </View>

      <View style={styles.spacer} />

      <AuthActionButton
        variant="primary"
        onPress={() => router.push('/(auth)/driver-verification')}
        style={styles.proceedButton}
        textStyle={styles.proceedText}
      >
        Proceed
      </AuthActionButton>
    </AuthFlowShell>
  );
}

function Requirement({ label }: { label: string }) {
  return (
    <View style={styles.requirement}>
      <View style={styles.requirementIcon}>
        <Ionicons name="document-text-outline" size={20} color={authColors.primary} />
      </View>
      <Text style={styles.requirementText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingBottom: 34,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.24)',
    backgroundColor: 'rgba(255,184,0,0.1)',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginTop: 8,
  },
  iconWrap: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: authColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  headline: {
    color: authColors.text,
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 31,
    textAlign: 'center',
    marginBottom: 12,
  },
  copy: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  requirements: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#1B1B1B',
    padding: 18,
    marginTop: 24,
    gap: 14,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,184,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementText: {
    flex: 1,
    color: authColors.text,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  spacer: {
    height: 56,
  },
  proceedButton: {
    minHeight: 66,
    backgroundColor: authColors.primary,
  },
  proceedText: {
    fontSize: 20,
    color: '#000000',
  },
});
