import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Phone } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { styles } from './homeStyles';

export default function CallModal({ showCall, endCall, callState }) {
  return (
    <Modal visible={showCall} transparent animationType="fade">
      <View style={styles.callOverlay}>
        <Text style={styles.callLogo}>Queens VoIP Call</Text>
        <Text style={styles.maskedTitle}>Masked Routing Active</Text>
        <Text style={styles.driverCallName}>Tunde (Driver)</Text>
        <Text style={styles.callStateText}>
          {callState === 'connecting' && 'Ringing...'}
          {callState === 'connected' && 'Connected (Secure VoIP Sandbox)'}
          {callState === 'ended' && 'Call Ended'}
        </Text>

        <View style={styles.callControls}>
          <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
            <Phone color={colors.bg.deep} size={30} style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
