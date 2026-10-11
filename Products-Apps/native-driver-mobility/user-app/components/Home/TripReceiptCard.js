import React, { useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { colors } from '../../theme/colors';

const TIP_OPTIONS = [200, 500, 1000];

export default function TripReceiptCard({
  selectedVehicle, VEHICLE_TYPES, calculatePrice, paymentMethod,
  rating, setRating, tip, setTip, reviewText, setReviewText, submitFeedback,
  fareBreakdown,
}) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const finalCost = calculatePrice(VEHICLE_TYPES.find(v => v.id === selectedVehicle).base);
  const breakdown = fareBreakdown || { baseFare: finalCost, distanceCharge: 0, timeCharge: 0, surgeMultiplier: 1, stopsCharge: 0 };

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 12,
    }).start();
  }, []);

  return (
    <Animated.View style={[receiptStyles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={receiptStyles.handle} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Receipt Header */}
        <View style={receiptStyles.headerSection}>
          <View style={receiptStyles.checkmark}>
            <Text style={receiptStyles.checkmarkText}>✓</Text>
          </View>
          <Text style={receiptStyles.headerLabel}>Trip Complete</Text>
          <Text style={receiptStyles.headerTitle}>Queens Ride</Text>
          <Text style={receiptStyles.totalAmount}>₦{finalCost.toLocaleString()}</Text>
          <Text style={receiptStyles.paymentLabel}>
            Paid via {paymentMethod === 'wallet' ? 'Digital Wallet' : paymentMethod === 'card' ? 'Card' : 'Cash'}
          </Text>
        </View>

        {/* Fare Breakdown */}
        <View style={receiptStyles.fareBreakdown}>
          <View style={receiptStyles.fareRow}>
            <Text style={receiptStyles.fareLabel}>Base fare</Text>
            <Text style={receiptStyles.fareValue}>₦{breakdown.baseFare.toLocaleString()}</Text>
          </View>
          {breakdown.distanceCharge > 0 && (
            <View style={receiptStyles.fareRow}>
              <Text style={receiptStyles.fareLabel}>Distance charge</Text>
              <Text style={receiptStyles.fareValue}>₦{breakdown.distanceCharge.toLocaleString()}</Text>
            </View>
          )}
          {breakdown.timeCharge > 0 && (
            <View style={receiptStyles.fareRow}>
              <Text style={receiptStyles.fareLabel}>Time charge</Text>
              <Text style={receiptStyles.fareValue}>₦{breakdown.timeCharge.toLocaleString()}</Text>
            </View>
          )}
          {breakdown.surgeMultiplier > 1 && (
            <View style={receiptStyles.fareRow}>
              <Text style={receiptStyles.fareLabel}>{breakdown.surgeMultiplier}x Surge pricing</Text>
              <Text style={[receiptStyles.fareValue, { color: colors.gold.bright }]}>Active</Text>
            </View>
          )}
          {breakdown.stopsCharge > 0 && (
            <View style={receiptStyles.fareRow}>
              <Text style={receiptStyles.fareLabel}>Stops fee</Text>
              <Text style={receiptStyles.fareValue}>₦{breakdown.stopsCharge.toLocaleString()}</Text>
            </View>
          )}
          <View style={receiptStyles.fareDivider} />
          <View style={receiptStyles.fareRow}>
            <Text style={[receiptStyles.fareLabel, { fontWeight: '800', color: colors.text.primary }]}>Total</Text>
            <Text style={[receiptStyles.fareValue, { fontWeight: '800', color: colors.text.primary }]}>₦{finalCost.toLocaleString()}</Text>
          </View>
        </View>

        <View style={receiptStyles.divider} />

        {/* Rating */}
        <Text style={receiptStyles.sectionLabel}>Rate your driver</Text>
        <View style={receiptStyles.ratingRow}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
              <Text style={[receiptStyles.star, star <= rating && receiptStyles.starActive]}>
                {star <= rating ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tip */}
        <Text style={receiptStyles.sectionLabel}>Add a tip</Text>
        <View style={receiptStyles.tipRow}>
          {TIP_OPTIONS.map(amount => (
            <TouchableOpacity
              key={amount}
              style={[receiptStyles.tipBtn, tip === amount && receiptStyles.tipBtnSelected]}
              onPress={() => setTip(tip === amount ? 0 : amount)}
              activeOpacity={0.7}
            >
              <Text style={[receiptStyles.tipBtnText, tip === amount && receiptStyles.tipBtnTextSelected]}>
                ₦{amount.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Review */}
        <TextInput
          style={receiptStyles.reviewInput}
          placeholder="Leave a review for Tunde..."
          placeholderTextColor={colors.text.muted}
          value={reviewText}
          onChangeText={setReviewText}
          multiline
        />

        {/* Submit */}
        <TouchableOpacity style={receiptStyles.submitBtn} onPress={submitFeedback} activeOpacity={0.85}>
          <Text style={receiptStyles.submitBtnText}>Submit Feedback</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}

const receiptStyles = {
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(20,24,40,0.96)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,208,96,0.2)',
    padding: 20,
    paddingBottom: 100,
    elevation: 30,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    zIndex: 20,
    maxHeight: 520,
    backdropFilter: 'blur(20px)',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerSection: { alignItems: 'center', marginBottom: 16 },
  checkmark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkmarkText: { color: colors.white, fontSize: 22, fontWeight: '900' },
  headerLabel: { fontSize: 12, color: colors.success, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text.secondary },
  totalAmount: { fontSize: 42, fontWeight: '900', color: colors.text.primary, marginVertical: 8 },
  paymentLabel: { fontSize: 13, color: colors.text.secondary },
  fareBreakdown: { paddingHorizontal: 4, marginBottom: 20 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  fareLabel: { fontSize: 13, color: colors.text.secondary },
  fareValue: { fontSize: 13, color: colors.text.secondary, fontWeight: '600' },
  fareDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 8 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '800', color: colors.text.primary, marginBottom: 12, letterSpacing: 0.3 },
  ratingRow: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  star: { fontSize: 32, color: 'rgba(255,255,255,0.15)' },
  starActive: { color: colors.gold.bright },
  tipRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tipBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,208,96,0.2)',
    alignItems: 'center',
    backgroundColor: colors.bg.deep,
  },
  tipBtnSelected: {
    borderColor: colors.gold.bright,
    backgroundColor: colors.gold.bright,
  },
  tipBtnText: { color: colors.text.primary, fontWeight: '700', fontSize: 14 },
  tipBtnTextSelected: { color: colors.bg.deep, fontWeight: '800' },
  reviewInput: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 20,
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: colors.bg.deep,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,208,96,0.12)',
    minHeight: 80,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  },
  submitBtn: {
    backgroundColor: colors.gold.bright,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.gold.bright,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
  },
  submitBtnText: { color: colors.bg.deep, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
};
