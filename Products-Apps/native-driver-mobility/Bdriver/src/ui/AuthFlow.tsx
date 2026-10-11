import { PropsWithChildren, useState, memo, useEffect, useRef } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { AuthBackground } from './AuthBackground';
import { Screen } from './Screen';

const Logo = memo(function Logo() {
  return (
    <Image
      source={require('../../assets/logo.jpg')}
      style={styles.logo}
      resizeMode="contain"
    />
  );
});
const authGold = '#FFB800';
const authGoldPressed = '#E5A600';

export const authColors = {
  bg: '#000000',
  surface: '#000000',
  field: '#000000',
  border: 'rgba(255,255,255,0.24)',
  borderStrong: 'rgba(255,255,255,0.34)',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.68)',
  primary: authGold,
  primaryPressed: authGoldPressed,
  danger: '#FF5757',
  success: '#4DB85A',
};

type ShellProps = PropsWithChildren<{
  title: string;
  subtitle?: React.ReactNode;
  showBack?: boolean;
  backHref?: string;
  onBackPress?: () => void;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  footer?: React.ReactNode;
}>;

export function AuthFlowShell({
  title,
  subtitle,
  showBack = true,
  backHref = '/(auth)/auth-choice',
  onBackPress,
  scroll = false,
  contentStyle,
  footer,
  children,
}: ShellProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Reset scroll to top on navigation/state transition (Requirement 4)
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [title]);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(backHref);
  };

  const scrollElement = scroll ? (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      removeClippedSubviews={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.foreground, contentStyle]}>{children}</View>
  );

  const containerContent = (
    <View style={{ flex: 1 }} collapsable={false}>
      {/* Fixed Header (Requirement 3) */}
      <View style={styles.fixedHeader} collapsable={false}>
        {showBack && (
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={12}
            onPress={handleBackPress}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={34} color={authColors.text} />
          </Pressable>
        )}
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Scrollable Middle */}
      {scrollElement}

      {/* Fixed Footer (Requirement 3) */}
      {!!footer && <View style={styles.fixedFooter} collapsable={false}>{footer}</View>}
    </View>
  );

  return (
    <Screen noPadding style={styles.screen}>
      <AuthBackground />
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.container}
        >
          {containerContent}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.container}>
          {containerContent}
        </View>
      )}
    </Screen>
  );
}

export function AuthChoiceArtwork() {
  return (
    <ImageBackground
      source={require('../../assets/onboarding-driver-steering.jpg')}
      resizeMode="cover"
      style={styles.artwork}
      imageStyle={styles.artworkImage}
    >
      <View style={styles.artworkOverlay} />
    </ImageBackground>
  );
}

type ActionButtonProps = PropsWithChildren<{
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'dark' | 'outline' | 'google';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}>;

