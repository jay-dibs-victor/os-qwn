import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, MapPin, ChevronRight, RefreshCw } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useUser } from '../contexts/UserContext';
import ErrorBanner from '../components/ErrorBanner';

export default function TripHistoryScreen({ navigation }) {
  const { rides, loading, error, refresh } = useUser();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip History</Text>
        {error && (
          <TouchableOpacity onPress={refresh}>
            <RefreshCw color={colors.gold.bright} size={20} />
          </TouchableOpacity>
        )}
        {!error && <View style={{ width: 24 }} />}
      </View>

      <ErrorBanner message={error} onRetry={refresh} visible={!!error} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptySub}>Loading your trips...</Text>
          </View>
        ) : error ? null : rides.length === 0 ? (
          <View style={styles.emptyState}>
            <Clock color={colors.text.muted} size={48} />
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptySub}>Your ride history will appear here.</Text>
          </View>
        ) : (
          rides.map((ride, index) => (
            <TouchableOpacity key={ride.id || index} style={styles.rideCard}>
              <View style={styles.rideHeader}>
                <View style={styles.routeDots}>
                  <View style={styles.startDot} />
                  <View style={styles.dashLine} />
                  <View style={styles.endSquare} />
                </View>
                <View style={styles.rideInfo}>
                  <Text style={styles.ridePickup} numberOfLines={1}>{ride.pickup || 'Pickup location'}</Text>
                  <Text style={styles.rideDropoff} numberOfLines={1}>{ride.dropoff || 'Drop-off location'}</Text>
                </View>
                <ChevronRight color={colors.gold.bright} size={18} />
              </View>
              <View style={styles.rideFooter}>
                <View style={styles.rideMeta}>
                  <MapPin color={colors.text.muted} size={12} />
                  <Text style={styles.rideDist}>{ride.distance || '—'}</Text>
                  <Clock color={colors.text.muted} size={12} style={{ marginLeft: 12 }} />
                  <Text style={styles.rideDuration}>{ride.duration || '—'}</Text>
                </View>
                <Text style={styles.ridePrice}>{ride.price || '—'}</Text>
              </View>
              <View style={styles.rideBadgeRow}>
                <Text style={[styles.rideBadge, ride.status === 'completed' ? styles.completedBadge : styles.cancelledBadge]}>
                  {ride.status || 'completed'}
                </Text>
                <Text style={styles.rideDate}>{ride.date || ''}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.deep, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.text.primary },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text.primary, marginTop: 16 },
  emptySub: { color: colors.text.secondary, marginTop: 8 },
  rideCard: { backgroundColor: colors.bg.surface, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1.5, borderColor: colors.gold.bright, elevation: 5, boxShadow: '0px 2px 8px rgba(255,193,7,0.1)' },
  rideHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  routeDots: { alignItems: 'center', marginRight: 14, width: 18 },
  startDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.gold.bright },
  dashLine: { width: 2, flex: 0.6, backgroundColor: colors.gold.bright, marginVertical: 4, opacity: 0.4 },
  endSquare: { width: 10, height: 10, backgroundColor: colors.gold.bright, borderRadius: 3 },
  rideInfo: { flex: 1 },
  ridePickup: { fontSize: 13, color: colors.text.secondary, marginBottom: 4 },
  rideDropoff: { fontSize: 15, fontWeight: 'bold', color: colors.text.primary },
  rideFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rideMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rideDist: { color: colors.text.secondary, fontSize: 12, fontWeight: '500' },
  rideDuration: { color: colors.text.secondary, fontSize: 12, fontWeight: '500' },
  ridePrice: { fontSize: 17, fontWeight: '900', color: colors.gold.bright },
  rideBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rideBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20, fontSize: 11, fontWeight: '700', textTransform: 'capitalize', overflow: 'hidden' },
  completedBadge: { backgroundColor: colors.success + '20', color: colors.success },
  cancelledBadge: { backgroundColor: colors.error + '20', color: colors.error },
  rideDate: { color: colors.text.muted, fontSize: 11 },
});
