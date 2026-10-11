import React from 'react';
import { View, TouchableOpacity, Text, Modal } from 'react-native';
import { Menu, MapPin } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { styles } from './homeStyles';

export default function TopBar({ showLocationPrompt, handleAllowLocation, setShowLocationPrompt, onMenuPress }) {
  return (
    <>
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
        <Menu color={colors.bg.deep} size={24} />
      </TouchableOpacity>

      <Modal visible={showLocationPrompt} transparent animationType="none">
        <View style={styles.permissionOverlay}>
          <View style={styles.permissionCard}>
            <View style={styles.permissionIcon}>
              <MapPin color={colors.gold.bright} size={48} />
            </View>
            <Text style={styles.permissionTitle}>Allow location access</Text>
            <Text style={styles.permissionSubtitle}>We need your location to find nearby vehicles.</Text>
            <TouchableOpacity style={styles.allowLocationBtn} onPress={handleAllowLocation}>
              <Text style={styles.allowLocationText}>Allow location access</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.laterBtn} onPress={() => setShowLocationPrompt(false)}>
              <Text style={styles.laterText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
