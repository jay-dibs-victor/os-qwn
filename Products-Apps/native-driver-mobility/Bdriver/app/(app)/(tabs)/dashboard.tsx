import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useDriverStore } from '../../../src/store/driver';
import { PlatformMap } from '../../../src/components/driver/PlatformMap';
import EarningsHeader from '../../../src/components/driver/dashboard/EarningsHeader';
import GoButton from '../../../src/components/driver/dashboard/GoButton';
import StatusBar from '../../../src/components/driver/dashboard/StatusBar';
import TripHighlights from '../../../src/components/driver/dashboard/TripHighlights';
import FindingTrips from '../../../src/components/driver/dashboard/FindingTrips';
import ServiceFilterPills from '../../../src/components/driver/dashboard/ServiceFilterPills';
import IncomingRideSheet from '../../../src/components/driver/ride/IncomingRideSheet';
import DrivingToPickup from '../../../src/components/driver/ride/DrivingToPickup';
import ArrivedAtPickup from '../../../src/components/driver/ride/ArrivedAtPickup';
import InProgressTrip from '../../../src/components/driver/ride/InProgressTrip';
import TripSummaryCard from '../../../src/components/driver/ride/TripSummaryCard';
import CancelTripSheet from '../../../src/components/driver/ride/CancelTripSheet';
import CashConfirmationModal from '../../../src/components/driver/ride/CashConfirmationModal';
import CommissionRemittanceModal from '../../../src/components/driver/ride/CommissionRemittanceModal';
import CommissionDebtBanner from '../../../src/components/driver/dashboard/CommissionDebtBanner';
import TollModal from '../../../src/components/driver/ride/TollModal';
import { colors } from '../../../src/theme/colors';
import type { LatLng } from 'react-native-maps';

