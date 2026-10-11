import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { colors } from '../theme/colors';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.iconRow}>
          <Shield size={32} color={colors.gold.pure} />
        </View>
        <Text style={s.lastUpdated}>Last updated: May 2026</Text>

        <Text style={s.sectionTitle}>1. Information We Collect</Text>
        <Text style={s.body}>
          Queens Premium E-Hailing Limited ("Queens," "we," "us," or "our") collects information you provide
          directly: your name, email address, phone number, and payment details. When you use our app, we
          automatically collect location data, trip history, device information, and usage data to provide and
          improve our ride-hailing service.
        </Text>

        <Text style={s.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={s.body}>
          We use your information to: facilitate ride bookings and payments, match you with nearby drivers,
          calculate fares and ETAs, send trip confirmations and receipts, provide customer support, detect and
          prevent fraud, comply with legal obligations, and improve our service through analytics.
        </Text>

        <Text style={s.sectionTitle}>3. Data Sharing</Text>
        <Text style={s.body}>
          We share your data with: drivers to fulfill your ride requests (your name, pickup location, and
          destination), payment processors (Paystack) to handle transactions, our insurance partners for
          coverage during trips, and regulatory authorities when required by law. We do not sell your personal
          data to third parties.
        </Text>

        <Text style={s.sectionTitle}>4. Data Retention</Text>
        <Text style={s.body}>
          We retain your personal data for as long as your account is active and for 6 months thereafter.
          Trip data is anonymized after 24 months. You may request deletion of your data at any time by
          contacting our support team.
        </Text>

        <Text style={s.sectionTitle}>5. Your Rights</Text>
        <Text style={s.body}>
          Under the Nigeria Data Protection Regulation (NDPR), you have the right to: access your personal
          data, correct inaccurate data, request deletion of your data, restrict or object to processing,
          and data portability. To exercise these rights, contact us at privacy@queenslagos.app.
        </Text>

        <Text style={s.sectionTitle}>6. Security</Text>
        <Text style={s.body}>
          We implement appropriate technical and organizational measures to protect your personal data,
          including encryption in transit (TLS 1.3) and at rest, access controls, and regular security
          audits. However, no method of transmission over the internet is 100% secure.
        </Text>

        <Text style={s.sectionTitle}>7. Contact</Text>
        <Text style={s.body}>
          If you have questions about this Privacy Policy or wish to exercise your data rights, contact our
          Data Protection Officer at privacy@queenslagos.app or write to: Queens Premium E-Hailing Limited,
          14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria.
        </Text>

        <View style={s.divider} />

        <Text style={s.footer}>
          By using Queens, you consent to the collection and use of your information as described in this
          policy.
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.deep },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 44, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: colors.bg.surface, borderBottomWidth: 1, borderBottomColor: colors.border.gold,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.bg.deep, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border.gold },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text.primary },
  scroll: { padding: 24, paddingBottom: 40 },
  iconRow: { alignItems: 'center', marginBottom: 12 },
  lastUpdated: { textAlign: 'center', fontSize: 12, color: colors.text.muted, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text.primary, marginTop: 20, marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 22, color: colors.text.secondary },
  divider: { height: 1, backgroundColor: colors.border.gold, marginVertical: 24, opacity: 0.3 },
  footer: { fontSize: 13, color: colors.text.muted, lineHeight: 20, textAlign: 'center', fontStyle: 'italic' },
});
