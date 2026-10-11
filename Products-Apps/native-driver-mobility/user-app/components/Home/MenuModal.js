import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import {
  X, DollarSign, MapPin, CreditCard, Shield, Gift, Settings, Phone,
  ChevronRight, Star, LogOut, Clock, User,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';

export default function MenuModal({
  visible, setShowMenuModal,
  profile, walletBalance, rating,
  navigation, onLogout, setShowSafetyModal,
}) {
  const menuItems = [
    {
      icon: MapPin, label: 'Saved Places', color: colors.gold.pure,
      action: () => { setShowMenuModal(false); navigation.navigate('SavedPlaces'); },
    },
    {
      icon: CreditCard, label: 'Payment Methods', color: colors.success,
      action: () => { setShowMenuModal(false); Alert.alert('Payment Methods', 'Manage your cards and payment options.'); },
    },
    {
      icon: Shield, label: 'Safety Center', color: colors.info,
      action: () => { setShowMenuModal(false); setTimeout(() => setShowSafetyModal(true), 400); },
    },
    {
      icon: Gift, label: 'Promotions', color: colors.warning,
      action: () => { setShowMenuModal(false); Alert.alert('Promotions', 'No active promotions at the moment. Check back soon!'); },
    },
    {
      icon: Settings, label: 'Settings', color: colors.text.secondary,
      action: () => { setShowMenuModal(false); navigation.navigate('Settings'); },
    },
    {
      icon: Phone, label: 'Help & Support', color: colors.info,
      action: () => { setShowMenuModal(false); navigation.navigate('Support'); },
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setShowMenuModal(false)}>
      <View style={s.overlay}>
        <View style={s.modalCard}>
          {/* Header */}
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Menu</Text>
            <TouchableOpacity style={s.closePill} onPress={() => setShowMenuModal(false)}>
              <X size={18} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Profile Card */}
            <View style={s.menuProfileCard}>
              <View style={s.menuAvatarRing}>
                <Text style={{ fontSize: 28 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={s.menuUserName}>{profile.name}</Text>
                  <View style={s.goldBadge}><Text style={s.goldBadgeText}>RIDER</Text></View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Star size={11} color={colors.gold.pure} fill={colors.gold.pure} style={{ marginRight: 4 }} />
                  <Text style={s.menuRating}>{rating.toFixed(2)}  ·  Lagos</Text>
                </View>
              </View>
            </View>

            {/* Wallet Mini Card */}
            <View style={s.menuWalletCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.menuWalletLabel}>WALLET BALANCE</Text>
                  <Text style={s.menuWalletVal}>₦{walletBalance.toLocaleString()}</Text>
                </View>
                <DollarSign size={20} color={colors.gold.pure} />
              </View>
              <TouchableOpacity
                style={s.topUpBadge}
                onPress={() => { setShowMenuModal(false); navigation.navigate('Wallet'); }}
              >
                <Text style={s.topUpBadgeTxt}>View Wallet</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={s.menuStatsRow}>
              <View style={s.menuStatChip}>
                <Text style={s.menuStatVal}>12</Text>
                <Text style={s.menuStatLbl}>Trips</Text>
              </View>
              <View style={s.menuStatChip}>
                <Text style={[s.menuStatVal, { color: colors.gold.pure }]}>{rating.toFixed(2)}</Text>
                <Text style={s.menuStatLbl}>Rating</Text>
              </View>
              <View style={s.menuStatChip}>
                <Text style={s.menuStatVal}>4</Text>
                <Text style={s.menuStatLbl}>Places</Text>
              </View>
            </View>

            <View style={s.divider} />

            {/* Menu Items */}
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={s.menuItemRow} onPress={item.action} activeOpacity={0.7}>
                <View style={[s.menuItemIconCircle, { borderColor: 'rgba(255,208,96,0.15)' }]}>
                  <item.icon size={17} color={item.color} />
                </View>
                <Text style={s.menuItemRowTxt}>{item.label}</Text>
                <ChevronRight size={15} color={colors.text.muted} />
              </TouchableOpacity>
            ))}

            {/* Trip History & Profile quick links */}
            <TouchableOpacity
              style={s.menuItemRow}
              onPress={() => { setShowMenuModal(false); navigation.navigate('TripHistory'); }}
              activeOpacity={0.7}
            >
              <View style={[s.menuItemIconCircle, { borderColor: 'rgba(255,208,96,0.15)' }]}>
                <Clock size={17} color={colors.info} />
              </View>
              <Text style={s.menuItemRowTxt}>Trip History</Text>
              <ChevronRight size={15} color={colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={s.menuItemRow}
              onPress={() => { setShowMenuModal(false); navigation.navigate('Profile'); }}
              activeOpacity={0.7}
            >
              <View style={[s.menuItemIconCircle, { borderColor: 'rgba(255,208,96,0.15)' }]}>
                <User size={17} color={colors.text.secondary} />
              </View>
              <Text style={s.menuItemRowTxt}>Profile</Text>
              <ChevronRight size={15} color={colors.text.muted} />
            </TouchableOpacity>

            <View style={s.divider} />

            {/* Logout */}
            <TouchableOpacity style={s.menuLogoutBtn} onPress={onLogout} activeOpacity={0.7}>
              <LogOut size={16} color={colors.error} style={{ marginRight: 8 }} />
              <Text style={s.menuLogoutTxt}>Log Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7,11,26,0.88)',
    justifyContent: 'center',
    padding: 20,
    overflow: 'hidden',
  },
  modalCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border.gold,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text.primary,
  },
  closePill: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.bg.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  menuProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.elevated,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: 12,
  },
  menuAvatarRing: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.gold.pure,
    backgroundColor: colors.bg.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuUserName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
    flexShrink: 1,
  },
  goldBadge: {
    backgroundColor: colors.gold.pure,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginLeft: 8,
  },
  goldBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: colors.text.onGold,
  },
  menuRating: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  menuWalletCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: 12,
  },
  menuWalletLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.8,
  },
  menuWalletVal: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.gold.pure,
    marginTop: 4,
  },
  topUpBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold.bright,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  topUpBadgeTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.onGold,
  },
  menuStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  menuStatChip: {
    flex: 1,
    backgroundColor: colors.bg.elevated,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  menuStatVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  menuStatLbl: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.text.muted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: 14,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.elevated,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  menuItemIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.bg.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  menuItemRowTxt: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  menuLogoutBtn: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: colors.border.subtle,
    marginTop: 4,
  },
  menuLogoutTxt: {
    color: colors.error,
    fontWeight: '700',
    fontSize: 14,
  },
});
