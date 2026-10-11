import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import {
  AuthActionButton,
  authColors,
} from '../../src/ui/AuthFlow';
import { Screen } from '../../src/ui/Screen';

const logoXml = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
  <image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAtAAAAK8CAYAAADGYYi9AAAQAElEQVR4AeydB4AdV3X+v3Nn5vVt0qpakq3i3nHBYNM7MTX03kMzvfOHGBIg9BQCJCEQIIGEGrrpvYVeDLh3dWn7K1Pu/X9n3ltZNgZsbEsr7RndM7ed236zfvu9s2/XDnYZASNgBIyAETACRsAIGAEjcKMJmIC+0ajM0QgYgYVFwHZjBIyAETACRmD/EDABvX+426pGwAgYASNgBIzAYiVg5z7gCZiAPuAfoR3ACBgBI2AEjIARMAJGYF8SMAG9L2nbWguJgO3FCBgBI2AEjIARMAJ/FgET0H8WNhtkBIyAETACRmB/EbB1jYAR2N8ETEDv7ydg6xsBI2AEjIARMAJGwAgcUARMQP+Zj8uGGQEjYASMgBEwAkbACCxOAiagF+dzt1MbASOweAnYyY2AETACRuBmEjABfTMB2nAjYASMgBEwAkbACBiBfUFg4axhAnrhPAvbiREwAkbACBgBI2AEjMABQMAE9AHwkGyLRmAhEbC9GAEjYASMgBFY7ARMQC/2rwA7vxEwAkbACBiBxUHATmkEbjECJqBvMZQ2kREwAkbACBgBI2AEjMBiIGACejE85YV0RtuLETACRsAIGAEjYAQOcAImoA/wB2jbNwJGwAgYgX1DwFYxAkbACMwTMAE9T8JyI2AEjIARMAJGwAgYASNwgcYAL6RpzIXIyAETACRsAIGAEjYASMwK1IwAT0rQjXpjYCRsAI7CFgBSNgBIyAEThoCJiAPmgepR3ECBgBI2AEjIARMAK3PAGb8fcJmID+fSbWYgSMgBEwAkbACBgBI2AE/iABE9B/EI11GIGFRMD2YgSMgBEwAkbACCwUAiagF8qTsH0YASNgBIyAETgYCdiZjMBBSMAE9EH4UO1IRsAIGAEjYASMgBEwArceARPQtx7bhTSz7cUIGAEjYASMgBEwAkbgFiJgAvoWAmnTGAEjYASMwK1BwOY0AkbACCw8AiagF94zsR0ZASNgBIyAETACRsAILGACN0pAL+D929aMgBEwAkbACBgBI2AEjMA+JWACep/itsWMgBHYxwRsOSNgBIyAETACtzgBE9C3OFKb0AgYASNgBIyAETACN5eAjV/IBExAL+SnY3szAkbACBgBI2AEjIARWHAETEAvuEdiG1pIBGwvRsAIGAEjYASMgBG4PgET0NcnYnUjYASMgBEwAgc+ATuBETACtyIBE9C3Ilyb2ggYASNgBIyAETACRuDgI2AC+tZ8pja3ETACRsAIGAEjYASMwEFHwAT0QfdI7UBGwAgYgZtPwGYwAkbACBiBP0zABPQfZmM9RsAIGAEjYASMgBEwAgcWgX2yWxPQ+wSzLWIEjIARMAJGwAgYASNwsBAwAX2wPEk7hxFYSARsL0bACBgBI2AEDmICJqAP4odrRzMCRsAIGAEjYARuGgHzNgI3hoAJ6BtDyXyMgBEwAkbACBgBI2AEjMCAgAnoAQjLFhIB24sRMAJGwAgYASNgBBYuARPQC/fZ2M6MgBEwAkbgQCNg+zUCRmBREDABvSgesx3SCBgBI2AEjIARMAJG4JYicDAK6FuKjc1jBIyAETACRsAIGAEjYAR+j4AJ6N9DYg1GwAgYgf1FwNY1AkbACBiBA4GACegD4SnZHo2AETACRsAIGAEjsJAJLLK9mYBeZA/cjmsEjIARMAJGwAgYASNw8wiYgL55/Gy0EVhIBGwvRsAIGAEjYASMwD4gYAJ6H0C2JYyAETACRsAIGIE/RsD6jMCBRcAE9IH1vGy3RsAIGAEjYASMgBEwAvuZgAno/fwAFtLythcjYASMgBEwAkbACBiBP03ABPSfZmQeRsAIGAEjsLAJ2O6MgBEwAvuUgAnofYrbFjMCRsAIGAEjYASMgBE40AnccgL6QCdh+zcCRsAIGAEjYASMgBEwAjeCgAn..." />
</svg>`;

export default function AuthChoiceScreen() {
  return (
    <Screen noPadding style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.logoStage}>
            <SvgXml xml={logoXml} width="104" height="64" />
          </View>

          <Text style={styles.headline}>Stay ready for every ride, delivery, and driver update.</Text>

          <View style={styles.valueRow}>
            <View style={styles.valuePill}>
              <Text style={styles.valueText}>Rides</Text>
            </View>
            <View style={styles.valuePill}>
              <Text style={styles.valueText}>Courier</Text>
            </View>
            <View style={styles.valuePill}>
              <Text style={styles.valueText}>Earnings</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <AuthActionButton
            variant="primary"
            onPress={() => router.push('/(auth)/register')}
            style={[styles.choiceButton, styles.primaryChoiceButton]}
            textStyle={styles.choiceText}
          >
            Create driver account
          </AuthActionButton>

          <AuthActionButton
            variant="dark"
            onPress={() => router.push('/(auth)/login')}
            style={[styles.choiceButton, styles.loginButton]}
            textStyle={[styles.choiceText, styles.loginText]}
          >
            Log in
          </AuthActionButton>

          <Text style={styles.legal}>
            By signing up you are agreeing to our{' '}
            <Text style={styles.link} onPress={() => router.push('/(auth)/terms-and-conditions')}>
              terms and conditions
            </Text>{' '}
            and{' '}
            <Text style={styles.link} onPress={() => router.push('/(auth)/privacy-policy')}>
              privacy policy
            </Text>
            .
          </Text>

          <Pressable onPress={() => router.push('/(auth)/contact-us')} hitSlop={8}>
            <Text style={styles.support}>Need any help or support, <Text style={styles.link}>Contact us</Text></Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: authColors.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  hero: {
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 22,
  },
  logoStage: {
    height: 100,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    color: authColors.text,
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 45,
    marginTop: 0,
    maxWidth: 340,
  },
  valueRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  valuePill: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.22)',
    backgroundColor: 'rgba(255,184,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  valueText: {
    color: authColors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  actions: {
    paddingHorizontal: 32,
    paddingBottom: 6,
    gap: 18,
  },
  choiceButton: {
    minHeight: 62,
    borderRadius: 31,
    paddingHorizontal: 18,
  },
  primaryChoiceButton: {
    backgroundColor: authColors.primary,
  },
  choiceText: {
    fontSize: 16,
    lineHeight: 22,
  },
  darkChoiceText: {
    color: authColors.text,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
  },
  loginText: {
    color: '#000000',
  },
  legal: {
    color: authColors.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 8,
  },
  support: {
    color: authColors.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  link: {
    color: authColors.primary,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});