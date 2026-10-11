import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDriverStore } from '../../../store/driver';
import { colors } from '../../../theme/colors';

const CANCEL_REASONS = [
  { id: 'rider_absent', label: 'Rider isn\'t here' },
  { id: 'wrong_address', label: 'Wrong address shown' },
  { id: 'no_charge', label: 'Don\'t charge rider' },
  { id: 'no_show_long', label: 'Took too long to arrive' },
  { id: 'mechanical', label: 'Vehicle issue' },
  { id: 'other', label: 'Other reason' },
];

export default function CancelTripSheet() {
  const open = useDriverStore(s => s.cancelReasonOpen);
  const close = useDriverStore(s => s.closeCancelReason);
  const confirm = useDriverStore(s => s.confirmCancelTrip);

  if (!open) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={() => close()} />
      <View style={styles.sheet}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => close()}
            style={styles.closeBtn}
            accessibilityLabel="Close cancel trip"
          >
            <Ionicons name="close" size={20} color="#0F1A2B" />
          </Pressable>
          <Text style={styles.title}>Cancel Trip</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.list}>
          {CANCEL_REASONS.map((reason, idx) => (
            <Pressable
              key={`${reason.id}-${idx}`}
              onPress={() => confirm(reason.id)}
              style={({ pressed }) => [styles.row, pressed && { backgroundColor: '#F1F4F9' }]}
              accessibilityRole="button"
              accessibilityLabel={`Cancel trip reason: ${reason.label}`}
            >
              <View style={styles.radio}>
                {idx === 0 ? <Ionicons name="checkmark" size={14} color={colors.primary} /> : null}
              </View>
              <Text style={[styles.rowText, idx === 0 && styles.rowTextActive]}>{reason.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => close()}
          style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.92 }]}
          accessibilityRole="button"
        >
          <Text style={styles.doneBtnText}>DONE</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    zIndex: 80,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15,26,43,0.55)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#0F1A2B',
    fontSize: 18,
    fontWeight: '900',
  },
  list: {
    marginTop: 14,
    borderTopWidth: 1,
    borderColor: '#EDF2F7',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#EDF2F7',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    color: '#718096',
    fontSize: 15,
    fontWeight: '700',
  },
  rowTextActive: {
    color: '#0F1A2B',
    fontWeight: '800',
  },
  doneBtn: {
    marginTop: 22,
    backgroundColor: '#0F1A2B',
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
});
