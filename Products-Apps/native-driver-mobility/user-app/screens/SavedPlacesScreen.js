import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Home, MapPin, Plus, Trash, Check } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { storage } from '../lib/storage';
import { sanitizeInput } from '../lib/validation';

const PLACE_ICONS = { home: '🏠', work: '💼', favorite: '⭐' };

export default function SavedPlacesScreen({ navigation }) {
  const [places, setPlaces] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editLocation, setEditLocation] = useState('');

  useEffect(() => {
    (async () => {
      const saved = await storage.getSavedPlaces();
      setPlaces(saved);
    })();
  }, []);

  const persist = async (updated) => {
    setPlaces(updated);
    await storage.saveSavedPlaces(updated);
  };

  const startEdit = (place) => {
    setEditingId(place.id);
    setEditLabel(place.label);
    setEditLocation(place.location);
  };

  const saveEdit = async () => {
    if (!editLabel.trim() || !editLocation.trim()) return Alert.alert('Required', 'Label and location are required.');
    const updated = places.map(p => p.id === editingId ? { ...p, label: sanitizeInput(editLabel.trim()), location: sanitizeInput(editLocation.trim()) } : p);
    await persist(updated);
    setEditingId(null);
  };

  const deletePlace = (id) => {
    Alert.alert('Delete Place', `Remove "${places.find(p => p.id === id)?.label}" from saved places?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const updated = places.filter(p => p.id !== id);
        await persist(updated);
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Places</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.banner}>
          <Home color={colors.gold.bright} size={24} />
          <Text style={styles.bannerTitle}>Your Saved Places</Text>
          <Text style={styles.bannerSub}>Set your Home and Work locations for one-tap booking. Add favorites for quick access.</Text>
        </View>

        {places.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No saved places yet.</Text>
          </View>
        ) : (
          places.map((place) => (
            <View key={place.id} style={styles.placeCard}>
              {editingId === place.id ? (
                <>
                  <View style={styles.editRow}>
                    <TextInput style={styles.editInput} value={editLabel} onChangeText={setEditLabel} placeholder="Label" placeholderTextColor={colors.text.muted} />
                    <TextInput style={styles.editInput} value={editLocation} onChangeText={setEditLocation} placeholder="Location" placeholderTextColor={colors.text.muted} />
                  </View>
                  <View style={styles.editActions}>
                    <TouchableOpacity style={styles.saveEditBtn} onPress={saveEdit}>
                      <Check color={colors.bg.deep} size={16} />
                      <Text style={styles.saveEditText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelEditBtn} onPress={() => setEditingId(null)}>
                      <Text style={styles.cancelEditText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.placeRow}>
                    <Text style={styles.placeIcon}>{PLACE_ICONS[place.id] || '⭐'}</Text>
                    <View style={styles.placeMeta}>
                      <Text style={styles.placeLabel}>{place.label}</Text>
                      <Text style={styles.placeLocation}>{place.location}</Text>
                    </View>
                  </View>
                  <View style={styles.placeActions}>
                    <TouchableOpacity style={styles.placeActionBtn} onPress={() => startEdit(place)}>
                      <Text style={styles.placeActionText}>Edit</Text>
                    </TouchableOpacity>
                    {place.id !== 'home' && place.id !== 'work' && (
                      <TouchableOpacity style={styles.placeActionBtn} onPress={() => deletePlace(place.id)}>
                        <Trash color={colors.error} size={14} />
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addBtn} onPress={async () => {
          const id = 'fav_' + Date.now();
          const updated = [...places, { id, label: 'New Place', location: '' }];
          await persist(updated);
          startEdit(updated.find(p => p.id === id));
        }}>
          <Plus color={colors.gold.bright} size={20} />
          <Text style={styles.addBtnText}>Add Favorite Place</Text>
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
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: colors.text.secondary, fontSize: 14 },
  placeCard: { backgroundColor: colors.bg.surface, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1.5, borderColor: colors.gold.bright },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  placeIcon: { fontSize: 24 },
  placeMeta: { flex: 1 },
  placeLabel: { fontSize: 16, fontWeight: 'bold', color: colors.text.primary },
  placeLocation: { fontSize: 13, color: colors.text.secondary, marginTop: 3 },
  placeActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: colors.border.gold },
  placeActionBtn: { padding: 6 },
  placeActionText: { color: colors.gold.bright, fontSize: 13, fontWeight: '800' },
  editRow: { gap: 10 },
  editInput: { padding: 14, backgroundColor: colors.bg.deep, borderRadius: 12, fontSize: 15, color: colors.text.primary, borderWidth: 1.5, borderColor: colors.gold.bright, outlineStyle: 'none' },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  saveEditBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.gold.bright, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  saveEditText: { color: colors.bg.deep, fontSize: 13, fontWeight: 'bold' },
  cancelEditBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelEditText: { color: colors.text.secondary, fontSize: 13, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 18, marginTop: 8, borderWidth: 1.5, borderColor: colors.gold.bright, borderRadius: 14, borderStyle: 'dashed' },
  addBtnText: { color: colors.gold.bright, fontSize: 15, fontWeight: '700' },
});
