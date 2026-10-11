import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, MapPin, Globe, Lock, Shield, Trash, ChevronRight, LogOut, Phone } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import { analytics } from '../lib/analytics';

export default function SettingsScreen({ navigation }) {
  useEffect(() => { analytics.trackScreen('Settings'); }, []);
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { analytics.trackAction('logout'); await logout(); navigation.replace('Login'); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Bell color={colors.gold.bright} size={20} />
            <Text style={styles.settingText}>Push Notifications</Text>
          </View>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: colors.gold.bright + '60' }} thumbColor={notifications ? colors.gold.bright : '#555'} />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <MapPin color={colors.gold.bright} size={20} />
            <Text style={styles.settingText}>Location Services</Text>
          </View>
          <Switch value={location} onValueChange={setLocation} trackColor={{ true: colors.gold.bright + '60' }} thumbColor={location ? colors.gold.bright : '#555'} />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Globe color={colors.gold.bright} size={20} />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: colors.gold.bright + '60' }} thumbColor={darkMode ? colors.gold.bright : '#555'} />
        </View>

        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.navRow} onPress={() => Alert.alert('Change Password', 'Password reset link sent to your email.')}>
          <Lock color={colors.gold.bright} size={20} />
          <Text style={styles.navText}>Change Password</Text>
          <ChevronRight color={colors.gold.bright} size={18} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navRow} onPress={() => Alert.alert('Privacy', 'View privacy policy and data controls.')}>
          <Shield color={colors.gold.bright} size={20} />
          <Text style={styles.navText}>Privacy & Data</Text>
          <ChevronRight color={colors.gold.bright} size={18} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navRow} onPress={() => Alert.alert('Delete Account', 'This action is irreversible. Contact support to proceed.')}>
          <Trash color={colors.error} size={20} />
          <Text style={[styles.navText, { color: colors.error }]}>Delete Account</Text>
          <ChevronRight color={colors.error} size={18} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Safety & Emergency</Text>
        <View style={styles.emergencyCallout}>
          <Phone color={colors.error} size={22} />
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyCalloutLabel}>Emergency Dispatch</Text>
            <Text style={styles.emergencyCalloutNumber}>0800-QUEENS-911</Text>
            <Text style={styles.emergencyCalloutHint}>Available 24/7. Call immediately in life-threatening situations.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
          <LogOut color={colors.gold.bright} size={20} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Queens Ride v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.deep, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.text.primary },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.gold.bright, marginBottom: 12, marginTop: 24, letterSpacing: 0.5 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 16, backgroundColor: colors.bg.surface, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border.gold },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingText: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  navRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, backgroundColor: colors.bg.surface, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border.gold, gap: 12 },
  navText: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text.primary },
  logoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, marginTop: 24, borderWidth: 1.5, borderColor: colors.gold.bright, borderRadius: 14 },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: colors.gold.bright },
  versionText: { textAlign: 'center', color: colors.text.muted, fontSize: 12, marginTop: 24, marginBottom: 40 },
  emergencyCallout: { flexDirection: 'row', alignItems: 'flex-start', padding: 18, backgroundColor: colors.error + '15', borderRadius: 14, marginBottom: 24, borderWidth: 1, borderColor: colors.error + '40', gap: 14 },
  emergencyCalloutLabel: { fontSize: 13, fontWeight: '900', color: colors.error, letterSpacing: 0.3 },
  emergencyCalloutNumber: { fontSize: 18, fontWeight: '900', color: colors.text.primary, marginTop: 2, letterSpacing: 1 },
  emergencyCalloutHint: { fontSize: 11, color: colors.text.secondary, marginTop: 4, lineHeight: 16 },
});
