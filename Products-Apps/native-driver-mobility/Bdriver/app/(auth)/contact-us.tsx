import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthFlowShell, authColors } from '@/ui/AuthFlow';

export default function ContactUsScreen() {
  return (
    <AuthFlowShell
      title="Contact Us"
      subtitle="Queens support is here for driver onboarding and account help."
      scroll
      contentStyle={styles.shellContent}
    >
      <View style={styles.heroCard}>
        <View style={styles.iconWrapLarge}>
          <Ionicons name="headset-outline" size={44} color="#111111" />
        </View>
        <Text style={styles.heroTitle}>Need help getting started?</Text>
        <Text style={styles.heroCopy}>
          Reach out for support with registration, document upload, account access, or verification updates.
        </Text>
      </View>

      <View style={styles.contactCard}>
        <ContactRow icon="mail-outline" label="Email" value="support@queensdriver.com" />
        <ContactRow icon="call-outline" label="Phone" value="+1 (555) 010-2040" />
        <ContactRow icon="time-outline" label="Support hours" value="Monday to Friday, 9:00 AM - 6:00 PM" />
      </View>

      <Text style={styles.note}>
        If your verification is already submitted, please include the email or phone number used for registration when
        contacting support.
      </Text>
    </AuthFlowShell>
  );
}

function ContactRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.contactRow}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={22} color={authColors.primary} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingBottom: 34,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.24)',
    backgroundColor: 'rgba(255,184,0,0.1)',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  iconWrapLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: authColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  heroTitle: {
    color: authColors.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    textAlign: 'center',
    marginBottom: 10,
  },
  heroCopy: {
    color: authColors.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  contactCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#1B1B1B',
    padding: 18,
    marginTop: 24,
    gap: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  rowLabel: {
    color: authColors.text,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
  },
  rowValue: {
    color: authColors.muted,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 2,
  },
  note: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 22,
  },
});
