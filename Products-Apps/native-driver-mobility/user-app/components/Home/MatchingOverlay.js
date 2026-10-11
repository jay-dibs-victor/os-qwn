import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native';
import { colors } from '../../theme/colors';

export default function MatchingOverlay({ matchingStep, setAppState }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 12,
    }).start();
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[overlayStyles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={overlayStyles.handle} />

      <View style={overlayStyles.content}>
        <Animated.View style={[overlayStyles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
          <ActivityIndicator size="large" color={colors.gold.bright} />
        </Animated.View>

        <Text style={overlayStyles.title}>Finding your ride</Text>
        <Text style={overlayStyles.status}>
          {matchingStep === 0
            ? 'Connecting with the closest driver...'
            : 'Searching for nearby available drivers...'}
        </Text>

        <View style={overlayStyles.progressDots}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[
                overlayStyles.dot,
                matchingStep === 0 && i === 0 && overlayStyles.dotActive,
                matchingStep === 1 && i <= 1 && overlayStyles.dotActive,
              ]}
            />
          ))}
        </View>

        <Text style={overlayStyles.vettedBadge}>✓ All drivers vetted by Moove/LagRide</Text>

        <TouchableOpacity
          style={overlayStyles.cancelBtn}
          onPress={() => setAppState('idle')}
          activeOpacity={0.7}
        >
          <Text style={overlayStyles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const overlayStyles = {
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(20,24,40,0.95)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,208,96,0.2)',
    elevation: 30,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    paddingBottom: 100,
    zIndex: 30,
    backdropFilter: 'blur(20px)',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  content: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 8,
  },
  pulseCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,193,7,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,193,7,0.25)',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  status: {
    color: colors.text.secondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  progressDots: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dotActive: {
    backgroundColor: colors.gold.bright,
    width: 24,
    borderRadius: 4,
  },
  vettedBadge: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 20,
  },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,193,7,0.3)',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 999,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.gold.bright,
    fontWeight: '700',
    fontSize: 14,
  },
};
