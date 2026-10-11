import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { AuthBackground } from './AuthBackground';
import { Screen } from './Screen';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
}>;

// Main shell component wrapping auth pages with consistent styling and keyboard avoiding
export function AuthShell({ title, subtitle, children, style }: Props) {
  const scrollElement = (
    <ScrollView
      style={styles.foreground}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="none"
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={false}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.formContainer}>
        {children}
      </View>
    </ScrollView>
  );

  return (
    <Screen noPadding style={[styles.screen, style]}>
      <AuthBackground />

      {/* Header with Queens OS Logo - Top Left */}
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.lockIcon}>
            <Text style={styles.lockText}>🔒</Text>
          </View>
          <Text style={styles.logoText}>Queens OS</Text>
        </View>
      </View>

      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.container}
        >
          {scrollElement}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.container}>
          {scrollElement}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    zIndex: 1,
  },
  foreground: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockText: {
    fontSize: 14,
  },
  logoText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 120,
    paddingBottom: 180,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    gap: 14,
  },
});
