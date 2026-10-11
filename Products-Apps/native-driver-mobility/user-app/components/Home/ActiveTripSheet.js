import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Share, Platform } from 'react-native';
import { Phone, MessageSquare, Shield, X, Share2, Navigation } from 'lucide-react-native';
import { colors } from '../../theme/colors';

export default function ActiveTripSheet({
  appState, setAppState, pin, destination,
  startCall, setShowChat, setShowSafetyModal,
  handleCancelRide,
}) {
  const slideAnim = useRef(new Animated.Value(300)).current;

  const handleShareTrip = async () => {
    try {
      await Share.share({
        message: `🚗 I'm riding with Queens! Track my trip: https://queens.app/track/${pin || 'demo123'}\n\nDriver: Tunde • Silver Toyota Corolla\nDestination: ${destination || 'Ikeja City Mall'}\nETA: 15 min`,
        url: Platform.OS === 'ios' ? `queens://trip/${pin || 'demo123'}` : undefined,
        title: 'Share My Trip',
      });
    } catch {}
  };

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 12,
    }).start();
  }, [appState]);

  const [countdownSec, setCountdownSec] = useState(900);
  const [etaStartTime] = useState(Date.now());

  useEffect(() => {
    if (appState !== 'in_transit') return;
    const interval = setInterval(() => {
      setCountdownSec(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [appState]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const arrivalTime = () => {
    const now = new Date();
    const etaMs = countdownSec * 1000;
    const arr = new Date(now.getTime() + etaMs);
    return arr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const etaProgress = 1 - (countdownSec / 900);

  const renderAcceptedArrived = () => (
    <Animated.View style={[tripStyles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={tripStyles.handle} />

      {/* Driver Info */}
      <View style={tripStyles.driverRow}>
        <View style={tripStyles.avatar}>
          <View style={tripStyles.avatarImg}>
            <Text style={tripStyles.avatarInitials}>TO</Text>
          </View>
          <View style={tripStyles.onlineDot} />
        </View>
        <View style={tripStyles.driverMeta}>
          <View style={tripStyles.nameRow}>
            <Text style={tripStyles.driverName}>Tunde</Text>
            <Text style={tripStyles.driverRating}>4.9 ⭐</Text>
          </View>
          <Text style={tripStyles.carInfo}>Silver Toyota Corolla • ABC-123-XY</Text>
          <View style={tripStyles.badgeRow}>
            <Text style={tripStyles.vettedBadge}>✓ Vetted</Text>
            <Text style={tripStyles.insuredBadge}>✓ Insured</Text>
          </View>
        </View>
        <View style={tripStyles.pinBox}>
          <Text style={tripStyles.pinLabel}>PIN</Text>
          <Text style={tripStyles.pinValue}>{pin}</Text>
        </View>
      </View>

      {/* Vehicle Image Placeholder */}
      <View style={tripStyles.vehicleCard}>
        <View style={tripStyles.vehicleImgPlaceholder}>
          <Text style={tripStyles.vehicleImgIcon}>🚗</Text>
        </View>
        <View style={tripStyles.vehicleMeta}>
          <Text style={tripStyles.vehicleModel}>Toyota Corolla (2022)</Text>
          <Text style={tripStyles.vehicleColor}>Silver • 4.2 ★ on Queens fleet</Text>
          <Text style={tripStyles.vehicleFeatures}>AC • Bluetooth • USB charging</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={tripStyles.actionRow}>
        <TouchableOpacity style={tripStyles.actionBtn} onPress={startCall} activeOpacity={0.7}>
          <View style={tripStyles.actionIcon}><Phone color={colors.gold.bright} size={20} /></View>
          <Text style={tripStyles.actionLabel}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tripStyles.actionBtn} onPress={() => setShowChat(true)} activeOpacity={0.7}>
          <View style={tripStyles.actionIcon}><MessageSquare color={colors.gold.bright} size={20} /></View>
          <Text style={tripStyles.actionLabel}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tripStyles.actionBtn} onPress={() => setShowSafetyModal(true)} activeOpacity={0.7}>
          <View style={tripStyles.actionIcon}><Shield color={colors.gold.bright} size={20} /></View>
          <Text style={tripStyles.actionLabel}>Safety</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tripStyles.actionBtn} onPress={handleShareTrip} activeOpacity={0.7}>
          <View style={tripStyles.actionIcon}><Share2 color={colors.gold.bright} size={20} /></View>
          <Text style={tripStyles.actionLabel}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tripStyles.actionBtn} onPress={handleCancelRide} activeOpacity={0.7}>
          <View style={[tripStyles.actionIcon, { borderColor: 'rgba(255,71,87,0.3)' }]}><X color={colors.error} size={20} /></View>
          <Text style={[tripStyles.actionLabel, { color: colors.error }]}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Status Banner */}
      <TouchableOpacity
        style={tripStyles.statusBanner}
        onPress={() => setAppState('in_transit')}
        activeOpacity={0.85}
      >
        <Navigation color={colors.bg.deep} size={16} />
        <Text style={tripStyles.statusText}>
          {appState === 'accepted' ? 'Driver arriving in 3 min' : 'Driver arrived! Share PIN: 4829'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderInTransit = () => (
    <Animated.View style={[tripStyles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={tripStyles.handle} />
      <View style={tripStyles.sheetHeader}>
        <View>
          <Text style={tripStyles.sheetTitle}>En route</Text>
          <Text style={tripStyles.sheetDest} numberOfLines={1}>{destination || 'Ikeja Mall'}</Text>
          <Text style={tripStyles.arrivalTime}>Arriving at {arrivalTime()}</Text>
        </View>
        <Text style={tripStyles.etaText}>{formatTime(countdownSec)}</Text>
      </View>

      {/* ETA Progress Bar */}
      <View style={tripStyles.etaBarOuter}>
        <View style={[tripStyles.etaBarInner, { width: `${Math.min(etaProgress * 100, 100)}%` }]} />
      </View>

      {/* Driver Info (compact) */}
      <View style={tripStyles.driverRow}>
        <View style={tripStyles.avatar}>
          <View style={tripStyles.avatarImg}>
            <Text style={tripStyles.avatarInitials}>TO</Text>
          </View>
          <View style={tripStyles.onlineDot} />
        </View>
        <View style={tripStyles.driverMeta}>
          <View style={tripStyles.nameRow}>
            <Text style={tripStyles.driverName}>Tunde</Text>
            <Text style={tripStyles.driverRating}>4.9 ⭐</Text>
          </View>
          <Text style={tripStyles.carInfo}>Silver Toyota Corolla • ABC-123-XY</Text>
        </View>
      </View>

      {/* Vehicle Image Placeholder */}
      <View style={tripStyles.vehicleCard}>
        <View style={tripStyles.vehicleImgPlaceholder}>
          <Text style={tripStyles.vehicleImgIcon}>🚗</Text>
        </View>
        <View style={tripStyles.vehicleMeta}>
          <Text style={tripStyles.vehicleModel}>Toyota Corolla (2022)</Text>
          <Text style={tripStyles.vehicleColor}>Silver • 4.2 ★ on Queens fleet</Text>
          <Text style={tripStyles.vehicleFeatures}>AC • Bluetooth • USB charging</Text>
        </View>
      </View>

      <View style={tripStyles.actionRow}>
        <TouchableOpacity style={tripStyles.actionBtn} onPress={() => setShowSafetyModal(true)} activeOpacity={0.7}>
          <View style={tripStyles.actionIcon}><Shield color={colors.gold.bright} size={20} /></View>
          <Text style={tripStyles.actionLabel}>Safety</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tripStyles.actionBtn} onPress={handleShareTrip} activeOpacity={0.7}>
          <View style={tripStyles.actionIcon}><Share2 color={colors.gold.bright} size={20} /></View>
          <Text style={tripStyles.actionLabel}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tripStyles.actionBtn} onPress={handleCancelRide} activeOpacity={0.7}>
          <View style={[tripStyles.actionIcon, { borderColor: 'rgba(255,71,87,0.3)' }]}><X color={colors.error} size={20} /></View>
          <Text style={[tripStyles.actionLabel, { color: colors.error }]}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={tripStyles.statusBanner}
        onPress={() => setAppState('completed')}
        activeOpacity={0.85}
      >
        <Text style={tripStyles.statusText}>Complete Trip</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (appState === 'accepted' || appState === 'arrived') return renderAcceptedArrived();
  if (appState === 'in_transit') return renderInTransit();
  return null;
}

const tripStyles = {
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(20,24,40,0.95)',
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
  driverRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.gold.bright,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gold.bright,
  },
  avatarInitials: { fontSize: 18, fontWeight: '900', color: colors.bg.deep },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#141828',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  driverMeta: { flex: 1, marginLeft: 14 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  driverName: { fontSize: 17, fontWeight: '800', color: colors.text.primary },
  driverRating: { fontSize: 12, color: colors.gold.bright, fontWeight: '700' },
  carInfo: { color: colors.text.secondary, fontSize: 12, marginTop: 3 },
  badgeRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  vettedBadge: { fontSize: 10, color: colors.success, fontWeight: '700', letterSpacing: 0.3 },
  insuredBadge: { fontSize: 10, color: colors.success, fontWeight: '700', letterSpacing: 0.3 },
  pinBox: {
    alignItems: 'center',
    backgroundColor: colors.bg.deep,
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.25)',
    padding: 10,
    borderRadius: 12,
  },
  pinLabel: { fontSize: 9, color: colors.text.secondary, fontWeight: '700', letterSpacing: 1 },
  pinValue: { fontSize: 18, fontWeight: '800', color: colors.gold.bright, marginTop: 2 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  actionBtn: { alignItems: 'center', flex: 1 },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg.deep,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,208,96,0.15)',
  },
  actionLabel: { fontSize: 11, fontWeight: '700', color: colors.text.primary, letterSpacing: 0.3 },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.deep,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,208,96,0.1)',
  },
  vehicleImgPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255,193,7,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  vehicleImgIcon: { fontSize: 28 },
  vehicleMeta: { flex: 1 },
  vehicleModel: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  vehicleColor: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  vehicleFeatures: { fontSize: 11, color: colors.gold.bright, marginTop: 3, fontWeight: '600' },
  statusBanner: {
    backgroundColor: colors.gold.bright,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: colors.gold.bright,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  statusText: { color: colors.bg.deep, fontWeight: '800', fontSize: 14, letterSpacing: 0.3 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: colors.text.primary },
  sheetDest: { fontSize: 13, color: colors.text.secondary, marginTop: 2, maxWidth: 200 },
  arrivalTime: { fontSize: 11, color: colors.gold.bright, fontWeight: '600', marginTop: 4 },
  etaText: { fontSize: 22, fontWeight: '900', color: colors.gold.bright },
  etaBarOuter: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  etaBarInner: {
    height: '100%',
    backgroundColor: colors.gold.bright,
    borderRadius: 2,
  },
};
