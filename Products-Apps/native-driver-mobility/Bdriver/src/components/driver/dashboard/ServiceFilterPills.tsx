import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDriverStore, ServiceFilter } from '../../../store/driver';
import { colors } from '../../../theme/colors';

const FILTERS: { key: ServiceFilter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', label: 'All', icon: 'grid' },
  { key: 'economy', label: 'Economy', icon: 'car' },
  { key: 'business', label: 'Business', icon: 'briefcase' },
  { key: 'premium', label: 'Premium', icon: 'diamond' },
];

export default function ServiceFilterPills() {
  const current = useDriverStore(s => s.serviceFilter);
  const setFilter = useDriverStore(s => s.setServiceFilter);

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {FILTERS.map(f => {
          const active = current === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${f.label}`}
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.pill,
                active && styles.pillActive,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons
                name={f.icon}
                size={14}
                color={active ? '#0F1A2B' : '#FFFFFF'}
              />
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 4,
  },
  row: {
    paddingHorizontal: 18,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 26, 43, 0.85)',
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  pillTextActive: {
    color: '#0F1A2B',
  },
});
