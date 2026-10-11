import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

type Props = {
  debts: any[];
  totalOwed: number;
  onPress: () => void;
};

export default function CommissionDebtBanner({ debts, totalOwed, onPress }: Props) {
  return (
    <Pressable style={styles.banner} onPress={onPress}>
      <Text style={styles.text}>
        Outstanding commission: <Text style={styles.bold}>${totalOwed.toFixed(2)}</Text>. Please pay within 48h to avoid restriction.
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFB800',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    zIndex: 999,
  },
  text: {
    color: '#0F1A2B',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  bold: {
    fontWeight: '900',
  },
});
