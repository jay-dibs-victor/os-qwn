import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function LoadingSkeleton({ width = '100%', height = 20, borderRadius = 8, style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: colors.border.medium, opacity }, style]}
    />
  );
}

export function SkeletonCard({ height = 100, style }) {
  return (
    <View style={[s.card, style]}>
      <LoadingSkeleton width="30%" height={14} borderRadius={6} style={{ marginBottom: 10 }} />
      <LoadingSkeleton width="60%" height={12} borderRadius={6} style={{ marginBottom: 8 }} />
      <LoadingSkeleton width="40%" height={12} borderRadius={6} />
    </View>
  );
}

export function SkeletonList({ count = 3, height = 80, style }) {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={height} style={{ marginBottom: 12 }} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
});
