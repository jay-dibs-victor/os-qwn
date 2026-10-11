import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator, Platform, Animated, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from '../components/MapViewWrapper';
import { Search, MapPin, ChevronRight, Clock, User, Home, RefreshCw, Phone, Menu } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useRide } from '../contexts/RideContext';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/Home/TopBar';
import SearchPanel from '../components/Home/SearchPanel';
import VehicleSelector from '../components/Home/VehicleSelector';
import MatchingOverlay from '../components/Home/MatchingOverlay';
import ActiveTripSheet from '../components/Home/ActiveTripSheet';
import TripReceiptCard from '../components/Home/TripReceiptCard';
import CallModal from '../components/Home/CallModal';
import ChatModal from '../components/Home/ChatModal';
import SafetyModal from '../components/Home/SafetyModal';
import WalletModal from '../components/Home/WalletModal';
import MenuModal from '../components/Home/MenuModal';
import BottomNav from '../components/Home/BottomNav';
import DrawerMenu from '../components/Home/DrawerMenu';
import ErrorBanner from '../components/ErrorBanner';
import { styles } from '../components/Home/homeStyles';
import { storage } from '../lib/storage';
import { analytics } from '../lib/analytics';

const { width, height } = Dimensions.get('window');

const walletTabStyles = {
  balanceCard: { backgroundColor: colors.bg.deep, padding: 24, borderRadius: 24, marginHorizontal: 20, marginTop: 20, borderWidth: 1, borderColor: 'rgba(255,208,96,0.3)', shadowColor: colors.gold.bright, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 8 },
  balanceLabel: { color: colors.text.secondary, fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  balanceValue: { color: colors.text.primary, fontSize: 36, fontWeight: '900', marginVertical: 10 },
  topUpBtn: { backgroundColor: colors.gold.bright, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignSelf: 'flex-start', marginTop: 8 },
  topUpBtnText: { color: colors.bg.deep, fontWeight: '800', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text.primary, marginHorizontal: 20, marginTop: 32, marginBottom: 16 },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.deep, padding: 18, borderRadius: 18, marginHorizontal: 20, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  methodActive: { borderColor: colors.gold.bright, backgroundColor: 'rgba(255,208,96,0.05)' },
  methodIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  methodMeta: { flex: 1 },
  methodLabel: { color: colors.text.primary, fontSize: 15, fontWeight: '700' },
  methodDesc: { color: colors.text.secondary, fontSize: 12, marginTop: 2 },
  methodSelect: { fontSize: 12, fontWeight: '800', color: colors.gold.bright },
  methodSelectActive: { color: colors.success },
  viewAllBtn: { padding: 16, alignItems: 'center' },
  viewAllBtnText: { color: colors.gold.bright, fontSize: 14, fontWeight: '700' },
};

export default function HomeScreen({ navigation }) {
  const { 
    rideData, addCompletedRide, 
    reverseGeocode, getRouteCoordinates 
  } = useRide();

  const VEHICLE_TYPES = [
    { id: 'economy', name: 'Queens Economy', price: '₦1,200', desc: 'Affordable everyday rides', base: 1200, multiplier: 1, icon: '🚗' },
    { id: 'standard', name: 'Queens Standard', price: '₦2,500', desc: 'Newer cars, top-rated drivers', base: 2500, multiplier: 1.5, icon: '🚙' },
    { id: 'luxury', name: 'Queens Luxury', price: '₦5,000', desc: 'Premium luxury vehicles', base: 5000, multiplier: 2.2, icon: '🖤' },
  ];

  const PROMOTIONS = [
    { id: 1, title: '50% off next ride', desc: 'Up to ₦500 discount on your next Queens Economy trip', code: 'QUEENS50', expires: 'Jun 15, 2026', color: '#FFD700' },
    { id: 2, title: 'Weekend free ride', desc: 'Max ₦1,000 off on weekend trips to any destination', code: 'WEEKEND1000', expires: 'Jun 20, 2026', color: '#FF8C00' },
    { id: 3, title: 'Refer & earn ₦1,500', desc: 'Refer a friend and get ₦1,500 when they take their first ride', code: 'REFER1500', expires: 'Jul 1, 2026', color: '#32CD32' },
    { id: 4, title: 'Airport flat ₦3,000', desc: 'Flat ₦3,000 rides to/from MMA Terminal 1 & 2', code: 'AIRPORT3K', expires: 'Jun 30, 2026', color: '#1E90FF' },
  ];

  const [region, setRegion] = useState({ latitude: 6.4281, longitude: 3.4215, latitudeDelta: 0.05, longitudeDelta: 0.05 });
  const [appState, setAppState] = useState('idle');
  const [activeTab, setActiveTab] = useState('Home');
  const [searchActive, setSearchActive] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [locationPermission, setLocationPermission] = useState('pending');
  const [userLocation, setUserLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dropoffCoord, setDropoffCoord] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([
    { id: 1, lat: 0.008, lon: -0.005, name: 'Emeka', type: 'Standard' },
    { id: 2, lat: -0.004, lon: 0.006, name: 'Yusuf', type: 'Economy' },
  ]);
  const [selectedVehicle, setSelectedVehicle] = useState('economy');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [walletBalance, setWalletBalance] = useState(6500);
  const [screenLoading, setScreenLoading] = useState(true);
  const [screenError, setScreenError] = useState(null);
  const [locRetry, setLocRetry] = useState(0);
  const [pickup, setPickup] = useState('Adekunle Lawal Road');
  const [pickupCoord, setPickupCoord] = useState({ latitude: 6.4281, longitude: 3.4215 });
  const [destination, setDestination] = useState('');
  const [activeInput, setActiveInput] = useState('destination');
  const [stops, setStops] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [rideHistory, setRideHistory] = useState([
    { label: 'Trinity House', detail: 'Lekki Phase 1 • 4.5 km', price: '₦1,800', status: 'Upcoming' },
    { label: 'Terminal 2 Lagos Murtala Muhammed Airport', detail: 'Airport Road • 17.8 km', price: '₦4,200', status: 'Completed' },
    { label: 'Providus Bank Corporate Office', detail: 'Victoria Island • 2.6 km', price: '₦1,200', status: 'Completed' },
  ]);
  const { logout } = useAuth();
  const [profile] = useState({ name: 'Brian Oshinbolu', email: 'brian@queenslagos.app', rating: 4.95 });
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'wallet', label: 'Digital Wallet', description: '₦6,500 available', active: true },
    { id: 'card', label: 'Mastercard • 1234', description: 'Linked debit card', active: false },
    { id: 'cash', label: 'Cash', description: 'Pay driver directly', active: false },
  ]);
  const [matchingStep, setMatchingStep] = useState(0);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState({ distance: '', duration: '' });
  const [driverPos, setDriverPos] = useState({ latitude: 6.438, longitude: 3.435 });
  const [pin] = useState('4829');
  const [showDrawer, setShowDrawer] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [rideSchedule, setRideSchedule] = useState('now');
  const [refreshing, setRefreshing] = useState(false);
  const drawerAnim = useRef(new Animated.Value(0)).current;

  // MODAL STATES
  const [showCall, setShowCall] = useState(false);
  const [callState, setCallState] = useState('calling');
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, text: 'I am at the main gate.', sender: 'driver', time: '10:05 AM' },
    { id: 2, text: 'Okay, coming out now.', sender: 'user', time: '10:06 AM' },
  ]);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [acceptedTime, setAcceptedTime] = useState(null);

  const [rating, setRating] = useState(5);
  const [tip, setTip] = useState(0);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status);
        if (status !== 'granted') {
          setScreenLoading(false);
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        setUserLocation(loc.coords);
        setRegion({
          ...region,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        setPickupCoord({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        
        const address = await reverseGeocode(loc.coords.latitude, loc.coords.longitude);
        setPickup(address || 'Current Location');
        
        const places = await storage.getSavedPlaces();
        setSavedPlaces(places);

        setScreenLoading(false);
      } catch (err) {
        setScreenError('Failed to get your location. Please check your GPS settings.');
        setScreenLoading(false);
      }
    })();
  }, [locRetry]);

  useEffect(() => {
    if (appState === 'matching') {
      const timer = setInterval(() => {
        setMatchingStep(prev => {
          if (prev >= 2) {
            clearInterval(timer);
            setTimeout(() => {
              setAppState('accepted');
              setAcceptedTime(Date.now());
              analytics.trackAction('ride_accepted');
            }, 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
      return () => clearInterval(timer);
    }
  }, [appState]);

  useEffect(() => {
    if (appState === 'accepted') {
      const timer = setTimeout(() => {
        setAppState('arrived');
        analytics.trackAction('driver_arrived');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  useEffect(() => {
    if (showDrawer) {
      Animated.timing(drawerAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(drawerAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    }
  }, [showDrawer]);

  const handleAllowLocation = async () => {
    setShowLocationPrompt(false);
    setLocRetry(c => c + 1);
  };

  const handlePlaceSelect = async (place) => {
    setDestination(place.label);
    setDropoffCoord({ latitude: 6.45, longitude: 3.48 }); // Mock
    setSearchActive(false);
    setAppState('details');
    analytics.trackAction('place_selected', { label: place.label });
    
    try {
      const coords = await getRouteCoordinates();
      setRouteCoordinates(coords);
      setRouteInfo({ distance: '12.4 km', duration: '28 min' });
    } catch (e) {}
  };

  const startRide = () => {
    setAppState('matching');
    analytics.trackAction('ride_requested', { vehicle: selectedVehicle, destination });
  };

  const cancelReasons = [
    { key: 'long_wait', label: 'Driver taking too long', fee: false },
    { key: 'wrong_address', label: 'Wrong pickup location', fee: false },
    { key: 'change_plan', label: 'Change of plans', fee: appState !== 'idle' },
    { key: 'too_expensive', label: 'Too expensive', fee: false },
    { key: 'driver_issue', label: 'Issue with driver/vehicle', fee: false },
    { key: 'other', label: 'Other reason', fee: appState !== 'idle' },
  ];

  const handleCancelRide = () => {
    const elapsedMinutes = (Date.now() - acceptedTime) / 60000;
    const hasFee = appState === 'accepted' && elapsedMinutes > 0.15;

    if (Platform.OS === 'web') {
      const reason = window.prompt('Why are you cancelling? (long_wait, wrong_address, change_plan, too_expensive, driver_issue, other)');
      if (reason) {
        analytics.trackAction('ride_cancelled', { appState, elapsedMinutes, reason });
        if (hasFee) setWalletBalance(b => Math.max(0, b - 500));
        setAppState('idle'); setStops([]); setDestination('');
      }
    } else {
      const cancelMessage = hasFee
        ? 'A flat ₦500 cancellation fee will be charged to your wallet for canceling after driver started moving.'
        : '';
      Alert.alert(
        'Why are you cancelling?',
        cancelMessage,
        cancelReasons.map(r => ({
          text: r.label + (r.fee || hasFee ? ' (₦500 fee)' : ''),
          style: 'destructive',
          onPress: () => {
            analytics.trackAction('ride_cancelled', { appState, elapsedMinutes, reason: r.key });
            if (hasFee) setWalletBalance(b => Math.max(0, b - 500));
            setAppState('idle'); setStops([]); setDestination('');
          },
        })).concat([{ text: 'Keep Ride', style: 'cancel' }]),
      );
    }
  };

  const handleEmergencySOS = () => {
    Alert.alert(
      'Emergency SOS',
      'This will immediately alert local emergency services and Queens dispatch team. Are you in danger?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send SOS', 
          style: 'destructive', 
          onPress: () => {
            analytics.trackAction('sos_dispatched');
            setTimeout(() => {
              Alert.alert('SOS Dispatched ✓', 'Emergency services have been notified. Help is on the way to your location.\n\nDispatch contact: 0800-QUEENS-911');
            }, 500);
          }
        }
      ]
    );
  };

  const startCall = () => {
    setShowCall(true);
    setCallState('calling');
    setTimeout(() => setCallState('connected'), 2000);
  };

  const endCall = () => setShowCall(false);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatHistory([...chatHistory, { id: Date.now(), text: chatMessage, sender: 'user', time: '10:07 AM' }]);
    setChatMessage('');
  };

  const handleFundWallet = () => {
    const amt = parseFloat(fundAmount);
    if (isNaN(amt) || amt <= 0) return Alert.alert('Invalid Amount', 'Please enter a valid amount.');
    setWalletBalance(b => b + amt);
    setFundAmount('');
    setShowFundModal(false);
    Alert.alert('Funding Successful', `₦${amt.toLocaleString()} has been added to your wallet.`);
  };

  const selectPaymentMethod = (id) => {
    setPaymentMethods(paymentMethods.map(m => ({ ...m, active: m.id === id })));
    setPaymentMethod(id);
  };

  const editTripField = (field) => {
    setAppState('idle');
    setSearchActive(true);
    setActiveInput(field);
  };

  const getRouteFallback = () => ({
    distance: destination.toLowerCase().includes('ikeja') ? '22.4 km' : '6.2 km',
    duration: destination.toLowerCase().includes('ikeja') ? '45 min' : '15 min',
  });

  const calculatePrice = (base) => {
    let price = base;
    const isIkeja = destination.toLowerCase().includes('ikeja');
    const km = isIkeja ? 22 : 6;
    const min = isIkeja ? 45 : 15;
    price += stops.length * 800;
    price += km * 150 + min * 50;
    const pickupLower = pickup.toLowerCase();
    const destLower = destination.toLowerCase();
    if (pickupLower.includes('lekki') || pickupLower.includes('ikeja') || destLower.includes('lekki') || destLower.includes('ikeja')) price *= 1.2;
    return Math.round(price);
  };

  const getSurgeMultiplier = () => {
    const pickupLower = pickup.toLowerCase();
    const destLower = destination.toLowerCase();
    if (pickupLower.includes('lekki') || pickupLower.includes('ikeja') || destLower.includes('lekki') || destLower.includes('ikeja')) return 1.2;
    return 1.0;
  };

  const submitFeedback = () => {
    const finalCost = calculatePrice(VEHICLE_TYPES.find(v => v.id === selectedVehicle).base);
    analytics.trackAction('ride_completed', { vehicle: selectedVehicle, fare: finalCost, tip, rating });
    if (paymentMethod === 'wallet') setWalletBalance(b => Math.max(0, b - (finalCost + tip)));
    addCompletedRide(finalCost);
    setAppState('idle');
    setDestination('');
    setStops([]);
    setTip(0); setRating(5); setReviewText('');
    Alert.alert('Thank You', 'Your rating and feedback have been shared with Tunde!');
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      analytics.trackAction('tab_refreshed', { tab: activeTab });
    }, 1500);
  };

  const selectedVehicleObj = VEHICLE_TYPES.find(v => v.id === selectedVehicle);
  const getFareBreakdown = () => {
    if (!selectedVehicleObj) return null;
    const base = selectedVehicleObj.base;
    const baseFare = base;
    const stopsCharge = stops.length * 800;
    const isIkeja = destination.toLowerCase().includes('ikeja');
    const km = isIkeja ? 22 : 6;
    const min = isIkeja ? 45 : 15;
    const distanceCharge = km * 150;
    const timeCharge = min * 50;
    const surgePickup = pickup.toLowerCase();
    const surgeDest = destination.toLowerCase();
    const surgeMultiplier = (surgePickup.includes('lekki') || surgePickup.includes('ikeja') || surgeDest.includes('lekki') || surgeDest.includes('ikeja')) ? 1.2 : 1.0;
    return { baseFare, distanceCharge, timeCharge, surgeMultiplier, stopsCharge };
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#070B1A" />
      {/* LOADING OVERLAY */}
      {screenLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Finding your location...</Text>
        </View>
      )}

      {/* ERROR BANNER */}
      {screenError && (
        <ErrorBanner message={screenError} onRetry={() => { setScreenError(null); setScreenLoading(true); setLocRetry(c => c + 1); }} visible={!!screenError} />
      )}

      {/* MAP LAYER */}
      <View style={styles.mapContainer}>
        <MapView style={styles.map} region={region} showsUserLocation>
          {appState === 'idle' && nearbyDrivers.map(d => (
            <Marker key={d.id} coordinate={{ latitude: region.latitude + d.lat, longitude: region.longitude + d.lon }} title={d.type} description={`Driver: ${d.name}`}>
              <View style={styles.carMarkerContainer}><Text style={{ fontSize: 24 }}>🚗</Text></View>
            </Marker>
          ))}
          {(appState === 'accepted' || appState === 'arrived' || appState === 'in_transit') && (
            <Marker coordinate={driverPos} title="Tunde" description="Silver Toyota Corolla • ABC-123">
              <View style={styles.carMarkerContainer}><Text style={{ fontSize: 28 }}>🚗</Text></View>
            </Marker>
          )}
          {dropoffCoord && (
            <Marker coordinate={dropoffCoord} title="Drop-off" description={destination}>
              <View style={[styles.carMarkerContainer, { backgroundColor: colors.gold.bright }]}><Text style={{ fontSize: 18, color: colors.bg.deep }}>⬇</Text></View>
            </Marker>
          )}
          {routeCoordinates.length > 0 && (<Polyline coordinates={routeCoordinates} strokeWidth={5} strokeColor={colors.gold.bright} />)}
          {destination !== '' && (
            <Marker coordinate={pickupCoord} title="Pickup" description={pickup} draggable onDragEnd={async (e) => {
              const coord = e.nativeEvent.coordinate;
              setPickupCoord(coord);
              const address = await reverseGeocode(coord.latitude, coord.longitude);
              setPickup(address || 'Pickup Location Updated');
            }}>
              <View style={[styles.carMarkerContainer, { backgroundColor: colors.white }]}><Text style={{ fontSize: 18, color: colors.bg.deep }}>📍</Text></View>
            </Marker>
          )}
        </MapView>
      </View>

      {/* TOP DESTINATION BAR */}
      {(appState === 'idle' || appState === 'details') && destination ? (
        <TouchableOpacity style={styles.topDestBar} onPress={() => appState === 'details' ? editTripField('destination') : setAppState('details')} activeOpacity={0.9}>
          <View style={styles.topDestBarDots}>
            <View style={styles.tripStartDot} /><View style={styles.tripDashLine} /><View style={styles.tripEndSquare} />
          </View>
          <View style={styles.topDestBarMeta}>
            <Text style={styles.topDestPickup} numberOfLines={1}>{pickup}</Text>
            <Text style={styles.topDestText} numberOfLines={1}>{destination}</Text>
          </View>
          <View style={styles.topDestBarRight}>
            <Text style={styles.topDestDist}>{routeInfo.distance || getRouteFallback().distance}</Text>
            <Text style={styles.topDestDur}>{routeInfo.duration || getRouteFallback().duration}</Text>
          </View>
          <ChevronRight color={colors.gold.bright} size={18} />
        </TouchableOpacity>
      ) : null}

      {/* TOP BAR: menu + location permission */}
      {appState === 'idle' && (
        <TopBar
          showLocationPrompt={showLocationPrompt}
          handleAllowLocation={handleAllowLocation}
          setShowLocationPrompt={setShowLocationPrompt}
          onMenuPress={() => setShowDrawer(true)}
        />
      )}

      {/* SEARCH PANEL */}
      {appState === 'idle' && activeTab === 'Home' && (
        <SearchPanel
          pickup={pickup} setPickup={setPickup}
          destination={destination} setDestination={setDestination}
          searchActive={searchActive} setSearchActive={setSearchActive}
          activeInput={activeInput} setActiveInput={setActiveInput}
          searchResults={searchResults} isSearching={isSearching}
          savedPlaces={savedPlaces} handlePlaceSelect={handlePlaceSelect}
          setAppState={setAppState}
          rideSchedule={rideSchedule} setRideSchedule={setRideSchedule}
        />
      )}

      {/* RIDES TAB */}
      {appState === 'idle' && activeTab === 'Rides' && (
        <View style={styles.tabPanel}>
          <Text style={styles.tabTitle}>Your rides</Text>
          <ScrollView
            style={styles.tabScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold.bright} colors={[colors.gold.bright]} progressBackgroundColor={colors.bg.deep} />}
          >
            {rideHistory.map((ride, index) => (
              <View key={`${ride.label}-${index}`} style={[styles.rideCard, ride.status === 'Upcoming' ? styles.rideCardUpcoming : styles.rideCardAlt]}>
                <Text style={styles.rideSection}>{ride.status}</Text>
                <Text style={styles.rideLocation}>{ride.label}</Text>
                <Text style={styles.rideMeta}>{ride.detail}</Text>
                <View style={styles.rideFooter}>
                  <Text style={styles.ridePrice}>{ride.price}</Text>
                  <Text style={styles.rideStatusBadge}>{ride.status}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* WALLET TAB */}
      {appState === 'idle' && activeTab === 'Wallet' && (
        <View style={styles.tabPanel}>
          <Text style={styles.tabTitle}>Wallet</Text>
          <ScrollView 
            style={styles.tabScroll} 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold.bright} colors={[colors.gold.bright]} progressBackgroundColor={colors.bg.deep} />}
          >
            <View style={walletTabStyles.balanceCard}>
              <Text style={walletTabStyles.balanceLabel}>Total Balance</Text>
              <Text style={walletTabStyles.balanceValue}>₦{walletBalance.toLocaleString()}</Text>
              <TouchableOpacity
                style={walletTabStyles.topUpBtn}
                onPress={() => setShowFundModal(true)}
                activeOpacity={0.85}
              >
                <Text style={walletTabStyles.topUpBtnText}>Top Up</Text>
              </TouchableOpacity>
            </View>
            <Text style={walletTabStyles.sectionTitle}>Payment Methods</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity key={method.id} style={[walletTabStyles.methodCard, method.active && walletTabStyles.methodActive]} onPress={() => selectPaymentMethod(method.id)}>
                <View style={walletTabStyles.methodIcon}>
                  <Text style={{ fontSize: 20 }}>{method.id === 'wallet' ? '💳' : method.id === 'card' ? '🏷️' : '💵'}</Text>
                </View>
                <View style={walletTabStyles.methodMeta}>
                  <Text style={walletTabStyles.methodLabel}>{method.label}</Text>
                  <Text style={walletTabStyles.methodDesc}>{method.description}</Text>
                </View>
                <Text style={[walletTabStyles.methodSelect, method.active && walletTabStyles.methodSelectActive]}>
                  {method.active ? 'Selected' : 'Select'}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={walletTabStyles.viewAllBtn}
              onPress={() => navigation.navigate('Wallet')}
              activeOpacity={0.7}
            >
              <Text style={walletTabStyles.viewAllBtnText}>View full wallet & history</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ACCOUNT TAB */}
      {appState === 'idle' && activeTab === 'Account' && (
        <View style={styles.tabPanel}>
          <Text style={styles.tabTitle}>Account</Text>
          <View style={styles.accountOverview}>
            <Text style={styles.accountName}>{profile.name}</Text>
            <Text style={styles.accountStatus}>⭐ {profile.rating.toFixed(2)} • Lagos passenger</Text>
          </View>
          <ScrollView 
            style={styles.tabScroll} 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold.bright} colors={[colors.gold.bright]} progressBackgroundColor={colors.bg.deep} />}
          >
            <Text style={styles.accountSectionTitle}>Payment Methods</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity key={method.id} style={[styles.paymentMethodCard, method.active && styles.paymentMethodActive]} onPress={() => selectPaymentMethod(method.id)}>
                <View>
                  <Text style={[styles.paymentMethodText, method.active && styles.paymentMethodTextActive]}>{method.label}</Text>
                  <Text style={styles.paymentMethodDesc}>{method.description}</Text>
                </View>
                <Text style={[styles.paymentMethodSelect, method.active && styles.paymentMethodSelectActive]}>{method.active ? 'Selected' : 'Select'}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.accountSectionSpacer} />
            <Text style={styles.accountSectionTitle}>Saved Places</Text>
            {savedPlaces.map((place) => (
              <TouchableOpacity key={place.id} style={styles.savedPlaceRow} onPress={() => Alert.alert('Saved Place Selected', `${place.label} will be used as your pickup location.`)}>
                <View>
                  <Text style={styles.savedPlaceLabel}>{place.label}</Text>
                  <Text style={styles.savedPlaceLocation}>{place.location}</Text>
                </View>
                <Text style={styles.savedPlaceAction}>Set pickup</Text>
              </TouchableOpacity>
            ))}
            {/* Promotions */}
            <View style={styles.accountSectionSpacer} />
            <Text style={styles.accountSectionTitle}>Promotions & Offers</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {PROMOTIONS.map(promo => (
                <TouchableOpacity
                  key={promo.id}
                  style={[styles.promoCard, { borderColor: promo.color + '40' }]}
                  onPress={() => {
                    const message = `✨ ${promo.title}\n\n${promo.desc}\n\nCode: ${promo.code}\nExpires: ${promo.expires}`;
                    Alert.alert('Promotion', message);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.promoBadge, { backgroundColor: promo.color + '20' }]}>
                    <Text style={[styles.promoBadgeText, { color: promo.color }]}>%</Text>
                  </View>
                  <Text style={styles.promoTitle}>{promo.title}</Text>
                  <Text style={styles.promoDesc} numberOfLines={2}>{promo.desc}</Text>
                  <View style={styles.promoCodeRow}>
                    <Text style={styles.promoCode}>{promo.code}</Text>
                    <ChevronRight color={promo.color} size={14} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.accountSectionSpacer} />
            {['Help & Support', 'Safety center', 'Earn with Queens'].map(item => (
              <TouchableOpacity key={item} style={styles.accountItem} onPress={() => Alert.alert(item, `Open ${item.toLowerCase()}.`)}>
                <Text style={styles.accountItemText}>{item}</Text>
                <ChevronRight color={colors.gold.bright} size={18} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* VEHICLE SELECTOR */}
      {appState === 'details' && (
        <VehicleSelector
          pickup={pickup} destination={destination}
          routeInfo={routeInfo} selectedVehicle={selectedVehicle}
          setSelectedVehicle={setSelectedVehicle}
          VEHICLE_TYPES={VEHICLE_TYPES}
          calculatePrice={calculatePrice}
          getSurgeMultiplier={getSurgeMultiplier}
          getRouteFallback={getRouteFallback}
          handleRequestRide={handleRequestRide}
          editTripField={editTripField}
        />
      )}

      {/* MATCHING OVERLAY */}
      {appState === 'matching' && <MatchingOverlay matchingStep={matchingStep} setAppState={setAppState} />}

      {/* ACTIVE TRIP SHEET */}
      {(appState === 'accepted' || appState === 'arrived' || appState === 'in_transit') && (
        <ActiveTripSheet
          appState={appState} setAppState={setAppState}
          pin={pin} destination={destination}
          startCall={startCall} setShowChat={setShowChat}
          setShowSafetyModal={setShowSafetyModal}
          handleCancelRide={handleCancelRide}
        />
      )}

      {/* TRIP RECEIPT */}
      {appState === 'completed' && (
        <TripReceiptCard
          selectedVehicle={selectedVehicle}
          VEHICLE_TYPES={VEHICLE_TYPES}
          calculatePrice={calculatePrice}
          paymentMethod={paymentMethod}
          rating={rating} setRating={setRating}
          tip={tip} setTip={setTip}
          reviewText={reviewText} setReviewText={setReviewText}
          submitFeedback={submitFeedback}
          fareBreakdown={getFareBreakdown()}
        />
      )}

      {/* BOTTOM NAV */}
      {appState === 'idle' && (
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onMenuPress={() => setShowMenuModal(true)}
        />
      )}

      {/* EMERGENCY SOS FAB — always visible except during completed */}
      {appState !== 'completed' && (
        <TouchableOpacity style={styles.sosFab} onPress={handleEmergencySOS} activeOpacity={0.8}>
          <Phone size={20} color={colors.bg.deep} fill={colors.bg.deep} />
          <Text style={styles.sosFabText}>SOS</Text>
        </TouchableOpacity>
      )}

      {/* MODALS */}
      <CallModal showCall={showCall} endCall={endCall} callState={callState} />
      <ChatModal showChat={showChat} setShowChat={setShowChat} chatHistory={chatHistory} chatMessage={chatMessage} setChatMessage={setChatMessage} handleSendMessage={handleSendMessage} />
      <SafetyModal showSafetyModal={showSafetyModal} setShowSafetyModal={setShowSafetyModal} navigation={navigation} />
      <WalletModal showFundModal={showFundModal} setShowFundModal={setShowFundModal} fundAmount={fundAmount} setFundAmount={setFundAmount} handleFundWallet={handleFundWallet} />

      {/* MENU MODAL */}
      <MenuModal
        visible={showMenuModal}
        setShowMenuModal={setShowMenuModal}
        profile={profile}
        walletBalance={walletBalance}
        rating={profile.rating}
        navigation={navigation}
        onLogout={() => { setShowMenuModal(false); logout(); navigation.replace('Login'); }}
        setShowSafetyModal={setShowSafetyModal}
      />

      {/* DRAWER */}
      {showDrawer && (
        <DrawerMenu 
          profile={profile} 
          walletBalance={walletBalance} 
          setShowDrawer={setShowDrawer} 
          drawerAnim={drawerAnim} 
          navigation={navigation} 
          logout={logout} 
        />
      )}
    </SafeAreaView>
  );
}
