import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Scale, Send, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { analytics } from '../lib/analytics';

const DISPUTE_REASONS = [
  { id: 'wrong_fare', label: 'Incorrect Fare Charged' },
  { id: 'wrong_route', label: 'Driver Took Wrong Route' },
  { id: 'no_show', label: 'Driver Didn\'t Show Up' },
  { id: 'early_end', label: 'Trip Ended Early' },
  { id: 'damage', label: 'Vehicle Damage Claim' },
  { id: 'other', label: 'Other' },
];

const MOCK_RIDES = [
  { id: 'r1', date: '2026-05-28', pickup: 'Lekki Phase 1', dropoff: 'Ikeja City Mall', fare: 4200, status: 'completed' },
  { id: 'r2', date: '2026-05-26', pickup: 'Adekunle Lawal Road', dropoff: 'Victoria Island', fare: 1800, status: 'completed' },
  { id: 'r3', date: '2026-05-24', pickup: 'Ikeja Along', dropoff: 'MMA Terminal 2', fare: 3500, status: 'completed' },
];

export default function DisputeResolutionScreen({ navigation }) {
  useEffect(() => { analytics.trackScreen('DisputeResolution'); }, []);
  const [selectedRide, setSelectedRide] = useState(null);
  const [reason, setReason] = useState(null);
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [showRidePicker, setShowRidePicker] = useState(false);

  const handleSubmit = () => {
    if (!selectedRide) return Alert.alert('Required', 'Please select the trip you\'re disputing.');
    if (!reason) return Alert.alert('Required', 'Please select a dispute reason.');
    if (!description.trim()) return Alert.alert('Required', 'Please provide details about the dispute.');
    analytics.trackAction('dispute_filed', { rideId: selectedRide.id, reason });
    setSending(true);
    setTimeout(() => {
      setSending(false);
      Alert.alert('Dispute Filed', 'Your dispute has been submitted for review. Our team will investigate and respond within 48 hours.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispute a Charge</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.banner}>
          <Scale color={colors.gold.bright} size={24} />
          <Text style={styles.bannerTitle}>Fair Resolution</Text>
          <Text style={styles.bannerSub}>We investigate every dispute thoroughly. Most disputes are resolved within 48 hours.</Text>
        </View>

        <Text style={styles.sectionTitle}>Select Trip</Text>
        <TouchableOpacity style={styles.ridePickerBtn} onPress={() => setShowRidePicker(!showRidePicker)}>
          <Clock color={colors.gold.bright} size={18} />
          <Text style={styles.ridePickerText}>
            {selectedRide ? `${selectedRide.date} — ₦${selectedRide.fare.toLocaleString()}` : 'Choose a recent trip'}
          </Text>
          {showRidePicker ? <ChevronUp color={colors.gold.bright} size={18} /> : <ChevronDown color={colors.gold.bright} size={18} />}
        </TouchableOpacity>

        {showRidePicker && (
          <View style={styles.rideList}>
            {MOCK_RIDES.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.rideOption, selectedRide?.id === r.id && styles.rideOptionActive]}
                onPress={() => { setSelectedRide(r); setShowRidePicker(false); }}
              >
                <MapPin color={colors.gold.bright} size={14} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rideOptionPickup}>{r.pickup} → {r.dropoff}</Text>
                  <Text style={styles.rideOptionMeta}>{r.date} • ₦{r.fare.toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Reason for Dispute</Text>
        <View style={styles.reasonGrid}>
          {DISPUTE_REASONS.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.reasonCard, reason === r.id && styles.reasonCardActive]}
              onPress={() => setReason(r.id)}
            >
              <Text style={[styles.reasonText, reason === r.id && styles.reasonTextActive]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Details</Text>
        <TextInput
          style={styles.descInput}
          placeholder="Describe what happened and what resolution you're seeking..."
          placeholderTextColor={colors.text.muted}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity style={[styles.submitBtn, sending && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={sending}>
          <Send color={colors.bg.deep} size={18} />
          <Text style={styles.submitText}>{sending ? 'Submitting...' : 'File Dispute'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.deep, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.text.primary },
  banner: { alignItems: 'center', padding: 24, backgroundColor: colors.bg.surface, borderRadius: 20, borderWidth: 1.5, borderColor: colors.gold.bright, marginBottom: 24, gap: 8 },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text.primary },
  bannerSub: { fontSize: 13, color: colors.text.secondary, textAlign: 'center', lineHeight: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.gold.bright, marginBottom: 12, marginTop: 8, letterSpacing: 0.5 },
  ridePickerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.surface, borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: colors.gold.bright, gap: 10, marginBottom: 10 },
  ridePickerText: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text.primary },
  rideList: { backgroundColor: colors.bg.surface, borderRadius: 14, padding: 8, marginBottom: 12, borderWidth: 1, borderColor: colors.border.gold },
  rideOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 },
  rideOptionActive: { backgroundColor: colors.gold.bright + '15' },
  rideOptionPickup: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  rideOptionMeta: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  reasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  reasonCard: { width: '48%', backgroundColor: colors.bg.surface, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border.gold },
  reasonCardActive: { borderColor: colors.gold.bright, backgroundColor: colors.gold.bright + '15' },
  reasonText: { fontSize: 13, fontWeight: '700', color: colors.text.primary, textAlign: 'center' },
  reasonTextActive: { color: colors.gold.bright },
  descInput: { padding: 16, backgroundColor: colors.bg.surface, borderRadius: 14, fontSize: 15, color: colors.text.primary, minHeight: 120, borderWidth: 1.5, borderColor: colors.gold.bright, marginBottom: 20, outlineStyle: 'none' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.gold.bright, paddingVertical: 16, borderRadius: 14, marginBottom: 16, boxShadow: '0px 4px 14px rgba(255,193,7,0.3)' },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { color: colors.bg.deep, fontSize: 16, fontWeight: 'bold' },
});