export default function DashboardScreen() {
  const phase = useDriverStore(s => s.phase);
  const isOnline = useDriverStore(s => s.isOnline);
  const currentRide = useDriverStore(s => s.currentRide);
  const goOnline = useDriverStore(s => s.goOnline);
  const goOffline = useDriverStore(s => s.goOffline);
  const commissionDebts = useDriverStore(s => s.commissionDebts);
  const totalCommissionOwed = useDriverStore(s => s.totalCommissionOwed);
  const [showCommissionModal, setShowCommissionModal] = React.useState(false);

  // Force show modal if there are unpaid debts
  useEffect(() => {
    if (commissionDebts.length > 0 && phase === 'searching') {
        setShowCommissionModal(true);
    }
  }, [commissionDebts, phase]);

  const [commissionLoading, setCommissionLoading] = React.useState(false);
  const addMoney = useDriverStore(s => s.addMoney);
  const heatPoints = useDriverStore(s => s.heatPoints);
  const surgeZones = useDriverStore(s => s.surgeZones);
  const mapRegion = useDriverStore(s => s.mapRegion);
  const mapRecenterTick = useDriverStore(s => s.mapRecenterTick);
  const setMapRegion = useDriverStore(s => s.setMapRegion);
  const recenterMap = useDriverStore(s => s.recenterMap);
  const currentLocation = useDriverStore(s => s.currentLocation);
  const locationPermission = useDriverStore(s => s.locationPermission);
  const setLocationPermission = useDriverStore(s => s.setLocationPermission);
  const setCurrentLocation = useDriverStore(s => s.setCurrentLocation);
  const cashCollected = useDriverStore(s => s.cashCollected);
  const completeCashTrip = useDriverStore(s => s.completeCashTrip);
  const confirmCashCollected = useDriverStore(s => s.confirmCashCollected);
  const reportRiderDidNotPay = useDriverStore(s => s.reportRiderDidNotPay);
  const payCommission = useDriverStore(s => s.payCommission);
  const skipCommission = useDriverStore(s => s.skipCommission);
  const wallet = useDriverStore(s => s.wallet);
  const routePolyline = useDriverStore(s => s.routePolyline);


  const lastCenteredRef = useRef<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (!currentLocation) return;
    const last = lastCenteredRef.current;
    const moved =
      !last ||
      Math.abs(currentLocation.latitude - last.lat) > 0.00005 ||
      Math.abs(currentLocation.longitude - last.lng) > 0.00005;
    if (!moved) return;
    lastCenteredRef.current = {
      lat: currentLocation.latitude,
      lng: currentLocation.longitude,
    };
    setMapRegion({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
  }, [currentLocation, setMapRegion]);

  const handleEnableLocation = async () => {
    if (Platform.OS === 'web') {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setLocationPermission('unavailable');
        return;
      }
      setLocationPermission('requesting');
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
          });
        });
        setCurrentLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? undefined,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        });
        setLocationPermission('granted');
      } catch {
        setLocationPermission('denied');
      }
      return;
    }
    setLocationPermission('requesting');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationPermission('denied');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCurrentLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? undefined,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
        timestamp: pos.timestamp,
      });
      setLocationPermission('granted');
    } catch {
      setLocationPermission('unavailable');
    }
  };

  const userPoint = useMemo(() => {
    if (!currentLocation) return null;
    return {
      id: 'driver-location',
      coordinate: { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
      title: 'You',
      pinColor: '#FFB800',
    };
  }, [currentLocation]);

  const mapPoints = useMemo(() => {
    const points: { id: string; coordinate: LatLng; title?: string; pinColor?: string }[] = [];
    if (userPoint) points.push(userPoint);
    if (currentRide) {
      points.push(
        { id: 'pickup', coordinate: currentRide.pickup, title: currentRide.pickup_address, pinColor: '#1F4BFF' },
        { id: 'drop', coordinate: currentRide.destination, title: currentRide.destination_address, pinColor: '#FF3B47' },
      );
    }
    return points;
  }, [userPoint, currentRide]);

  const showTripSheet =
    phase === 'driving_to_pickup' ||
    phase === 'arrived' ||
    phase === 'in_progress' ||
    phase === 'trip_complete';

  const handleGoPress = () => {
    if (isOnline) goOffline();
    else goOnline();
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleRecenterPress = async () => {
    if (currentLocation) {
      setMapRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
    recenterMap();
  };

  const showHeatAndSurge = phase === 'offline' || phase === 'searching' || phase === 'finding_trip';
  const showFilterPills = phase === 'offline';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <View style={styles.root}>

        {/* ── MAP layer — always behind everything ── */}
        <View style={styles.mapWrap} pointerEvents="box-none">
          <PlatformMap
            key={`map-${mapRecenterTick}`}
            points={mapPoints}
            path={routePolyline}
            heatPoints={showHeatAndSurge ? heatPoints : []}
            surgeZones={showHeatAndSurge ? surgeZones : []}
            initialRegion={mapRegion}
            userLocation={currentLocation}
            height={'100%'}
            interactive
            scrollEnabled
            zoomEnabled
            rotateEnabled={false}
            pitchEnabled={false}
          />
        </View>

        {/* ── OVERLAY layer — all UI sits above the map ── */}
        <View style={styles.overlayLayer} pointerEvents="box-none">

          <EarningsHeader />

          {commissionDebts.length > 0 && (
            <CommissionDebtBanner
              debts={commissionDebts}
              totalOwed={totalCommissionOwed}
              onPress={() => setShowCommissionModal(true)}
            />
          )}

          {/* Top-corner buttons: settings + recenter.
              Recenter stays visible during active trips so the driver
              can re-focus the map while navigating. */}
          <View style={styles.cornerRow} pointerEvents="box-none">
            {(phase === 'offline' || phase === 'searching') && (
              <Pressable
                onPress={handleSettingsPress}
                style={styles.cornerBtn}
                accessibilityRole="button"
                accessibilityLabel="Open profile and settings"
              >
                <Image source={require('../../../assets/icon.png')} style={styles.logo} />
              </Pressable>
            )}
            <View style={{ flex: 1 }} />
            <Pressable
              onPress={handleRecenterPress}
              style={styles.cornerBtn}
              accessibilityRole="button"
              accessibilityLabel="Recenter on your location"
            >
              <Ionicons name="locate" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          {locationPermission === 'denied' && (
            <View style={styles.locationPromptWrap} pointerEvents="box-none">
              <Pressable
                onPress={handleEnableLocation}
                style={styles.locationPrompt}
                accessibilityRole="button"
                accessibilityLabel="Enable location services"
              >
                <Ionicons name="location-outline" size={16} color="#0F1A2B" />
                <Text style={styles.locationPromptText}>Enable location to find rides</Text>
                <Ionicons name="chevron-forward" size={14} color="#0F1A2B" />
              </Pressable>
            </View>
          )}

          {showFilterPills && (
            <View style={styles.filterWrap} pointerEvents="box-none">
              <ServiceFilterPills />
            </View>
          )}

          {/* ── BOTTOM SHEETS ── */}
          <View style={styles.bottom} pointerEvents="box-none">

            {(phase === 'offline' || phase === 'searching') && (
              <View style={styles.goButtonWrap} pointerEvents="box-none">
                <GoButton onPress={handleGoPress} />
              </View>
            )}

            {phase === 'offline' && <StatusBar />}
            {phase === 'searching' && <FindingTrips />}
            {phase === 'incoming_ride' && <TripHighlights />}

            {showTripSheet && (
              <>
                {phase === 'driving_to_pickup' && <DrivingToPickup />}
                {phase === 'arrived' && <ArrivedAtPickup />}
                {phase === 'in_progress' && <InProgressTrip />}
                {phase === 'trip_complete' && <TripSummaryCard />}
              </>
            )}

            {phase === 'cancelled' && (
              <View style={styles.cancelledSheet}>
                <View style={styles.cancelledDot} />
                <Text style={styles.cancelledTitle}>Trip cancelled</Text>
                <Text style={styles.cancelledSubtitle}>Looking for the next ride…</Text>
              </View>
            )}
          </View>

        </View>
      </View>

      <IncomingRideSheet />
      <CancelTripSheet />
      <TollModal />
      <CashConfirmationModal 
        visible={phase === 'trip_complete' && currentRide?.paymentMethod === 'cash' && !cashCollected}
        amount={currentRide?.fare?.amount ?? 0}
        onConfirm={() => {
            confirmCashCollected();
            setShowCommissionModal(true);
        }}
        onRiderDidNotPay={() => {
            reportRiderDidNotPay();
        }}
      />
      <CommissionRemittanceModal
        visible={showCommissionModal}
        amount={currentRide?.commissionAmount ?? totalCommissionOwed}
        rideId={currentRide?.id ?? commissionDebts[0]?.rideId ?? ''}
        walletBalance={wallet.balance}
        loading={commissionLoading}
        onPayNow={async (method) => {
            const targetRideId = currentRide?.id ?? commissionDebts[0]?.rideId ?? '';
            setCommissionLoading(true);
            const success = await payCommission(targetRideId, method);
            setCommissionLoading(false);
            if (success && method === 'wallet') {
                setShowCommissionModal(false);
                useDriverStore.getState().resetAfterTrip();
            }
            return success;
        }}
        onSkip={() => {
            const targetRideId = currentRide?.id ?? commissionDebts[0]?.rideId ?? '';
            skipCommission(targetRideId);
            setShowCommissionModal(false);
            useDriverStore.getState().resetAfterTrip();
        }}
        onTopUp={async (amount: number) => {
            const targetRideId = currentRide?.id ?? commissionDebts[0]?.rideId ?? '';
            setCommissionLoading(true);
            const result = await addMoney(amount);
            if (result.success) {
                const paid = await payCommission(targetRideId, 'wallet');
                if (paid) {
                    setShowCommissionModal(false);
                    useDriverStore.getState().resetAfterTrip();
                }
            }
            setCommissionLoading(false);
        }}
        onPaymentComplete={() => {
            setShowCommissionModal(false);
            useDriverStore.getState().resetAfterTrip();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0E1726',
  },
  root: {
    flex: 1,
    backgroundColor: '#0E1726',
  },
  // Map fills the full screen, sits at the bottom of the stack
  mapWrap: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  // All UI overlays sit in this layer above the map/WebView
  overlayLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
    elevation: 10,
  },
  cornerRow: {
    position: 'absolute',
    top: 16,
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
    elevation: 20,
  },
  locationPromptWrap: {
    position: 'absolute',
    top: 120,
    left: 18,
    right: 18,
    zIndex: 20,
    elevation: 20,
  },
  filterWrap: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
  },
  // Bottom panel: anchored to the bottom edge, above the map
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
  },
  goButtonWrap: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  logo: {
    width: 24,
    height: 24,
  },
  cornerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0F1A2B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  locationPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#0F1A2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  locationPromptText: {
    flex: 1,
    color: '#0F1A2B',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelledSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 36,
    alignItems: 'center',
    gap: 6,
  },
  cancelledDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B47',
  },
  cancelledTitle: {
    color: '#0F1A2B',
    fontSize: 18,
    fontWeight: '900',
  },
  cancelledSubtitle: {
    color: '#718096',
    fontSize: 13,
    fontWeight: '600',
  },
});
