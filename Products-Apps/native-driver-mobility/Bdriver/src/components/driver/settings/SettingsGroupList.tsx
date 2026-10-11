import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';

type IconName = keyof typeof Ionicons.glyphMap;

type Item = {
  key: string;
  label: string;
  icon: IconName;
  onPress?: () => void;
  rightSlot?: 'chevron' | 'value' | 'switch';
  value?: string;
  destructive?: boolean;
};

export type SettingsGroup = {
  title?: string;
  items: Item[];
};

export default function SettingsGroupList({ groups }: { groups: SettingsGroup[] }) {
  const router = useRouter();

  const handlePress = (item: Item) => {
    if (item.onPress) item.onPress();
    else router.push(`/(app)/settings/${item.key}` as any);
  };

  return (
    <View style={styles.wrap}>
      {groups.map((group, gIdx) => (
        <View key={gIdx} style={styles.group}>
          {!!group.title && <Text style={styles.groupTitle}>{group.title}</Text>}
          <View style={styles.card}>
            {group.items.map((item, idx) => (
              <Pressable
                key={item.key}
                onPress={() => handlePress(item)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                style={({ pressed }) => [
                  styles.row,
                  idx !== 0 && styles.rowBorder,
                  pressed && { backgroundColor: '#F8FAFC' },
                ]}
              >
                <Ionicons name={item.icon} size={20} color={item.destructive ? '#FF3B47' : '#0F1A2B'} />
                <Text style={[styles.rowText, item.destructive && { color: '#FF3B47' }]}>
                  {item.label}
                </Text>
                {item.rightSlot === 'value' && (
                  <Text style={styles.valueText}>{item.value}</Text>
                )}
                {item.rightSlot !== 'value' && (
                  <Ionicons name="chevron-forward" size={18} color="#A0AEC0" />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      ))}
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
    minHeight: 56,
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
  valueText: {
    color: '#718096',
    fontSize: 14,
    fontWeight: '600',
  },
});
