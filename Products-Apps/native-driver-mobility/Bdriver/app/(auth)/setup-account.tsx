import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthActionButton, AuthFlowShell, authColors } from '@/ui/AuthFlow';

type Category = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const categories: Category[] = [
  {
    id: 'individual-driver',
    title: 'Individual driver',
    description: 'I have my own car and drive independently.',
    icon: 'car-sport-outline',
  },
  {
    id: 'corporate-driver',
    title: 'Corporate driver',
    description: 'I work for a car company, fleet, or transport partner.',
    icon: 'business-outline',
  },
  {
    id: 'dispatch-rider-personal',
    title: 'Dispatch rider',
    description: 'I ride personally for pickup, courier, and delivery work.',
    icon: 'bicycle-outline',
  },
  {
    id: 'corporate-dispatch-rider',
    title: 'Corporate dispatch rider',
    description: 'I ride for a logistics company, fleet, or dispatch partner.',
    icon: 'cube-outline',
  },
  {
    id: 'novice-starter',
    title: 'Novice / Starter',
    description: 'I do not have a car yet and I am just getting started.',
    icon: 'sparkles-outline',
  },
];

export default function SetupAccountScreen() {
  const router = useRouter();
  const { email, password } = useLocalSearchParams<{ email?: string; password?: string }>();
  const [category, setCategory] = useState('');

  const handleContinue = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Signup details are missing. Please start again.');
      router.replace('/(auth)/register');
      return;
    }

    router.push({
      pathname: '/(auth)/additional-info',
      params: { email, password, category },
    });
  };

  const footerElement = (
    <AuthActionButton
      variant="primary"
      onPress={handleContinue}
      disabled={!category}
      style={styles.continueButton}
      textStyle={styles.continueText}
    >
      Continue
    </AuthActionButton>
  );

  return (
    <AuthFlowShell
      title="Set up account"
      subtitle={
        <>
          By signing up you are agreeing to our{' '}
          <Text style={styles.link} onPress={() => router.push('/(auth)/terms-and-conditions')}>
            terms and conditions
          </Text>{' '}
          and{' '}
          <Text style={styles.link} onPress={() => router.push('/(auth)/privacy-policy')}>
            privacy policy
          </Text>
          .
        </>
      }
      scroll
      contentStyle={styles.shellContent}
      footer={footerElement}
    >
      <Text style={styles.question}>What category describes you?</Text>

      <View style={styles.options}>
        {categories.map(item => {
          const selected = item.id === category;
          return (
            <Pressable
              key={item.id}
              onPress={() => setCategory(item.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}
            >
              <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
                <Ionicons name={item.icon} size={26} color={selected ? '#111111' : authColors.primary} />
              </View>
              <View style={styles.optionCopy}>
                <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{item.title}</Text>
                <Text style={[styles.optionDescription, selected && styles.optionDescriptionSelected]}>
                  {item.description}
                </Text>
              </View>
              <View style={[styles.selectionRing, selected && styles.selectionRingSelected]}>
                {selected && <View style={styles.selectionDot} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </AuthFlowShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingBottom: 34,
  },
  link: {
    color: authColors.text,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  question: {
    color: authColors.text,
    fontSize: 22,
    lineHeight: 30,
    marginBottom: 22,
  },
  options: {
    gap: 12,
  },
  option: {
    minHeight: 104,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionSelected: {
    borderColor: authColors.primary,
    backgroundColor: 'rgba(255,184,0,0.12)',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    boxShadow: '0px 8px 14px #FFB800',
    elevation: 3,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  optionIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255,184,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconSelected: {
    backgroundColor: authColors.primary,
  },
  optionCopy: {
    flex: 1,
  },
  optionTitle: {
    color: authColors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#FFFFFF',
  },
  optionDescription: {
    color: authColors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  optionDescriptionSelected: {
    color: 'rgba(255,255,255,0.82)',
  },
  selectionRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.34)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionRingSelected: {
    borderColor: authColors.primary,
  },
  selectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: authColors.primary,
  },
  continueButton: {
    minHeight: 66,
    marginTop: 28,
  },
  continueText: {
    fontSize: 20,
  },
});
