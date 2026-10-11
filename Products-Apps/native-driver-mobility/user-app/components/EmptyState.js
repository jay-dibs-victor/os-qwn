import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function EmptyState({ icon = '📭', title, subtitle, ctaLabel, onCta }) {
  return (
    <View style={s.container}>
      <Text style={s.icon}>{icon}</Text>
      <Text style={s.title}>{title || 'Nothing here yet'}</Text>
      {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      {ctaLabel && onCta && (
        <TouchableOpacity style={s.cta} onPress={onCta}>
          <Text style={s.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text.primary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  cta: {
    backgroundColor: colors.gold.bright,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  ctaText: { color: colors.text.onGold, fontSize: 15, fontWeight: '700' },
});
