import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDriverStore } from '../../../store/driver';
import { colors } from '../../../theme/colors';

const QUICK_AMOUNTS = [2, 5, 10];

export default function TollModal() {
  const open = useDriverStore(s => s.tollModalOpen);
  const closeTollModal = useDriverStore(s => s.closeTollModal);
  const acceptToll = useDriverStore(s => s.acceptToll);
  const tollAmount = useDriverStore(s => s.tollAmount);
  const [value, setValue] = useState('');

  const inputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (open) {
      setValue('');
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  const handleDone = () => {
    const amount = parseFloat(value);
    if (Number.isFinite(amount) && amount > 0) {
      acceptToll(amount);
    }
    closeTollModal();
  };

  const handleClose = () => {
    closeTollModal();
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.dialog}>
        <Text style={styles.title}>Enter Toll Amount</Text>
        <Text style={styles.subtitle}>
          {tollAmount > 0 ? `Add another toll · current total $${tollAmount.toFixed(2)}` : 'Please enter toll amount'}
        </Text>
        <View style={styles.inputRow}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={setValue}
            placeholder="0.00"
            placeholderTextColor="#A0AEC0"
            keyboardType="decimal-pad"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleDone}
          />
        </View>
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map(q => (
            <Pressable
              key={q}
              onPress={() => setValue(String(q))}
              accessibilityLabel={`Set toll to ${q} dollars`}
              style={({ pressed }) => [styles.quickChip, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.quickText}>${q}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.actionRow}>
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.85 }]}
            accessibilityLabel="Cancel toll entry"
          >
            <Text style={[styles.actionText, { color: colors.primary }]}>CANCEL</Text>
          </Pressable>
          <Pressable
            onPress={handleDone}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.85 }]}
            accessibilityLabel="Confirm toll"
          >
            <Text style={[styles.actionText, { color: colors.primary }]}>DONE</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 90,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15,26,43,0.55)',
  },
  dialog: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
  },
  title: {
    color: '#0F1A2B',
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 18,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  currency: {
    color: '#0F1A2B',
    fontSize: 22,
    fontWeight: '900',
    marginRight: 4,
  },
  input: {
    flex: 1,
    color: '#0F1A2B',
    fontSize: 28,
    fontWeight: '900',
    padding: 0,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255,184,0,0.16)',
  },
  quickText: {
    color: '#0F1A2B',
    fontSize: 12,
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 18,
    marginTop: 18,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
});
