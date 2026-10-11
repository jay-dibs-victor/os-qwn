import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDriverStore } from '../../../src/store/driver';
import { useAuth } from '../../../src/hooks/useAuth';
import { colors } from '../../../src/theme/colors';

const QUICK_ACTIONS = [
  { icon: 'card', label: 'My Vehicle', route: '/settings/my-vehicle' },
  { icon: 'document-text', label: 'Documents', route: '/settings/personal-document' },
  { icon: 'wallet', label: 'Wallet', route: '/wallet' },
  { icon: 'help-buoy', label: 'Help & SOS', route: '/settings' },
] as const;

export default function ProfileScreen() {
  const profile = useDriverStore(s => s.profile);
  const { logout } = useAuth();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PROFILE</Text>
            <Text style={styles.title}>{profile.first_name} {profile.last_name}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityLabel="Open settings"
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="settings-sharp" size={18} color="#0F1A2B" />
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
            </Text>
            <View style={styles.verifiedDot}>
              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.name}>{profile.first_name} {profile.last_name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
          <View style={styles.tierRow}>
            <Ionicons name="diamond" size={12} color="#0F1A2B" />
            <Text style={styles.tierText}>{profile.tier} Driver · {profile.rating.toFixed(1)}★</Text>
            <View style={styles.statusChip}>
              <View style={[styles.statusDot, { backgroundColor: profile.is_online ? '#219653' : '#A0AEC0' }]} />
              <Text style={styles.statusText}>{profile.is_online ? 'Online' : 'Offline'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatBlock label="Total trips" value={`${profile.total_trips}`} />
          <StatBlock label="Total earnings" value={`$${profile.total_earnings.toFixed(0)}`} accent={colors.primary} />
          <StatBlock label="Years" value={`${profile.years_on_platform}`} />
        </View>

        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>VEHICLE</Text>
        </View>
        <View style={styles.cardRow}>
          <View style={styles.vehicleIcon}>
            <Ionicons name="car-sport" size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.vehicleTitle}>{profile.vehicle.make} {profile.vehicle.model}</Text>
            <Text style={styles.vehicleSubtitle}>
              {profile.vehicle.color} · {profile.vehicle.plate}
            </Text>
            <Text style={styles.vehicleYear}>
              {profile.vehicle.year} · {profile.vehicle.type.toUpperCase()}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#A0AEC0" />
        </View>

        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>DOCUMENTS</Text>
        </View>
        <View style={styles.card}>
          <DocumentRow
            icon="card"
            label="Driver's License"
            status={profile.documents.license.status}
            expires={profile.documents.license.expires}
          />
          <View style={styles.divider} />
          <DocumentRow
            icon="shield-checkmark"
            label="Insurance"
            status={profile.documents.insurance.status}
            expires={profile.documents.insurance.expires}
          />
          <View style={styles.divider} />
          <DocumentRow
            icon="medkit"
            label="Medical Certificate"
            status={profile.documents.medical.status}
            expires={profile.documents.medical.expires}
          />
        </View>

        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>QUICK ACTIONS</Text>
        </View>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map(action => (
            <Pressable
              key={action.label}
              onPress={() => router.push(action.route)}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={({ pressed }) => [styles.quickTile, pressed && { opacity: 0.85 }]}
            >
              <View style={styles.quickIcon}>
                <Ionicons name={action.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={async () => {
            await logout();
          }}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.9 }]}
        >
          <Ionicons name="log-out" size={16} color="#FF3B47" />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBlock({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={[styles.statValue, accent ? { color: accent } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DocumentRow({
  icon,
  label,
  status,
  expires,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  status: 'verified' | 'pending' | 'expired' | 'missing';
  expires: string;
}) {
  const colorMap: Record<typeof status, string> = {
    verified: '#219653',
    pending: colors.primary,
    expired: '#FF3B47',
    missing: '#A0AEC0',
  };
  const bgMap: Record<typeof status, string> = {
    verified: 'rgba(33,150,83,0.16)',
    pending: 'rgba(255,184,0,0.16)',
    expired: 'rgba(255,59,71,0.16)',
    missing: 'rgba(160,174,192,0.16)',
  };
  return (
    <View style={styles.docRow}>
      <View style={styles.docIcon}>
        <Ionicons name={icon} size={18} color="#0F1A2B" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.docLabel}>{label}</Text>
        <Text style={styles.docExpires}>Expires {expires}</Text>
      </View>
      <View style={[styles.docStatus, { backgroundColor: bgMap[status] }]}>
        <Text style={[styles.docStatusText, { color: colorMap[status] }]}>
          {status.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scroll: {
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    color: '#0F1A2B',
    fontSize: 26,
    fontWeight: '900',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#219653',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    color: '#0F1A2B',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 14,
  },
  email: {
    color: '#718096',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: 'rgba(255,184,0,0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tierText: {
    color: '#0F1A2B',
    fontSize: 12,
    fontWeight: '800',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 4,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(15,26,43,0.16)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: '#0F1A2B',
    fontSize: 11,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 18,
  },
  statBlock: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
  },
  statValue: {
    color: '#0F1A2B',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: '#718096',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 8,
  },
  sectionTitleText: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0F1A2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleTitle: {
    color: '#0F1A2B',
    fontSize: 15,
    fontWeight: '900',
  },
  vehicleSubtitle: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  vehicleYear: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
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
    width: 40,
    height: 40,
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
  docStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  docStatusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
  },
  quickTile: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,184,0,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    color: '#0F1A2B',
    fontSize: 13,
    fontWeight: '800',
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 22,
    padding: 16,
    borderRadius: 16,
  },
  signOutText: {
    color: '#FF3B47',
    fontSize: 14,
    fontWeight: '900',
  },
  spacer: {
    height: 40,
  },
});
