import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDriverStore } from '../../../src/store/driver';
import { colors } from '../../../src/theme/colors';

type DocStatus = 'verified' | 'pending' | 'expired' | 'missing';

export default function PersonalDocumentScreen() {
  const docs = useDriverStore(s => s.profile.documents);

  const rows: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    status: DocStatus;
    expires: string;
  }[] = [
    { icon: 'card', label: 'Birth Certificate', status: docs.birth_certificate.status, expires: docs.birth_certificate.expires },
    { icon: 'car', label: 'Driving License', status: docs.license.status, expires: docs.license.expires },
    { icon: 'globe', label: 'Passport', status: docs.passport.status, expires: docs.passport.expires },
    { icon: 'shield-checkmark', label: 'Insurance Certificate', status: docs.insurance.status, expires: docs.insurance.expires },
    { icon: 'medkit', label: 'Medical Certificate', status: docs.medical.status, expires: docs.medical.expires },
  ];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>DOCUMENTS</Text>
          <Text style={styles.title}>Personal documents</Text>
          <Text style={styles.subtitle}>
            Keep your documents up to date so you can keep earning without interruption.
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>
              {rows.filter(r => r.status === 'verified').length}
            </Text>
            <Text style={styles.summaryLabel}>Verified</Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {rows.filter(r => r.status === 'pending').length}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={[styles.summaryValue, { color: '#FF3B47' }]}>
              {rows.filter(r => r.status === 'expired' || r.status === 'missing').length}
            </Text>
            <Text style={styles.summaryLabel}>Action needed</Text>
          </View>
        </View>

        <View style={styles.card}>
          {rows.map((row, i) => (
            <View key={row.label}>
              <View style={styles.docRow}>
                <View style={styles.docIcon}>
                  <Ionicons name={row.icon} size={20} color="#0F1A2B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docLabel}>{row.label}</Text>
                  <Text style={styles.docExpires}>Expires {row.expires}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    row.status === 'verified' && { backgroundColor: 'rgba(33,150,83,0.16)' },
                    row.status === 'pending' && { backgroundColor: 'rgba(255,184,0,0.16)' },
                    (row.status === 'expired' || row.status === 'missing') && {
                      backgroundColor: 'rgba(255,59,71,0.16)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      row.status === 'verified' && { color: '#219653' },
                      row.status === 'pending' && { color: '#0F1A2B' },
                      (row.status === 'expired' || row.status === 'missing') && { color: '#FF3B47' },
                    ]}
                  >
                    {row.status === 'missing' ? 'MISSING' : row.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              {i < rows.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Pressable
          accessibilityLabel="Continue to upload"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.ctaText}>Next</Text>
          <Ionicons name="arrow-forward" size={16} color="#0F1A2B" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scroll: {
    paddingBottom: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  eyebrow: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    color: '#0F1A2B',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: '#718096',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 22,
  },
  summaryBlock: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
  },
  summaryValue: {
    color: '#0F1A2B',
    fontSize: 22,
    fontWeight: '900',
  },
  summaryLabel: {
    color: '#718096',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 16,
    padding: 4,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docLabel: {
    color: '#0F1A2B',
    fontSize: 14,
    fontWeight: '800',
  },
  docExpires: {
    color: '#718096',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 12,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    marginTop: 22,
    padding: 16,
    borderRadius: 16,
  },
  ctaText: {
    color: '#0F1A2B',
    fontSize: 16,
    fontWeight: '900',
  },
});
