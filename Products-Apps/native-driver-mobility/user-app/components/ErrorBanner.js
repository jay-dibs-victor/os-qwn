import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function ErrorBanner({ message, onRetry, visible = true }) {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : -100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  return (
    <Animated.View style={[s.banner, { transform: [{ translateY }] }]}>
      <Text style={s.text}>{message || 'Something went wrong'}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={s.retryBtn}>
          <Text style={s.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  banner: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    backgroundColor: '#FEF2F2',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#FECACA',
  },
  text: { flex: 1, color: '#DC2626', fontSize: 14, fontWeight: '600' },
  retryBtn: { marginLeft: 12, paddingVertical: 6, paddingHorizontal: 14, backgroundColor: '#DC2626', borderRadius: 8 },
  retryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
