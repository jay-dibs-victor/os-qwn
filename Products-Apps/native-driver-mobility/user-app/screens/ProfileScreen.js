import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, ChevronRight } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { sanitizeInput } from '../lib/validation';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) return Alert.alert('Required', 'Name and email are required.');
    setSaving(true);
    try {
      await updateProfile({ name, email, phone });
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile.');
    }
    setSaving(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 40 }}>👤</Text>
          </View>
          <TouchableOpacity style={styles.cameraBtn}>
            <Camera color={colors.bg.deep} size={16} />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={v => setName(sanitizeInput(v))} placeholderTextColor={colors.text.muted} />
          <TextInput style={styles.input} value={email} onChangeText={v => setEmail(sanitizeInput(v))} keyboardType="email-address" placeholderTextColor={colors.text.muted} />
          <TextInput style={styles.input} value={phone} onChangeText={v => setPhone(sanitizeInput(v))} keyboardType="phone-pad" placeholderTextColor={colors.text.muted} />

          <Text style={styles.label}>Rating</Text>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingText}>⭐ {user?.rating?.toFixed(2) || '4.95'}</Text>
          </View>

          <TouchableOpacity style={[styles.saveBtn, saving && styles.savingBtn]} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Emergency Contact', 'Manage emergency contacts.')}>
            <Text style={styles.menuItemText}>Emergency Contact</Text>
            <ChevronRight color={colors.gold.bright} size={18} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Payment Methods', 'Manage cards and payment options.')}>
            <Text style={styles.menuItemText}>Payment Methods</Text>
            <ChevronRight color={colors.gold.bright} size={18} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SavedPlaces')}>
            <Text style={styles.menuItemText}>Saved Places</Text>
            <ChevronRight color={colors.gold.bright} size={18} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.deep, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.text.primary },
  avatarSection: { alignItems: 'center', marginBottom: 32, position: 'relative' },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.gold.bright, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.gold.bright },
  cameraBtn: { position: 'absolute', bottom: 4, right: '38%', backgroundColor: colors.gold.bright, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  form: { gap: 16 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text.secondary, letterSpacing: 0.5 },
  input: { padding: 16, backgroundColor: colors.bg.surface, borderRadius: 14, fontSize: 16, color: colors.text.primary, borderWidth: 1.5, borderColor: colors.gold.bright, outlineStyle: 'none' },
  ratingBox: { padding: 16, backgroundColor: colors.bg.surface, borderRadius: 14, borderWidth: 1.5, borderColor: colors.gold.bright },
  ratingText: { fontSize: 16, fontWeight: 'bold', color: colors.gold.bright },
  saveBtn: { backgroundColor: colors.gold.bright, paddingVertical: 18, borderRadius: 14, alignItems: 'center', marginTop: 8, boxShadow: '0px 4px 14px rgba(255,193,7,0.3)' },
  savingBtn: { opacity: 0.7 },
  saveBtnText: { color: colors.bg.deep, fontSize: 16, fontWeight: 'bold' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1.5, borderColor: colors.gold.bright + '30' },
  menuItemText: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
});
