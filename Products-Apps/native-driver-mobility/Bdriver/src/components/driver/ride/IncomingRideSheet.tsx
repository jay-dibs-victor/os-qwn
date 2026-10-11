import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDriverStore } from '../../../store/driver';
import { colors } from '../../../theme/colors';
import type { PaymentMethod } from '../../../api/dto';

function paymentIcon(method: PaymentMethod): string {
  switch (method) {
    case 'cash': return 'cash-outline';
    case 'wallet': return 'wallet-outline';
    case 'bank_card': return 'card-outline';
    case 'voucher': return 'pricetag-outline';
    case 'opay': return 'phone-portrait-outline';
    case 'queens_coin': return 'logo-usd';
    default: return 'card-outline';
  }
}

function paymentLabel(method: PaymentMethod): string {
  switch (method) {
    case 'cash': return 'Cash Trip';
    case 'wallet': return 'Wallet Trip';
    case 'bank_card': return 'Card Trip';
    case 'voucher': return 'Voucher Trip';
    case 'opay': return 'Opay Trip';
    case 'queens_coin': return 'Coin Trip';
    default: return 'Trip';
  }
}

export default function IncomingRideSheet() {
  const currentRide = useDriverStore(s => s.currentRide);
  const phase = useDriverStore(s => s.phase);
  const countdown = useDriverStore(s => s.countdown);
  const acceptRide = useDriverStore(s => s.acceptCurrentRide);
  const declineRide = useDriverStore(s => s.declineCurrentRide);

  const slideUp = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentRide && phase === 'incoming_ride') {
      slideUp.setValue(80);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(slideUp, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0.85, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [currentRide, phase, slideUp, opacity, pulse]);

  if (!currentRide || phase !== 'incoming_ride') return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={declineRide} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideUp }], opacity }]}>
        <Pressable
          onPress={declineRide}
          style={styles.noThanks}
          accessibilityRole="button"
          accessibilityLabel="Decline ride"
        >
          <Ionicons name="close" size={14} color="#0F1A2B" />
          <Text style={styles.noThanksText}>No Thanks</Text>
        </Pressable>

        <View style={styles.row}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeValue}>{currentRide.duration_min}</Text>
            <Text style={styles.timeUnit}>min</Text>
          </View>
          <View style={styles.metaColumn}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>{currentRide.fare.currency}{currentRide.fare.amount.toFixed(2)}</Text>
              {currentRide.fare.surge > 1 && (
                <View style={styles.surgePill}>
                  <Ionicons name="flash" size={10} color="#0F1A2B" />
                  <Text style={styles.surgeText}>{currentRide.fare.surge.toFixed(1)}x</Text>
                </View>
              )}
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaSubLabel}>{currentRide.distance_km.toFixed(1)} km</Text>
            </View>
            <View style={styles.metaItem}>
              <View style={styles.starRow}>
                <Ionicons name="star" size={13} color={colors.primary} />
                <Text style={styles.metaSubLabel}> {currentRide.passenger.rating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.paymentRow}>
          <View style={[styles.paymentPill, styles[`payment_${currentRide.paymentMethod}` as keyof typeof styles] || styles.payment_default]}>
            <Ionicons name={paymentIcon(currentRide.paymentMethod)} size={12} color="#FFFFFF" />
            <Text style={styles.paymentText}>{paymentLabel(currentRide.paymentMethod)}</Text>
          </View>
        </View>

        <View style={styles.routeRow}>
          <View style={[styles.routeDot, styles.pickupDot]} />
          <Text style={styles.routeText} numberOfLines={1}>{currentRide.pickup_address}</Text>
        </View>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, styles.dropDot]} />
          <Text style={styles.routeText} numberOfLines={1}>{currentRide.destination_address}</Text>
        </View>

        <Pressable
          onPress={acceptRide}
          accessibilityRole="button"
          accessibilityLabel={`Accept ride, ${currentRide.fare.currency}${currentRide.fare.amount.toFixed(2)}`}
          style={({ pressed }) => [styles.acceptBtn, pressed && { opacity: 0.92 }]}
        >
          <Text style={styles.acceptBtnText}>TAP TO ACCEPT</Text>
          <Animated.View style={[styles.countdownPill, { transform: [{ scale: pulse }] }]}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    zIndex: 60,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15,26,43,0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 26,
  },
  noThanks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
    backgroundColor: '#F1F4F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  noThanksText: {
    color: '#0F1A2B',
    fontSize: 12,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  timeValue: {
    color: '#0F1A2B',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  timeUnit: {
    color: '#0F1A2B',
    fontSize: 18,
    fontWeight: '800',
  },
  metaColumn: {
    flexDirection: 'row',
    gap: 14,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    color: '#0F1A2B',
    fontSize: 14,
    fontWeight: '800',
  },
  metaSubLabel: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '600',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  paymentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  payment_cash: {
    backgroundColor: '#38A169',
  },
  payment_wallet: {
    backgroundColor: '#1F4BFF',
  },
  payment_bank_card: {
    backgroundColor: '#0F1A2B',
  },
  payment_voucher: {
    backgroundColor: '#D69E2E',
  },
  payment_opay: {
    backgroundColor: '#805AD5',
  },
  payment_queens_coin: {
    backgroundColor: '#DD6B20',
  },
  payment_default: {
    backgroundColor: '#718096',
  },
  paymentText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  surgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFB800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  surgeText: {
    color: '#0F1A2B',
    fontSize: 10,
    fontWeight: '900',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pickupDot: {
    backgroundColor: '#1F4BFF',
  },
  dropDot: {
    backgroundColor: '#0F1A2B',
  },
  routeText: {
    flex: 1,
    color: '#0F1A2B',
    fontSize: 13,
    fontWeight: '700',
  },
  acceptBtn: {
    marginTop: 18,
    backgroundColor: '#0F1A2B',
    borderRadius: 28,
    height: 56,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  countdownPill: {
    minWidth: 38,
    height: 30,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    color: '#0F1A2B',
    fontSize: 14,
    fontWeight: '900',
  },
});
