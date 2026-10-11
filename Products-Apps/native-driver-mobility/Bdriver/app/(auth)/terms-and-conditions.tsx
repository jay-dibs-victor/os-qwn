import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthFlowShell, authColors } from '@/ui/AuthFlow';

const terms = [
  {
    title: 'Driver eligibility',
    body: 'Queens drivers must provide accurate registration details, valid identification, vehicle information, and documents requested during onboarding.',
  },
  {
    title: 'Account responsibility',
    body: 'You are responsible for keeping your login details secure and for all activity performed through your driver account.',
  },
  {
    title: 'Safe service standards',
    body: 'Drivers are expected to follow local transport rules, maintain professional conduct, and complete rides or delivery work with care.',
  },
  {
    title: 'Document review',
    body: 'Submitted documents may be reviewed by Queens before access to driver services is approved, limited, paused, or declined.',
  },
  {
    title: 'Platform updates',
    body: 'Queens may update app features, driver requirements, or operating policies to improve safety, reliability, and compliance.',
  },
];

export default function TermsAndConditionsScreen() {
  return (
    <AuthFlowShell
      title="Terms and Conditions"
      subtitle="Please review the standards for using Queens Driver."
      scroll
      contentStyle={styles.shellContent}
    >
      <View style={styles.card}>
        {terms.map(item => (
          <InfoBlock key={item.title} icon="document-text-outline" title={item.title} body={item.body} />
        ))}
      </View>

      <Text style={styles.note}>
        These terms are a driver-facing summary. Queens may provide additional agreements or notices during onboarding,
        review, and active service.
      </Text>
    </AuthFlowShell>
  );
}

function InfoBlock({ icon, title, body }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }) {
  return (
    <View style={styles.block}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={authColors.primary} />
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
