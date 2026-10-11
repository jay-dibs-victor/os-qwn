import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDriverStore } from '../../../src/store/driver';
import { colors } from '../../../src/theme/colors';

export default function MyProfileScreen() {
  const profile = useDriverStore(s => s.profile);

  const rows: { label: string; value: string; editable: boolean }[] = [
    { label: 'First name', value: profile.first_name, editable: true },
    { label: 'Last name', value: profile.last_name, editable: true },
    { label: 'Email', value: profile.email, editable: true },
    { label: 'Phone', value: profile.phone, editable: true },
    { label: 'City', value: profile.city, editable: true },
    { label: 'Address', value: profile.address, editable: true },
    { label: 'Date of birth', value: profile.date_of_birth, editable: true },
    { label: 'Referral code', value: profile.referral_code, editable: false },
  ];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>PROFILE</Text>
          <Text style={styles.title}>My profile</Text>
        </View>

        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
            </Text>
            <View style={styles.camera}>
              <Ionicons name="camera" size={14} color="#0F1A2B" />
            </View>
          </View>
          <Text style={styles.avatarName}>{profile.first_name} {profile.last_name}</Text>
          <Text style={styles.avatarSubtitle}>{profile.tier} Driver · {profile.rating.toFixed(1)}★</Text>
        </View>

        <View style={styles.card}>
          {rows.map((row, i) => (
            <View key={row.label}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.rowValue}>{row.value}</Text>
                </View>
                {row.editable && (
                  <Ionicons name="create-outline" size={16} color="#A0AEC0" />
                )}
              </View>
              {i < rows.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
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
  avatarCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 22,
    padding: 22,
    borderRadius: 22,
    alignItems: 'center',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    color: '#0F1A2B',
    fontSize: 30,
    fontWeight: '900',
  },
  camera: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0F1A2B',
  },
  avatarName: {
    color: '#0F1A2B',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
  },
  avatarSubtitle: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 18,
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
    color: '#718096',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  rowValue: {
    color: '#0F1A2B',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 12,
  },
});
