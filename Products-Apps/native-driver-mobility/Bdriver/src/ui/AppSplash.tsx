import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { colors } from '../theme/colors';
import { QueensLogo } from './QueensLogo';

export function AppSplash() {
  // Main logo and glow breath animation
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Concentric ring animations
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo & ambient glow breathing loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Cascading/pulsating rings helper
    const runRing = (val: Animated.Value) => {
      val.setValue(0);
      Animated.timing(val, {
        toValue: 1,
        duration: 3200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => runRing(val));
    };

    // Staggered trigger for rings (delay is only applied on the first cycle)
    runRing(ring1);
    
    const timer2 = setTimeout(() => {
      runRing(ring2);
    }, 1000);

    const timer3 = setTimeout(() => {
      runRing(ring3);
    }, 2000);

    return () => {
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pulseAnim, ring1, ring2, ring3]);

  // Interpolations for logo scaling
  const logoScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.93, 1.07],
  });

  // Interpolations for the soft radial glow behind the logo
  const glowScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 1.3],
  });

  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.35],
  });

  // Interpolations for breathing loading text
  const textOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.95],
  });

  // Reusable ring style generator
  const getRingStyle = (val: Animated.Value) => {
    return {
      transform: [
        {
          scale: val.interpolate({
            inputRange: [0, 1],
            outputRange: [0.85, 2.8],
          }),
        },
      ],
      opacity: val.interpolate({
        inputRange: [0, 0.15, 1],
        outputRange: [0, 0.75, 0],
      }),
    };
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background Ambient Blobs */}
      <View style={styles.ambientLightLeft} />
      <View style={styles.ambientLightRight} />

      {/* Pulsating Concentric Ripple Rings */}
      <Animated.View style={[styles.ring, getRingStyle(ring1)]} />
      <Animated.View style={[styles.ring, getRingStyle(ring2)]} />
      <Animated.View style={[styles.ring, getRingStyle(ring3)]} />

      {/* Ambient Glow behind the logo */}
      <Animated.View
        style={[
          styles.logoGlow,
          {
            transform: [{ scale: glowScale }],
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Logo Card with Shadow and Border */}
      <Animated.View style={[styles.logoCard, { transform: [{ scale: logoScale }] }]}>
        <QueensLogo size={105} />
      </Animated.View>

      {/* Premium Slogan and Breathing Loading Text */}
      <View style={styles.brandContainer}>
        <Text style={styles.brandTitle}>QUEENS</Text>
        <Text style={styles.brandSubtitle}>DRIVER</Text>
        
        <Animated.View style={{ opacity: textOpacity, marginTop: 42, alignItems: 'center' }}>
          <View style={styles.loadingBarContainer}>
            <Animated.View 
              style={[
                styles.loadingBarProgress, 
                {
                  transform: [
                    {
                      translateX: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-60, 60]
                      })
                    }
                  ]
                }
              ]} 
            />
          </View>
          <Text style={styles.loadingText}>Connecting to Dispatch...</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // Ambient radial aura in backgrounds
  ambientLightLeft: {
    position: 'absolute',
    left: -80,
    top: '20%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#0D6A84',
    opacity: 0.08,
  },
  ambientLightRight: {
    position: 'absolute',
    right: -80,
    bottom: '25%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.primary,
    opacity: 0.06,
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 184, 0, 0.03)',
  },
  logoGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    boxShadow: '0px 0px 30px colors.primary',
    elevation: 10,
  },
  logoCard: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    boxShadow: '0px 16px 24px #000000',
    elevation: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 184, 0, 0.25)',
  },
  brandContainer: {
    position: 'absolute',
    bottom: 75,
    alignItems: 'center',
    width: '100%',
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
    textAlign: 'center',
  },
  brandSubtitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 8,
    marginTop: 4,
    textAlign: 'center',
    paddingLeft: 6, // counter-balance letter-spacing offset
  },
  loadingText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginTop: 10,
  },
  loadingBarContainer: {
    width: 120,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  loadingBarProgress: {
    width: 60,
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
});
