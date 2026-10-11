import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { styles } from './homeStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 80) / 2.5;

export default function VehicleSelector({
  pickup, destination, routeInfo,
  selectedVehicle, setSelectedVehicle,
  VEHICLE_TYPES, calculatePrice, getSurgeMultiplier, getRouteFallback,
  handleRequestRide, editTripField,
}) {
  const scrollRef = useRef(null);
  const selectedIndex = VEHICLE_TYPES.findIndex(v => v.id === selectedVehicle);

  const scrollToSelected = () => {
    if (scrollRef.current && selectedIndex >= 0) {
      scrollRef.current.scrollTo({
        x: selectedIndex * (CARD_WIDTH + 12) - 20,
        animated: true,
      });
    }
  };

  return (
    <View style={vehicleStyles.sheet}>
      {/* Trip Summary */}
      <TouchableOpacity style={vehicleStyles.tripRow} onPress={() => editTripField('destination')} activeOpacity={0.7}>
        <View style={vehicleStyles.tripDots}>
          <View style={vehicleStyles.dot} />
          <View style={vehicleStyles.dash} />
          <View style={vehicleStyles.square} />
        </View>
        <View style={vehicleStyles.tripMeta}>
          <Text style={vehicleStyles.pickupLabel}>Pickup</Text>
          <Text style={vehicleStyles.pickupText} numberOfLines={1}>{pickup}</Text>
          <Text style={vehicleStyles.destLabel}>Drop-off</Text>
          <Text style={vehicleStyles.destText} numberOfLines={1}>{destination}</Text>
        </View>
        <View style={vehicleStyles.tripRight}>
          <Text style={vehicleStyles.distText}>{routeInfo.distance || getRouteFallback().distance}</Text>
          <Text style={vehicleStyles.durText}>{routeInfo.duration || getRouteFallback().duration}</Text>
          <ChevronRight color={colors.gold.bright} size={16} />
        </View>
      </TouchableOpacity>

      {/* Surge Banner */}
      {getSurgeMultiplier() > 1 && (
        <View style={vehicleStyles.surgeBanner}>
          <Text style={vehicleStyles.surgeText}>⚡ 1.2x surge — Lekki/Ikeja zone</Text>
        </View>
      )}

      {/* Horizontal Vehicle Cards */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={vehicleStyles.cardsContainer}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        onContentSizeChange={scrollToSelected}
      >
        {VEHICLE_TYPES.map((v) => {
          const finalPrice = calculatePrice(v.base);
          const isSelected = selectedVehicle === v.id;
          const eta = v.id === 'economy' ? '3 min' : v.id === 'standard' ? '5 min' : '7 min';
          return (
            <TouchableOpacity
              key={v.id}
              style={[vehicleStyles.card, isSelected && vehicleStyles.cardSelected]}
              onPress={() => {
                setSelectedVehicle(v.id);
                scrollToSelected();
              }}
              activeOpacity={0.85}
            >
              <View style={vehicleStyles.cardIconWrap}>
                <Text style={vehicleStyles.cardIcon}>{v.icon}</Text>
              </View>
              <Text style={[vehicleStyles.cardName, isSelected && vehicleStyles.cardNameSelected]}>{v.name}</Text>
              <Text style={vehicleStyles.cardPrice}>₦{finalPrice.toLocaleString()}</Text>
              <Text style={vehicleStyles.cardEta}>{eta}</Text>
              <Text style={[vehicleStyles.cardDesc, isSelected && vehicleStyles.cardDescSelected]}>{v.desc}</Text>
              {isSelected && (
                <View style={vehicleStyles.selectedBadge}>
                  <Text style={vehicleStyles.selectedBadgeText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Request Button */}
      <TouchableOpacity style={vehicleStyles.requestBtn} onPress={handleRequestRide} activeOpacity={0.85}>
        <Text style={vehicleStyles.requestBtnText}>
          Request {selectedVehicle.toUpperCase()} • ₦{calculatePrice(VEHICLE_TYPES.find(v => v.id === selectedVehicle).base).toLocaleString()}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const vehicleStyles = {
  sheet: {
    backgroundColor: 'rgba(20,24,40,0.92)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    paddingBottom: 100,
    elevation: 30,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,208,96,0.2)',
    zIndex: 20,
    backdropFilter: 'blur(20px)',
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.deep,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,208,96,0.15)',
  },
  tripDots: { alignItems: 'center', marginRight: 12, width: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold.bright },
  dash: { width: 2, height: 20, backgroundColor: colors.gold.bright, marginVertical: 4, opacity: 0.4 },
  square: { width: 8, height: 8, backgroundColor: colors.white, borderRadius: 2 },
  tripMeta: { flex: 1 },
  pickupLabel: { fontSize: 9, color: colors.text.secondary, fontWeight: '700', letterSpacing: 0.5, marginBottom: 1 },
  pickupText: { fontSize: 12, color: colors.text.primary, fontWeight: '600', marginBottom: 6 },
  destLabel: { fontSize: 9, color: colors.text.secondary, fontWeight: '700', letterSpacing: 0.5, marginBottom: 1 },
  destText: { fontSize: 13, color: colors.text.primary, fontWeight: '700' },
  tripRight: { alignItems: 'flex-end', marginLeft: 8 },
  distText: { fontSize: 13, color: colors.text.primary, fontWeight: '700' },
  durText: { fontSize: 10, color: colors.text.secondary, marginTop: 2, marginBottom: 4 },
  surgeBanner: {
    backgroundColor: 'rgba(255,193,7,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.3)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  surgeText: { color: colors.gold.bright, fontWeight: '700', fontSize: 11, textAlign: 'center', letterSpacing: 0.3 },
  cardsContainer: { paddingVertical: 6, gap: 12, marginBottom: 16 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.bg.deep,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,208,96,0.15)',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardSelected: {
    backgroundColor: colors.gold.bright,
    borderColor: colors.gold.bright,
    elevation: 8,
    shadowColor: colors.gold.bright,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,208,96,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: { fontSize: 24 },
  cardName: { fontSize: 13, fontWeight: '700', color: colors.text.primary, marginBottom: 2, textAlign: 'center' },
  cardNameSelected: { color: colors.bg.deep },
  cardPrice: { fontSize: 18, fontWeight: '900', color: colors.gold.bright, marginBottom: 2 },
  cardEta: { fontSize: 11, color: colors.text.secondary, fontWeight: '600', marginBottom: 4 },
  cardDesc: { fontSize: 10, color: colors.text.secondary, textAlign: 'center', lineHeight: 14 },
  cardDescSelected: { color: colors.bg.deep, opacity: 0.7 },
  cardPriceSelected: { color: colors.bg.deep },
  selectedBadge: {
    backgroundColor: colors.bg.deep,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 8,
  },
  selectedBadgeText: { fontSize: 9, fontWeight: '800', color: colors.gold.bright, letterSpacing: 0.5 },
  requestBtn: {
    backgroundColor: colors.gold.bright,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.gold.bright,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  requestBtnText: { color: colors.bg.deep, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
};
