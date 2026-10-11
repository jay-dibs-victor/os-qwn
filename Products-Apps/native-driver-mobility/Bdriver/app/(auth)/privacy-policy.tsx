import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthFlowShell, authColors } from '@/ui/AuthFlow';

const privacyItems = [
  {
    title: 'Information we collect',
    body: 'We collect account details, contact information, driver verification documents, app activity, and information needed to support trips and deliveries.',
  },
  {
    title: 'How information is used',
    body: 'Your information helps us verify driver eligibility, operate the Queens Driver app, support customers, prevent misuse, and improve platform reliability.',
  },
  {
    title: 'Document handling',
    body: 'Documents submitted during onboarding are used for review and may be shared with authorized review teams or service providers where needed.',
  },
  {
    title: 'Contact preferences',
    body: 'Queens may contact you by phone or email about onboarding, verification, account support, and important driver updates.',
  },
  {
    title: 'Security',
    body: 'We use reasonable safeguards to protect driver information, but you should also keep your account credentials private and secure.',
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <AuthFlowShell
      title="Privacy Policy"
      subtitle="How Queens Driver handles your information."
      scroll
      contentStyle={styles.shellContent}
    >
      <View style={styles.card}>
        {privacyItems.map(item => (
          <InfoBlock key={item.title} title={item.title} body={item.body} />
        ))}
      </View>

      <Text style={styles.note}>
        You can contact Queens support if you need help with your account information or driver verification details.
      </Text>
    </AuthFlowShell>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.block}>
      <View style={styles.iconWrap}>
        <Ionicons name="shield-checkmark-outline" size={22} color={authColors.primary} />
      </View>
      <View style={styles.blockCopy}>
        <Text style={styles.blockTitle}>{title}</Text>
        <Text style={styles.blockBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingBottom: 34,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#1B1B1B',
    padding: 18,
    gap: 18,
  },
  block: {
    flexDirection: 'row',
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,184,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockCopy: {
    flex: 1,
  },
  blockTitle: {
    color: authColors.text,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 23,
  },
  blockBody: {
    color: authColors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  note: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 22,
  },
});
