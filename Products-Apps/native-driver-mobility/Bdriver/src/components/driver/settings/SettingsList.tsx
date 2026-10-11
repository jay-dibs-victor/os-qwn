import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDriverStore } from '../../../store/driver';
import { useAuthStore } from '../../../store/auth';

type IconName = keyof typeof Ionicons.glyphMap;

export type SettingsItem = {
  key: string;
  label: string;
  icon: IconName;
  route: string;
};

export const SETTINGS_GROUPS: { title: string; items: SettingsItem[] }[] = [
  {
    title: 'ACCOUNT',
    items: [
      { key: 'my-profile', label: 'My profile', icon: 'person', route: '/(app)/settings/my-profile' },
      { key: 'my-vehicle', label: 'My Vehicle', icon: 'car-sport', route: '/(app)/settings/my-vehicle' },
      { key: 'personal-document', label: 'Personal Document', icon: 'document-text', route: '/(app)/settings/personal-document' },
      { key: 'bank-details', label: 'Bank details', icon: 'business', route: '/(app)/settings/bank-details' },
      { key: 'change-password', label: 'Change password', icon: 'lock-closed', route: '/(app)/settings/change-password' },
    ],
  },
  {
    title: 'HELP',
    items: [
      { key: 'terms', label: 'Terms & Conditions', icon: 'document', route: '/(auth)/terms-and-conditions' },
      { key: 'privacy', label: 'Privacy Policies', icon: 'shield-checkmark', route: '/(auth)/privacy-policy' },
      { key: 'about', label: 'About', icon: 'information-circle', route: '/(app)/settings/about' },
      { key: 'contact', label: 'Contact us', icon: 'call', route: '/(auth)/contact-us' },
    ],
  },
];

export type SettingsGroup = { title: string; items: SettingsItem[] };

type Props = {
  groups?: SettingsGroup[];
  onPressItem?: (item: SettingsItem) => void;
  showSignOut?: boolean;
};

export default function SettingsList({ groups, onPressItem, showSignOut = true }: Props) {
  const profile = useDriverStore(s => s.profile);
  const logout = useAuthStore(s => s.logout);

  const list = groups ?? SETTINGS_GROUPS;

  return (
    <View style={styles.wrap}>
      {list.map(group => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <View style={styles.card}>
            {group.items.map((item, idx) => (
              <Pressable
                key={item.key}
                onPress={() => {
                  if (onPressItem) onPressItem(item);
                  else router.push(item.route as any);
                }}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                style={({ pressed }) => [styles.row, idx !== 0 && styles.rowBorder, pressed && { backgroundColor: '#F8FAFC' }]}
              >
                <Ionicons name={item.icon} size={20} color="#0F1A2B" />
                <Text style={styles.rowText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="#A0AEC0" />
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {showSignOut && (
        <View style={styles.signOutWrap}>
          <Pressable
            onPress={() => logout()}
            accessibilityRole="button"
            style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.92 }]}
          >
            <Text style={styles.signOutText}>Log out</Text>
          </Pressable>
          <Text style={styles.versionText}>Bdriver v1.0.0 · Driver {profile.id}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 40,
  },
  group: {
    marginTop: 18,
  },
  groupTitle: {
    color: '#718096',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderColor: '#EDF2F7',
  },
  rowText: {
    flex: 1,
    color: '#0F1A2B',
    fontSize: 15,
    fontWeight: '700',
  },
  signOutWrap: {
    marginTop: 28,
    alignItems: 'center',
  },
  signOutBtn: {
    backgroundColor: '#0F1A2B',
    borderRadius: 28,
    paddingHorizontal: 28,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  versionText: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 14,
  },
});
