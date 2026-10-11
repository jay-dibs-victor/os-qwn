import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useDriverStore } from '../../../store/driver';

export default function GoButton({ onPress }: { onPress: () => void }) {
  const isOnline = useDriverStore(s => s.isOnline);
  const isLoading = useDriverStore(s => s.isLoading);
  
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
  }, [isOnline]);

  return (
    <View style={styles.container}>
      {isOnline && (
        <Animated.View style={[styles.pulse, { transform: [{ scale: pulse }] }]} />
      )}
      <Pressable
        onPress={onPress}
        disabled={isLoading}
        style={[styles.button, isOnline ? styles.buttonOnline : styles.buttonOffline]}
      >
        <Text style={[styles.text, isOnline ? styles.textOnline : styles.textOffline]}>
          {isOnline ? 'STOP' : 'GO'}
        </Text>
        {isOnline && <View style={styles.badge} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
  },
  pulse: {
    ...StyleSheet.absoluteFill,
    borderRadius: 50,
    backgroundColor: 'rgba(33, 150, 83, 0.3)',
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0F1A2B',
  },
  buttonOffline: {
    backgroundColor: '#0F1A2B',
  },
  buttonOnline: {
    backgroundColor: '#0F1A2B',
  },
  text: {
    fontSize: 20,
    fontWeight: '900',
  },
  textOffline: {
    color: '#FFFFFF',
  },
  textOnline: {
    color: '#FF3B47',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B47',
  },
});
