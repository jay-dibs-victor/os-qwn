import React from 'react';
import { View, TextInput, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Search, MapPin, X, ChevronRight, Clock, Home as HomeIcon } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { styles } from './homeStyles';

const QUICK_DESTINATIONS = [
  { id: 'home', label: 'Home', location: '12 Admiralty Way, Lekki Phase 1', icon: '🏠' },
  { id: 'mall', label: 'Ikeja City Mall', location: 'Alausa, Ikeja', icon: '🛍️' },
  { id: 'airport', label: 'MMA Terminal 2', location: 'Ikeja, Lagos', icon: '✈️' },
];

export default function SearchPanel({
  pickup, setPickup, destination, setDestination,
  searchActive, setSearchActive,
  activeInput, setActiveInput,
  searchResults, isSearching,
  savedPlaces, handlePlaceSelect,
  setAppState, rideSchedule, setRideSchedule,
}) {
  if (!searchActive) {
    return (
      <View style={styles.searchCard}>
        {destination ? (
          <TouchableOpacity style={styles.tripSummaryRow} onPress={() => setAppState('details')}>
            <View style={styles.tripSummaryDots}>
              <View style={styles.tripStartDot} />
              <View style={styles.tripDashLine} />
              <View style={styles.tripEndSquare} />
            </View>
            <View style={styles.tripSummaryText}>
              <Text style={styles.tripPickupText} numberOfLines={1}>{pickup}</Text>
              <Text style={styles.tripDestText} numberOfLines={1}>{destination}</Text>
            </View>
            <ChevronRight color={colors.gold.bright} size={22} />
          </TouchableOpacity>
        ) : (
          <View style={styles.searchRowCard}>
            <TouchableOpacity style={styles.whereSearchPlaceholder} onPress={() => setSearchActive(true)}>
              <Search size={18} color={colors.text.secondary} style={{ marginRight: 10 }} />
              <Text style={styles.wherePlaceholderText}>Where to?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.laterButton, rideSchedule === 'later' && searchPanelStyles.scheduleActive]}
              onPress={() => setRideSchedule(rideSchedule === 'later' ? 'now' : 'later')}
            >
              <Clock size={14} color={rideSchedule === 'later' ? colors.bg.deep : colors.gold.bright} />
              <Text style={[styles.laterButtonText, rideSchedule === 'later' && searchPanelStyles.scheduleActiveText]}>
                {rideSchedule === 'later' ? 'Scheduled' : 'Later'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.searchCard, styles.expandedSearchCard]}>
      <View style={styles.expandedHeader}>
        <Text style={styles.expandedTitle}>Where to?</Text>
        <TouchableOpacity onPress={() => setSearchActive(false)}>
          <X size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Pickup + Destination Inputs */}
      <View style={styles.routeHeader}>
        <View style={styles.routeMarker}>
          <View style={styles.routeDot} />
          <View style={styles.routeLine} />
          <View style={styles.routeSquare} />
        </View>
        <View style={styles.routeTextGroup}>
          <Text style={styles.routeLabel}>Pickup</Text>
          <TextInput
            style={[styles.routeLocation, activeInput === 'pickup' && styles.activeInputHighlight]}
            value={pickup}
            onChangeText={setPickup}
            onFocus={() => setActiveInput('pickup')}
            placeholder="Search pickup location"
          />
          <Text style={styles.routeSubtext}>Drag the marker to adjust pickup</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.whereInput}>
          <Search size={18} color={colors.text.secondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search destination"
            placeholderTextColor={colors.text.secondary}
            style={[styles.whereTextInput, activeInput === 'destination' && styles.activeInputHighlight]}
            value={destination}
            onChangeText={setDestination}
            onFocus={() => setActiveInput('destination')}
            autoFocus={activeInput === 'destination'}
          />
        </View>
      </View>

      {/* Quick Destination Chips — shown when no search query */}
      {destination.trim().length === 0 && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={searchPanelStyles.chipsContainer}
          >
            {QUICK_DESTINATIONS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={searchPanelStyles.chip}
                onPress={() => handlePlaceSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={searchPanelStyles.chipIcon}>{item.icon}</Text>
                <View>
                  <Text style={searchPanelStyles.chipLabel}>{item.label}</Text>
                  <Text style={searchPanelStyles.chipSub}>{item.location.split(',')[0]}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Saved Places */}
          {savedPlaces.length > 0 && (
            <View style={searchPanelStyles.savedSection}>
              <Text style={searchPanelStyles.savedTitle}>Saved Places</Text>
              {savedPlaces.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={searchPanelStyles.savedRow}
                  onPress={() => handlePlaceSelect(place)}
                  activeOpacity={0.7}
                >
                  <View style={searchPanelStyles.savedIcon}>
                    <MapPin size={15} color={colors.gold.bright} />
                  </View>
                  <View>
                    <Text style={searchPanelStyles.savedLabel}>{place.label}</Text>
                    <Text style={searchPanelStyles.savedLocation}>{place.location}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

      <ScrollView style={styles.placeList} contentContainerStyle={{ paddingBottom: 10 }} showsVerticalScrollIndicator={false}>
        {destination.trim().length > 0 && (
          <>
            <View style={styles.placeListHeader}>
              <Text style={styles.placeListTitle}>Search results</Text>
            </View>
            {isSearching && (
              <View style={styles.searchingPlaceholder}>
                <ActivityIndicator size="small" color={colors.gold.bright} />
                <Text style={styles.searchingText}>Searching OpenStreetMap...</Text>
              </View>
            )}
            {!isSearching && searchResults.length === 0 && (
              <View style={styles.searchingPlaceholder}>
                <Text style={styles.searchingText}>No results found. Try a different location.</Text>
              </View>
            )}
            {searchResults.length > 0 && searchResults.map((item, index) => (
              <TouchableOpacity key={`result-${index}`} style={styles.placeItem} onPress={() => handlePlaceSelect(item)}>
                <View style={styles.placeIcon}>
                  <MapPin size={16} color={colors.bg.deep} />
                </View>
                <View style={styles.placeMeta}>
                  <Text style={styles.placeName}>{item.title || item.label}</Text>
                  <Text style={styles.placeSubtitle}>{item.subtitle || item.location}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {savedPlaces.length > 0 && searchResults.length === 0 && (
              <>
                <View style={styles.placeListHeader}>
                  <Text style={styles.placeListTitle}>Saved Places</Text>
                </View>
                {savedPlaces.map((place) => (
                  <TouchableOpacity key={place.id} style={styles.placeItem} onPress={() => handlePlaceSelect(place)}>
                    <View style={styles.placeIcon}>
                      <MapPin size={16} color={colors.bg.deep} />
                    </View>
                    <View style={styles.placeMeta}>
                      <Text style={styles.placeName}>{place.label}</Text>
                      <Text style={styles.placeSubtitle}>{place.location}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {destination.trim().length > 0 && (
        <TouchableOpacity style={styles.bookConfirmBtn} onPress={() => setAppState('details')}>
          <Text style={styles.bookConfirmText}>Select Ride Details</Text>
          <ChevronRight color={colors.white} size={20} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const searchPanelStyles = {
  chipsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.deep,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,208,96,0.15)',
    gap: 8,
  },
  chipIcon: { fontSize: 18 },
  chipLabel: { fontSize: 12, fontWeight: '700', color: colors.text.primary },
  chipSub: { fontSize: 10, color: colors.text.secondary, marginTop: 1 },
  savedSection: { marginBottom: 8 },
  savedTitle: { fontSize: 12, fontWeight: '700', color: colors.text.secondary, marginBottom: 8, letterSpacing: 0.5 },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    gap: 12,
  },
  savedIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,193,7,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedLabel: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  savedLocation: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  scheduleActive: { backgroundColor: colors.gold.bright },
  scheduleActiveText: { color: colors.bg.deep },
};
