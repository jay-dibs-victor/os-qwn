import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { styles } from './homeStyles';

export default function WalletModal({ showFundModal, setShowFundModal, fundAmount, setFundAmount, handleFundWallet }) {
  return (
    <Modal visible={showFundModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.fundCard}>
          <Text style={styles.fundHeader}>Fund Digital Wallet</Text>
          <Text style={styles.fundLabel}>Enter Amount (₦)</Text>
          <TextInput
            style={styles.fundInput}
            placeholder="e.g. 5000"
            keyboardType="number-pad"
            value={fundAmount}
            onChangeText={setFundAmount}
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleFundWallet}>
            <Text style={styles.primaryBtnText}>Deposit via Paystack</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.closeSafety, { marginTop: 10 }]} onPress={() => setShowFundModal(false)}>
            <Text style={styles.closeSafetyText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
