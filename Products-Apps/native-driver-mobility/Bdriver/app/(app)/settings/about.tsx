import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../../src/theme/colors';

const VERSION = '1.0.0';
const BUILD = '2026.06.02';

type AboutRow = {
  label: string;
  value?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  route?: string;
};

const sections: { title: string; rows: AboutRow[] }[] = [
  {
    title: 'About Bdriver',
    rows: [
      { label: 'Version', value: VERSION },
      { label: 'Build', value: BUILD },
      { label: 'Region', value: 'Sub-Saharan Africa' },
    ],
  },
  {
    title: 'Support',
    rows: [
      { label: 'Help center', icon: 'help-circle', route: '/contact-us' },
      { label: 'Contact us', icon: 'mail', route: '/contact-us' },
      { label: 'Send feedback', icon: 'chatbubbles', route: '/contact-us' },
    ],
  },
  {
    title: 'Legal',
    rows: [
      { label: 'Terms & Conditions', icon: 'document-text', route: '/terms-and-conditions' },
      { label: 'Privacy Policy', icon: 'lock-closed', route: '/privacy-policy' },
    ],
  },
];

export default function AboutScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ABOUT</Text>
          <Text style={styles.title}>About Bdriver</Text>
        </View>

        <View style={styles.brandCard}>
          <View style={styles.brandIcon}>
            <Ionicons name="car-sport" size={26} color="#0F1A2B" />
          </View>
          <Text style={styles.brandTitle}>Bdriver</Text>
          <Text style={styles.brandSubtitle}>
            Premium mobility partner platform for drivers who want to earn on their own terms.
          </Text>
        </View>

        {sections.map((section, sIdx) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
            <View style={styles.card}>
              {section.rows.map((row, rIdx) => (
                <View key={row.label}>
                  <Pressable
                    disabled={!row.route}
                    onPress={() => row.route && router.push(row.route as never)}
                    style={({ pressed }) => [
                      styles.row,
                      pressed && row.route ? { opacity: 0.85 } : null,
                    ]}
                    accessibilityRole={row.route ? 'button' : 'text'}
                    accessibilityLabel={row.label}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowLabel}>{row.label}</Text>
                    </View>
                    {row.icon && (
                      <Ionicons
                        name={row.icon as keyof typeof Ionicons.glyphMap}
                        size={16}
                        color="#A0AEC0"
                        style={{ marginRight: 8 }}
                      />
                    )}
                    {row.value && <Text style={styles.rowValue}>{row.value}</Text>}
                    {row.route && <Ionicons name="chevron-forward" size={16} color="#A0AEC0" />}
                  </Pressable>
                  {rIdx < section.rows.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.footer}>© 2026 Bdriver by Queens Mobility. All rights reserved.</Text>
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
  brandCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 22,
    padding: 22,
    borderRadius: 22,
    alignItems: 'center',
  },
  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#0F1A2B',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 12,
  },
  brandSubtitle: {
    color: '#718096',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 22,
  },
  sectionTitle: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  rowLabel: {
    color: '#0F1A2B',
    fontSize: 14,
    fontWeight: '800',
  },
  rowValue: {
    color: '#718096',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 12,
  },
  footer: {
    textAlign: 'center',
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 24,
    paddingHorizontal: 20,
  },
});
