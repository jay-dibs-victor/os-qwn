import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, AlertTriangle, Send, Shield } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { analytics } from '../lib/analytics';

const INCIDENT_TYPES = [
  { id: 'accident', label: 'Road Accident', icon: '🚗' },
  { id: 'harassment', label: 'Harassment / Misconduct', icon: '⚠️' },
  { id: 'overcharge', label: 'Overcharge / Fare Issue', icon: '💰' },
  { id: 'driver_conduct', label: 'Driver Conduct', icon: '👤' },
  { id: 'lost_item', label: 'Lost Item', icon: '🔑' },
  { id: 'other', label: 'Other', icon: '📝' },
];

export default function IncidentReportScreen({ navigation }) {
  useEffect(() => { analytics.trackScreen('IncidentReport'); }, []);
  const [incidentType, setIncidentType] = useState(null);
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = () => {
    if (!incidentType) return Alert.alert('Required', 'Please select an incident type.');
    if (!description.trim()) return Alert.alert('Required', 'Please describe what happened.');
    analytics.trackAction('incident_reported', { incidentType });
    setSending(true);
    setTimeout(() => {
      setSending(false);
      Alert.alert('Report Submitted', 'Your incident report has been received. Our team will review it within 24 hours and follow up with you.', [
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
        <Text style={styles.headerTitle}>Report Incident</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.banner}>
          <AlertTriangle color={colors.error} size={24} />
          <Text style={styles.bannerTitle}>Help us improve safety</Text>
          <Text style={styles.bannerSub}>Your report is confidential and will be reviewed by our safety team.</Text>
        </View>

        <Text style={styles.sectionTitle}>Incident Type</Text>
        <View style={styles.typeGrid}>
          {INCIDENT_TYPES.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.typeCard, incidentType === t.id && styles.typeCardActive]}
              onPress={() => setIncidentType(t.id)}
            >
              <Text style={styles.typeIcon}>{t.icon}</Text>
              <Text style={[styles.typeLabel, incidentType === t.id && styles.typeLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <TextInput
          style={styles.descInput}
          placeholder="Describe what happened in detail..."
          placeholderTextColor={colors.text.muted}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity style={[styles.submitBtn, sending && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={sending}>
          <Send color={colors.bg.deep} size={18} />
          <Text style={styles.submitText}>{sending ? 'Submitting...' : 'Submit Report'}</Text>
        </TouchableOpacity>

        <View style={styles.footerNote}>
          <Shield color={colors.text.muted} size={14} />
          <Text style={styles.footerText}>For emergencies, call 0800-QUEENS-911 immediately instead of filing a report.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.deep, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.text.primary },
  banner: { alignItems: 'center', padding: 24, backgroundColor: colors.error + '12', borderRadius: 20, borderWidth: 1, borderColor: colors.error + '30', marginBottom: 24, gap: 8 },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text.primary },
  bannerSub: { fontSize: 13, color: colors.text.secondary, textAlign: 'center', lineHeight: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.gold.bright, marginBottom: 12, marginTop: 8, letterSpacing: 0.5 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  typeCard: { width: '48%', backgroundColor: colors.bg.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border.gold, gap: 8 },
  typeCardActive: { borderColor: colors.error, backgroundColor: colors.error + '12' },
  typeIcon: { fontSize: 28 },
  typeLabel: { fontSize: 12, fontWeight: '700', color: colors.text.primary, textAlign: 'center' },
  typeLabelActive: { color: colors.error },
  descInput: { padding: 16, backgroundColor: colors.bg.surface, borderRadius: 14, fontSize: 15, color: colors.text.primary, minHeight: 140, borderWidth: 1.5, borderColor: colors.gold.bright, marginBottom: 20, outlineStyle: 'none' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.gold.bright, paddingVertical: 16, borderRadius: 14, marginBottom: 16, boxShadow: '0px 4px 14px rgba(255,193,7,0.3)' },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { color: colors.bg.deep, fontSize: 16, fontWeight: 'bold' },
  footerNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, backgroundColor: colors.bg.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border.gold },
  footerText: { flex: 1, color: colors.text.muted, fontSize: 11, lineHeight: 16 },
});
