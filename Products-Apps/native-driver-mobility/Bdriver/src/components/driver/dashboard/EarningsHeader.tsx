import { StyleSheet, Text, View } from 'react-native';
import { useDriverStore } from '../../../store/driver';

export default function EarningsHeader() {
  const wallet = useDriverStore(s => s.wallet);
  const earnings = useDriverStore(s => s.earnings);

  return (
    <View style={styles.wrap}>
      <View style={styles.pill}>
        <Text style={styles.label}>Balance</Text>
        <Text style={styles.currency}>{wallet.currency}</Text>
        <Text style={styles.amount}>{wallet.balance.toFixed(2)}</Text>
        <View style={styles.dividerDot} />
        <Text style={styles.miniAmount}>{earnings.today_earnings.toFixed(2)} today</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    boxShadow: '0px 2px 6px #000',
    elevation: 4,
  },
  label: {
    color: '#718096',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginRight: 2,
  },
  currency: {
    color: '#111111',
    fontSize: 13,
    fontWeight: '900',
  },
  amount: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '900',
  },
  dividerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E0',
    marginHorizontal: 6,
  },
  miniAmount: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '700',
  },
});
