import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Gift, Shield, Zap } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useWallet } from '../contexts/WalletContext';
import { sanitizeInput, validateAmount } from '../lib/validation';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { analytics } from '../lib/analytics';

export default function WalletScreen({ navigation }) {
  const { balance, coins, surgeTokens, transactions, loading, topUp, useSurgeToken } = useWallet();
  const [showTopUp, setShowTopUp] = useState(false);
  const [fundAmount, setFundAmount] = useState('');

  useEffect(() => { analytics.trackScreen('Wallet'); }, []);

  const handleTopUp = async () => {
    const amountError = validateAmount(fundAmount);
    if (amountError) return Alert.alert('Invalid Amount', amountError);
    const amt = parseFloat(fundAmount);
    analytics.trackAction('wallet_topup', { amount: amt });
    await topUp(amt);
    setFundAmount('');
    setShowTopUp(false);
    Alert.alert('Success', `₦${amt.toLocaleString()} added to wallet.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {loading ? (
          <LoadingSkeleton />
        ) : (
        <>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>₦{balance.toLocaleString()}</Text>
          <View style={styles.coinRow}>
            <View>
              <View style={styles.coinBadge}>
                <Gift color={colors.gold.bright} size={14} />
                <Text style={styles.coinText}>{coins} Coins</Text>
              </View>
              <Text style={styles.coinValueHint}>1 coin = ₦100</Text>
            </View>
            <View style={styles.coinBadge}>
              <Zap color={colors.gold.bright} size={14} />
              <Text style={styles.coinText}>{surgeTokens} Surge-Free</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.topUpBtn} onPress={() => setShowTopUp(true)}>
            <Plus color={colors.bg.deep} size={18} />
            <Text style={styles.topUpText}>Top Up</Text>
          </TouchableOpacity>
        </View>

        {surgeTokens > 0 && (
          <TouchableOpacity style={styles.surgeCard} onPress={() => {
            if (useSurgeToken()) Alert.alert('Surge Token Used', 'Your next ride will be surge-free!');
            else Alert.alert('No Tokens', 'You have no surge-free tokens remaining.');
          }}>
            <Zap color={colors.gold.bright} size={20} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.surgeTitle}>Surge-Free Rides</Text>
              <Text style={styles.surgeSub}>Tap to use a token on your next ride. {surgeTokens} remaining.</Text>
            </View>
            <Shield color={colors.gold.bright} size={20} />
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Transaction History</Text>
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions yet.</Text>
          </View>
        ) : (
          transactions.map((txn) => (
            <View key={txn.id} style={styles.txnRow}>
              <View style={styles.txnLeft}>
                <Text style={styles.txnMerchant}>{txn.merchant}</Text>
                <Text style={styles.txnDate}>{txn.date}</Text>
              </View>
              <View style={styles.txnRight}>
                <Text style={[styles.txnAmount, txn.type === 'topup' ? styles.txnPositive : styles.txnNegative]}>
                  {txn.type === 'topup' ? '+' : ''}₦{Math.abs(txn.amount).toLocaleString()}
                </Text>
                <Text style={styles.txnStatus}>{txn.status}</Text>
              </View>
            </View>
          ))
        )}
        </>
      )}
      </ScrollView>

      {showTopUp && (
        <View style={styles.topUpOverlay}>
          <View style={styles.topUpCard}>
            <Text style={styles.topUpTitle}>Top Up Wallet</Text>
            <TextInput
              style={styles.topUpInput}
              placeholder="Enter amount"
              keyboardType="number-pad"
              value={fundAmount}
              onChangeText={v => setFundAmount(sanitizeInput(v))}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleTopUp}>
              <Text style={styles.primaryBtnText}>Deposit via Paystack</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowTopUp(false); setFundAmount(''); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.deep, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.text.primary },
  balanceCard: { backgroundColor: colors.bg.surface, borderWidth: 1.5, borderColor: colors.gold.bright, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 20, elevation: 10, boxShadow: '0px 4px 16px rgba(255,193,7,0.2)' },
  balanceLabel: { fontSize: 14, color: colors.text.secondary, fontWeight: '600', letterSpacing: 1 },
  balanceValue: { fontSize: 42, fontWeight: '900', color: colors.gold.bright, marginVertical: 12 },
  coinRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  coinBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.deep, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.gold.bright, gap: 6 },
  coinText: { color: colors.text.primary, fontSize: 12, fontWeight: '700' },
  coinValueHint: { color: colors.text.muted, fontSize: 9, fontWeight: '600', textAlign: 'center', marginTop: 3 },
  topUpBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.gold.bright, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14, gap: 8, boxShadow: '0px 4px 12px rgba(255,193,7,0.3)' },
  topUpText: { color: colors.bg.deep, fontWeight: 'bold', fontSize: 15 },
  surgeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.surface, borderWidth: 1.5, borderColor: colors.gold.bright, borderRadius: 16, padding: 16, marginBottom: 20 },
  surgeTitle: { fontSize: 15, fontWeight: 'bold', color: colors.text.primary },
  surgeSub: { fontSize: 12, color: colors.text.secondary, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.text.primary, marginBottom: 16 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: colors.text.secondary, fontSize: 14 },
  txnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: colors.bg.surface, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border.gold },
  txnLeft: { flex: 1 },
  txnMerchant: { fontSize: 15, fontWeight: 'bold', color: colors.text.primary },
  txnDate: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  txnRight: { alignItems: 'flex-end' },
  txnAmount: { fontSize: 16, fontWeight: 'bold' },
  txnPositive: { color: colors.success },
  txnNegative: { color: colors.error },
  txnStatus: { fontSize: 11, color: colors.text.secondary, marginTop: 2, textTransform: 'capitalize' },
  topUpOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24, zIndex: 50 },
  topUpCard: { backgroundColor: colors.bg.surface, borderRadius: 24, padding: 28, borderWidth: 1.5, borderColor: colors.gold.bright },
  topUpTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text.primary, marginBottom: 20 },
  topUpInput: { paddingVertical: 12, paddingHorizontal: 4, fontSize: 22, color: colors.text.primary, marginBottom: 20, backgroundColor: 'transparent', outlineStyle: 'none' },
  primaryBtn: { backgroundColor: colors.gold.bright, paddingVertical: 16, borderRadius: 12, alignItems: 'center', boxShadow: '0px 4px 14px rgba(255,193,7,0.3)' },
  primaryBtnText: { color: colors.bg.deep, fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { alignSelf: 'center', marginTop: 12, padding: 10 },
  cancelText: { color: colors.gold.bright, fontWeight: 'bold', fontSize: 15 },
});
