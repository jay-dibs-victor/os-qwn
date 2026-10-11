import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { colors } from '../theme/colors';

export default function OfflineIndicator({ visible }) {
  if (!visible) return null;
  return (
    <View style={s.banner}>
      <WifiOff color="#FFFFFF" size={16} style={{ marginRight: 8 }} />
      <Text style={s.text}>You're offline — some features may be unavailable</Text>
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#DC2626', paddingVertical: 8, paddingHorizontal: 16,
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 99,
  },
  text: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
});
