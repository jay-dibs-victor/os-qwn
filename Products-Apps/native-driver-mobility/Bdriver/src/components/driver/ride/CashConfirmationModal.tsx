import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { colors } from '../../../theme/colors';

type Props = {
  visible: boolean;
  amount: number;
  onConfirm: () => void;
  onRiderDidNotPay: () => void;
};

export default function CashConfirmationModal({ visible, amount, onConfirm, onRiderDidNotPay }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Cash Payment Received?</Text>
          <Text style={styles.amount}>${amount.toFixed(2)}</Text>
          <Text style={styles.desc}>Please confirm if you have received the cash payment from the rider.</Text>
          
          <Pressable style={[styles.btn, styles.confirmBtn]} onPress={onConfirm}>
            <Text style={styles.btnText}>Yes, I received it</Text>
          </Pressable>
          
          <Pressable style={[styles.btn, styles.cancelBtn]} onPress={onRiderDidNotPay}>
            <Text style={[styles.btnText, { color: '#FF3B47' }]}>Rider didn't pay</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F1A2B',
    marginBottom: 10,
  },
  amount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F1A2B',
    marginBottom: 20,
  },
  desc: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 30,
  },
  btn: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmBtn: {
    backgroundColor: '#FFB800',
  },
  cancelBtn: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F1A2B',
  },
});
