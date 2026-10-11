import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../../src/theme/colors';

export default function ChangePasswordScreen() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saved, setSaved] = useState(false);

  const canSubmit =
    current.length >= 6 &&
    next.length >= 6 &&
    next === confirm &&
    next !== current;

  const submit = () => {
    if (!canSubmit) return;
    setSaved(true);
    setTimeout(() => router.back(), 800);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SECURITY</Text>
          <Text style={styles.title}>Change password</Text>
          <Text style={styles.subtitle}>
            Choose a password with at least 6 characters including a number.
          </Text>
        </View>

        <Field
          label="Current password"
          value={current}
          onChangeText={setCurrent}
          show={showCurrent}
          onToggle={() => setShowCurrent(v => !v)}
        />
        <Field
          label="New password"
          value={next}
          onChangeText={setNext}
          show={showNext}
          onToggle={() => setShowNext(v => !v)}
        />
        <Field
          label="Confirm new password"
          value={confirm}
          onChangeText={setConfirm}
          show={showNext}
          onToggle={() => setShowNext(v => !v)}
        />

        {next.length > 0 && next.length < 6 && (
          <View style={styles.warningRow}>
            <Ionicons name="alert-circle" size={16} color="#FF3B47" />
            <Text style={styles.warningText}>Password must be at least 6 characters.</Text>
          </View>
        )}
        {confirm.length > 0 && confirm !== next && (
          <View style={styles.warningRow}>
            <Ionicons name="alert-circle" size={16} color="#FF3B47" />
            <Text style={styles.warningText}>Passwords do not match.</Text>
          </View>
        )}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips for a strong password</Text>
          <Tip text="Use at least 6 characters" ok={next.length >= 6} />
          <Tip text="Mix letters, numbers and symbols" ok={/\d/.test(next) && /[a-zA-Z]/.test(next)} />
          <Tip text="Avoid reusing other passwords" ok={next !== current && next.length > 0} />
        </View>

        <Pressable
          onPress={submit}
          disabled={!canSubmit || saved}
          accessibilityLabel="Save password"
          style={({ pressed }) => [
            styles.cta,
            (!canSubmit || saved) && { opacity: 0.5 },
            saved && { backgroundColor: '#219653' },
            pressed && { opacity: 0.9 },
          ]}
        >
          {saved ? (
            <View style={styles.ctaInner}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.ctaText}>Password updated</Text>
            </View>
          ) : (
            <Text style={styles.ctaText}>Save changes</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#A0AEC0"
        />
        <Pressable
          onPress={onToggle}
          accessibilityLabel={show ? 'Hide password' : 'Show password'}
          style={({ pressed }) => [styles.eyeBtn, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name={show ? 'eye-off' : 'eye'} size={18} color="#718096" />
        </Pressable>
      </View>
    </View>
  );
}

function Tip({ text, ok }: { text: string; ok: boolean }) {
  return (
    <View style={styles.tipRow}>
      <Ionicons
        name={ok ? 'checkmark-circle' : 'ellipse-outline'}
        size={14}
        color={ok ? '#219653' : '#A0AEC0'}
      />
      <Text style={[styles.tipText, ok && { color: '#0F1A2B' }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scroll: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 18,
  },
  eyebrow: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    color: '#0F1A2B',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: '#718096',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    lineHeight: 20,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: '#0F1A2B',
    fontSize: 15,
    fontWeight: '700',
    paddingVertical: 14,
  },
  eyeBtn: {
    padding: 6,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  warningText: {
    color: '#FF3B47',
    fontSize: 12,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    gap: 8,
  },
  tipsTitle: {
    color: '#0F1A2B',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '600',
  },
  cta: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 22,
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaText: {
    color: '#0F1A2B',
    fontSize: 16,
    fontWeight: '900',
  },
});
