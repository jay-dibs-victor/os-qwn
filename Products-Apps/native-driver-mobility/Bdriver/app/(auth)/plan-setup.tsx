import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthActionButton, AuthFlowShell, authColors } from '@/ui/AuthFlow';

const planItems = [
  {
    icon: 'calendar-outline',
    title: 'Set your availability',
    body: 'Tell Queens when you usually want to receive ride, delivery, and scheduled work opportunities.',
  },
  {
    icon: 'car-sport-outline',
    title: 'Choose work preferences',
    body: 'You can later tune whether you prefer city rides, airport pickups, courier jobs, or mixed requests.',
  },
  {
    icon: 'notifications-outline',
    title: 'Prepare for next steps',
    body: 'Plan setup is optional now. Your documents will still continue through review if you skip it.',
  },
];

export default function PlanSetupScreen() {
  const router = useRouter();

  return (
    <AuthFlowShell
      title="Plan setup"
      subtitle="Optional preferences to help Queens prepare your driver account."
      scroll
      contentStyle={styles.shellContent}
    >
      <View style={styles.noticeCard}>
        <View style={styles.noticeIcon}>
          <Ionicons name="sparkles-outline" size={36} color="#111111" />
        </View>
        <Text style={styles.noticeTitle}>This step is optional</Text>
        <Text style={styles.noticeCopy}>
          Your verification is already submitted. You can add plan preferences now or return after Queens contacts you.
        </Text>
      </View>

      <View style={styles.list}>
        {planItems.map(item => (
          <View key={item.title} style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={22} color={authColors.primary} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowBody}>{item.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.spacer} />

      <AuthActionButton
        variant="primary"
        onPress={() => router.push('/(auth)/subscriber-plans')}
        style={styles.primaryButton}
        textStyle={styles.primaryText}
      >
        Proceed
      </AuthActionButton>

      <AuthActionButton
        variant="dark"
        onPress={() => router.replace('/(auth)/login')}
        style={styles.secondaryButton}
        textStyle={styles.secondaryText}
      >
        Skip plan setup
      </AuthActionButton>
    </AuthFlowShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingBottom: 34,
  },
  noticeCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.24)',
    backgroundColor: 'rgba(255,184,0,0.1)',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  noticeIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: authColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  noticeTitle: {
    color: authColors.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    textAlign: 'center',
    marginBottom: 10,
  },
  noticeCopy: {
    color: authColors.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  list: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#1B1B1B',
    padding: 18,
    marginTop: 24,
    gap: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,184,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    color: authColors.text,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 23,
  },
  rowBody: {
    color: authColors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  spacer: {
    height: 48,
  },
  primaryButton: {
    minHeight: 66,
    backgroundColor: authColors.primary,
  },
  primaryText: {
    fontSize: 19,
    color: '#000000',
  },
  secondaryButton: {
    minHeight: 58,
    marginTop: 12,
  },
  secondaryText: {
    color: authColors.text,
    fontSize: 17,
  },
});
