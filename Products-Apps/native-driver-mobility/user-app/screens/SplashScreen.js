import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';

export default function SplashScreen({ navigation }) {
  const { token, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (loading) return;
    const dest = token ? 'Home' : 'Login';
    const timer = setTimeout(() => navigation.replace(dest), 1200);
    return () => clearTimeout(timer);
  }, [loading, token, navigation]);

  return (
    <View style={s.container}>
      <Animated.View style={[s.logoWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={s.logoBox}>
          <Text style={s.logoText}>Q</Text>
        </View>
        <Text style={s.title}>Queens</Text>
        <Text style={s.tagline}>Move safely around Lagos</Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.deep, justifyContent: 'center', alignItems: 'center' },
  logoWrap: { alignItems: 'center' },
  logoBox: {
    width: 100, height: 100, borderRadius: 28,
    backgroundColor: colors.gold.bright, justifyContent: 'center', alignItems: 'center',
    marginBottom: 20, shadowColor: colors.gold.bright, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 12,
  },
  logoText: { fontSize: 48, fontWeight: '900', color: '#FFFFFF' },
  title: { fontSize: 36, fontWeight: '900', color: colors.text.primary, letterSpacing: -1 },
  tagline: { fontSize: 16, color: colors.text.secondary, marginTop: 8, fontWeight: '500' },
});