export function AuthActionButton({
  onPress,
  disabled,
  variant = 'outline',
  icon,
  style,
  textStyle,
  children,
}: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        variant === 'primary' && styles.primaryButton,
        variant === 'dark' && styles.darkButton,
        variant === 'outline' && styles.outlineButton,
        variant === 'google' && styles.googleButton,
        pressed && styles.buttonPressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {!!icon && <View style={styles.actionIcon}>{icon}</View>}
      <Text
        style={[
          styles.actionText,
          variant === 'primary' && styles.primaryText,
          variant === 'google' && styles.googleButtonText,
          textStyle,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

type FieldProps = TextInputProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  trailing?: React.ReactNode;
  focused?: boolean;
};

export function AuthField({ label, icon, error, trailing, focused, style, onBlur, onFocus, ...props }: FieldProps) {
  const [inputFocused, setInputFocused] = useState(false);
  const active = focused ?? inputFocused;

  return (
    <View style={styles.fieldGroup} collapsable={false}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldFrame, active && styles.fieldFocused, !!error && styles.fieldError]} collapsable={false}>
        <TextInput
          placeholderTextColor="rgba(255,255,255,0.56)"
          style={[styles.fieldInput, style]}
          onFocus={event => {
            setInputFocused(true);
            onFocus?.(event);
          }}
          onBlur={event => {
            setInputFocused(false);
            onBlur?.(event);
          }}
          collapsable={false}
          {...props}
        />
        {trailing || (icon ? <Ionicons name={icon} size={28} color="rgba(255,255,255,0.68)" /> : null)}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export type AuthSelectOption = {
  label: string;
  value: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function AuthBottomSheetSelect({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: AuthSelectOption[];
  value?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable accessibilityLabel="Close options" style={styles.sheetBackdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          <View style={styles.sheetOptions}>
            {options.map(option => {
              const selected = value === option.value;

              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.sheetOption,
                    selected && styles.sheetOptionSelected,
                    pressed && styles.sheetOptionPressed,
                  ]}
                >
                  {!!option.icon && (
                    <View style={[styles.sheetOptionIcon, selected && styles.sheetOptionIconSelected]}>
                      <Ionicons name={option.icon} size={20} color={selected ? '#111111' : authColors.primary} />
                    </View>
                  )}
                  <View style={styles.sheetOptionCopy}>
                    <Text style={[styles.sheetOptionText, selected && styles.sheetOptionTextSelected]}>
                      {option.label}
                    </Text>
                    {!!option.description && <Text style={styles.sheetOptionDescription}>{option.description}</Text>}
                  </View>
                  {selected && <Ionicons name="checkmark-circle" size={24} color={authColors.primary} />}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function GoogleGlyph() {
  return (
    <View style={styles.googleGlyph}>
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        />
        <Path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        />
        <Path
          fill="#FBBC05"
          d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z"
        />
        <Path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38Z"
        />
      </Svg>
    </View>
  );
}

export function OrDivider() {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>or</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

export function CheckBox({ checked, size = 36 }: { checked: boolean; size?: number }) {
  return (
    <View style={[styles.checkbox, { width: size, height: size, borderRadius: size * 0.22 }, checked && styles.checkboxChecked]}>
      {checked && <Ionicons name="checkmark" size={size * 0.72} color={authColors.text} />}
    </View>
  );
}

export function Requirement({ met, children }: PropsWithChildren<{ met: boolean }>) {
  return (
    <View style={styles.requirement}>
      <Ionicons
        name={met ? 'checkmark-circle-outline' : 'ellipse-outline'}
        size={34}
        color={met ? authColors.success : 'rgba(255,255,255,0.68)'}
      />
      <Text style={[styles.requirementText, met && styles.requirementMet]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: authColors.bg,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 32,
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
  },
  container: {
    flex: 1,
    zIndex: 1,
  },
  foreground: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    width: '100%',
  },
  container: {
    flex: 1,
    zIndex: 1,
  },
  foreground: {
    flex: 1,
    paddingHorizontal: 32,
  },
  fixedHeader: {
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'ios' ? 62 : 32,
    paddingBottom: 16,
  },
  fixedFooter: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 38 : 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 16,
    zIndex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginBottom: 12,
  },
  logo: {
    alignSelf: 'center',
    width: 98,
    height: 62,
    marginBottom: 28,
  },
  title: {
    color: authColors.text,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    marginBottom: 8,
  },
  subtitle: {
    color: authColors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  artwork: {
    height: 545,
    marginHorizontal: 30,
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  artworkImage: {
    opacity: 0.42,
    transform: [{ rotate: '-4deg' }],
  },
  artworkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17,17,17,0.42)',
  },
  actionButton: {
    minHeight: 66,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
  },
  primaryButton: {
    minHeight: 66,
    borderRadius: 33,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  darkButton: {
    borderRadius: 33,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: authColors.borderStrong,
    backgroundColor: authColors.surface,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    boxShadow: '0px 4px 10px #000000',
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.5,
  },
  actionIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: authColors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  googleButtonText: {
    color: '#1F1F1F',
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 12,
  },
  fieldLabel: {
    color: authColors.text,
    fontSize: 22,
    lineHeight: 28,
  },
  fieldFrame: {
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: authColors.borderStrong,
    backgroundColor: authColors.field,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    gap: 12,
  },
  fieldFocused: {
    borderColor: authColors.primary,
    shadowColor: authGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    boxShadow: '0px 0px 10px authGold',
    elevation: 2,
  },
  fieldError: {
    borderColor: authColors.danger,
  },
  fieldInput: {
    flex: 1,
    color: authColors.text,
    fontSize: 20,
    lineHeight: 26,
    paddingVertical: 0,
  },
  errorText: {
    color: authColors.danger,
    fontSize: 15,
    lineHeight: 20,
    marginLeft: 22,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: authColors.bg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 28,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.28)',
    marginBottom: 22,
  },
  sheetTitle: {
    color: authColors.text,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: 18,
  },
  sheetOptions: {
    gap: 10,
  },
  sheetOption: {
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#1B1B1B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sheetOptionSelected: {
    borderColor: authColors.primary,
    backgroundColor: 'rgba(255,184,0,0.12)',
  },
  sheetOptionPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  sheetOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.22)',
    backgroundColor: 'rgba(255,184,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOptionIconSelected: {
    backgroundColor: authColors.primary,
    borderColor: authColors.primary,
  },
  sheetOptionCopy: {
    flex: 1,
  },
  sheetOptionText: {
    color: authColors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  sheetOptionTextSelected: {
    color: authColors.primary,
  },
  sheetOptionDescription: {
    color: authColors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  googleGlyph: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: authColors.borderStrong,
  },
  dividerText: {
    color: authColors.muted,
    fontSize: 18,
  },
  checkbox: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: authGold,
    borderColor: authGold,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementText: {
    flex: 1,
    color: authColors.muted,
    fontSize: 17,
    lineHeight: 24,
  },
  requirementMet: {
    color: authColors.success,
  },
});
