import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, Switch } from 'react-native';
import { Share2, Shield, Phone, AlertTriangle, Bell } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { styles } from './homeStyles';
import { analytics } from '../../lib/analytics';

export default function SafetyModal({ showSafetyModal, setShowSafetyModal, navigation }) {
  const [womenOnly, setWomenOnly] = useState(false);
  const [rideCheck, setRideCheck] = useState(true);

  return (
    <Modal visible={showSafetyModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.safetyCard}>
          <Text style={styles.safetyTitle}>Safety Hub</Text>
          <Text style={styles.safetyDesc}>Your safety is our top priority. Access premium protection tools below.</Text>

          {/* RideCheck Settings */}
          <View style={styles.safetyOptionRow}>
            <View style={styles.safetyOptionIconWrap}>
              <Bell color={colors.gold.bright} size={22} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.safetyOptionTitle}>RideCheck™ Protection</Text>
              <Text style={styles.safetyOptionSub}>Auto-detect unusual trip events</Text>
            </View>
            <Switch 
              value={rideCheck} 
              onValueChange={setRideCheck} 
              trackColor={{ false: '#333', true: colors.gold.bright }}
              thumbColor={colors.white}
            />
          </View>

          {/* Women Preference */}
          <View style={styles.safetyOptionRow}>
            <View style={styles.safetyOptionIconWrap}>
              <Shield color="#FF69B4" size={22} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.safetyOptionTitle}>Women Only Request</Text>
              <Text style={styles.safetyOptionSub}>Prefer female drivers (Beta)</Text>
            </View>
            <Switch 
              value={womenOnly} 
              onValueChange={setWomenOnly} 
              trackColor={{ false: '#333', true: "#FF69B4" }}
              thumbColor={colors.white}
            />
          </View>

          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 12 }} />

          <TouchableOpacity style={styles.safetyOption} onPress={() => {
            Alert.alert('Status Shared', 'Your live location link has been successfully dispatched to pre-set emergency contacts.');
            setShowSafetyModal(false);
          }}>
            <Share2 color={colors.gold.bright} />
            <View style={styles.safetyOptionMeta}>
              <Text style={styles.safetyOptionTitle}>Share Trip Status</Text>
              <Text style={styles.safetyOptionSub}>Send your live tracking link to friends</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.safetyOption, { borderColor: colors.gold.bright }]} onPress={() => {
            analytics.trackAction('sos_triggered_modal');
            Alert.alert('SOS Emergency', 'Emergency alert dispatched to local Lagos police & response services.');
            setShowSafetyModal(false);
          }}>
            <Shield color={colors.gold.bright} />
            <View style={styles.safetyOptionMeta}>
              <Text style={styles.safetyOptionTitle}>SOS Emergency Assistance</Text>
              <Text style={styles.safetyOptionSub}>Immediately alert authorities & dispatch team</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.dispatchInfo}>
            <Phone color={colors.error} size={18} />
            <View style={styles.dispatchInfoMeta}>
              <Text style={styles.dispatchInfoLabel}>Emergency Dispatch</Text>
              <Text style={styles.dispatchInfoNumber}>0800-QUEENS-911</Text>
              <Text style={styles.dispatchInfoHint}>Available 24/7 for life-threatening emergencies. Share this number with loved ones.</Text>
            </View>
          </View>

          <View style={styles.insuranceBadgeRow}>
            <Shield color={colors.success} size={18} />
            <View style={{ flex: 1 }}>
              <Text style={styles.insuranceBadgeLabel}>Insured Ride</Text>
              <Text style={styles.insuranceBadgeDesc}>Every trip includes death & disability cover via our partner insurers. Your safety is guaranteed.</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.incidentLink} onPress={() => { setShowSafetyModal(false); navigation?.navigate('IncidentReport'); }}>
            <AlertTriangle color={colors.error} size={16} />
            <Text style={styles.incidentLinkText}>Report an Incident</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeSafety} onPress={() => setShowSafetyModal(false)}>
            <Text style={styles.closeSafetyText}>Close Safety Hub</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
