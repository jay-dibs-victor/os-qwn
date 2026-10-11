import React, { useEffect, useRef, memo } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthActionButton, AuthFlowShell, authColors } from '@/ui/AuthFlow';

const { width: SCREEN_W } = Dimensions.get('window');

const PALETTE = ['#FFB800', '#4DB85A', '#5AC8FA', '#FF5757', '#FFFFFF', '#B45FFF', '#FF8C00'];
const PIECE_COUNT = 48;

type PieceConfig = {
  id: number;
  color: string;
  left: number;
  size: number;
  speed: number;
  delay: number;
  rotDir: number;
  driftAmplitude: number;
  shape: 'rect' | 'circle' | 'ribbon';
};

const pieces: PieceConfig[] = Array.from({ length: PIECE_COUNT }, (_, i) => ({
  id: i,
  color: PALETTE[i % PALETTE.length],
  left: (i * (SCREEN_W / PIECE_COUNT) + (i % 5) * 7) % SCREEN_W,
  size: 7 + (i % 5) * 2.5,
  speed: 2800 + (i % 7) * 420,
  delay: (i % 12) * 200,
  rotDir: i % 2 === 0 ? 1 : -1,
  driftAmplitude: 18 + (i % 6) * 10,
  shape: i % 3 === 0 ? 'circle' : i % 4 === 0 ? 'ribbon' : 'rect',
}));

// Individual animated piece — completely independent loop per piece
const ConfettiPiece = memo(function ConfettiPiece({ config }: { config: PieceConfig }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: config.speed,
        delay: config.delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) run();
      });
    };
    run();
  }, [anim, config.speed, config.delay]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-config.size * 3, 680],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [
      0,
      config.driftAmplitude * config.rotDir,
      0,
      -config.driftAmplitude * config.rotDir * 0.5,
      config.driftAmplitude * config.rotDir * 0.3,
    ],
  });

  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${360 * config.rotDir * (1 + (config.id % 3))}deg`],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.05, 0.85, 1],
    outputRange: [0, 1, 1, 0],
  });

  const scaleY = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.7, 1],
  });

  const shapeStyle =
    config.shape === 'circle'
      ? { borderRadius: config.size / 2, width: config.size, height: config.size }
      : config.shape === 'ribbon'
      ? { borderRadius: 2, width: config.size * 0.55, height: config.size * 2.2 }
      : { borderRadius: 2, width: config.size, height: config.size * 1.45 };

  return (
    <Animated.View
      style={[
        styles.piece,
        shapeStyle,
        {
          left: config.left,
          backgroundColor: config.color,
          opacity,
          transform: [{ translateX }, { translateY }, { rotate }, { scaleY }],
        },
      ]}
    />
  );
});

export default function VerificationSubmittedScreen() {
  const router = useRouter();

  return (
    <AuthFlowShell
      title="Bravo, all set"
      subtitle="Sit tight, we have got your information."
      showBack={false}
      scroll
      contentStyle={styles.shellContent}
    >
      {/* Premium confetti — each piece animates independently */}
      <View pointerEvents="none" style={styles.confettiLayer}>
        {pieces.map(p => (
          <ConfettiPiece key={p.id} config={p} />
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark" size={58} color="#111111" />
        </View>
        <Text style={styles.headline}>Bravo, all set</Text>
        <Text style={styles.copy}>
          All documents are under review. You will be contacted via phone or email on the next step to becoming a
          Queens driver.
        </Text>
      </View>

      <View style={styles.planCard}>
        <View style={styles.planIcon}>
          <Ionicons name="calendar-outline" size={24} color={authColors.primary} />
        </View>
        <View style={styles.planCopy}>
          <Text style={styles.planTitle}>Optional plan setup</Text>
          <Text style={styles.planText}>
            You can tell Queens your preferred availability and work type now. This is optional and your review will
            continue if you skip it.
          </Text>
        </View>
      </View>

      <AuthActionButton
        variant="primary"
        onPress={() => router.push('/(auth)/plan-setup')}
        style={styles.planButton}
        textStyle={styles.planButtonText}
      >
        Continue to plan setup
      </AuthActionButton>

      <AuthActionButton
        variant="dark"
        onPress={() => router.replace('/(auth)/login')}
        style={styles.doneButton}
        textStyle={styles.doneText}
      >
        Skip for now
      </AuthActionButton>
    </AuthFlowShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingBottom: 34,
  },
  confettiLayer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    zIndex: 0,
  },
  piece: {
    position: 'absolute',
    top: 0,
  },
  card: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.26)',
    backgroundColor: 'rgba(255,184,0,0.1)',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 34,
    marginTop: 34,
    zIndex: 1,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: authColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  headline: {
    color: authColors.text,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
    textAlign: 'center',
    marginBottom: 14,
  },
  copy: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'center',
  },
  planCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#1B1B1B',
    flexDirection: 'row',
    gap: 14,
    padding: 18,
    marginTop: 24,
    marginBottom: 24,
    zIndex: 1,
  },
  planIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255,184,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCopy: {
    flex: 1,
  },
  planTitle: {
    color: authColors.text,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 23,
  },
  planText: {
    color: authColors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  planButton: {
    minHeight: 66,
    zIndex: 1,
    backgroundColor: authColors.primary,
  },
  planButtonText: {
    fontSize: 18,
    color: '#000000',
  },
  doneButton: {
    minHeight: 58,
    marginTop: 12,
    zIndex: 1,
  },
  doneText: {
    color: authColors.text,
    fontSize: 17,
    fontWeight: '900',
  },
});
