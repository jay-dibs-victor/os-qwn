import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Alert } from 'react-native';
import { ChevronRight, DollarSign, Shield, Settings, LogOut, Star } from 'lucide-react-native';
import { colors } from '../../theme/colors';

export default function DrawerMenu({
  showDrawer, setShowDrawer,
  profile, walletBalance,
  setShowFundModal, setShowSafetyModal,
  drawerAnim,
  navigation,
  onLogout,
}) {
  const closeDrawer = (callback) => {
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setShowDrawer(false);
      if (callback) callback();
    });
  };

  return (
    <Modal visible={showDrawer} transparent animationType="none" onRequestClose={() => closeDrawer()}>
      <View style={drawerStyles.container}>
        <Animated.View style={[drawerStyles.overlay, { opacity: drawerAnim }]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => closeDrawer()} />
        </Animated.View>
        <Animated.View
          style={[
            drawerStyles.panel,
            {
              transform: [
                {
                  translateX: drawerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [320, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Profile */}
          <View style={drawerStyles.profileSection}>
            <View style={drawerStyles.avatar}>
              <Text style={{ fontSize: 32 }}>👤</Text>
            </View>
            <Text style={drawerStyles.name}>{profile.name}</Text>
            <View style={drawerStyles.ratingRow}>
              <Star size={12} color={colors.gold.pure} fill={colors.gold.pure} />
              <Text style={drawerStyles.rating}>{profile.rating.toFixed(2)}  ·  Passenger</Text>
            </View>
          </View>

          {/* Wallet */}
          <TouchableOpacity
            style={drawerStyles.walletCard}
            onPress={() => closeDrawer(() => setShowFundModal(true))}
            activeOpacity={0.85}
          >
            <Text style={drawerStyles.walletLabel}>WALLET</Text>
            <Text style={drawerStyles.walletValue}>₦{walletBalance.toLocaleString()}</Text>
            <Text style={drawerStyles.walletSub}>Tap to top up</Text>
          </TouchableOpacity>

          {/* Menu Items */}
          <TouchableOpacity
            style={drawerStyles.menuItem}
            onPress={() => closeDrawer(() => setShowSafetyModal(true))}
            activeOpacity={0.7}
          >
            <View style={drawerStyles.menuIcon}><Shield size={17} color={colors.info} /></View>
            <Text style={drawerStyles.menuItemText}>Safety Center</Text>
            <ChevronRight size={15} color={colors.text.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={drawerStyles.menuItem}
            onPress={() => closeDrawer(() => navigation.navigate('Settings'))}
            activeOpacity={0.7}
          >
            <View style={drawerStyles.menuIcon}><Settings size={17} color={colors.text.secondary} /></View>
            <Text style={drawerStyles.menuItemText}>Settings</Text>
            <ChevronRight size={15} color={colors.text.muted} />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            style={drawerStyles.logoutBtn}
            onPress={() => {
              onLogout();
              closeDrawer(() => navigation.replace('Login'));
            }}
            activeOpacity={0.7}
          >
            <LogOut size={16} color={colors.error} style={{ marginRight: 8 }} />
            <Text style={drawerStyles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const drawerStyles = {
  container: { flex: 1, flexDirection: 'row' },
  overlay: { flex: 1, backgroundColor: 'rgba(7,11,26,0.65)' },
  panel: {
    width: '72%',
    backgroundColor: colors.bg.base,
    paddingTop: 60,
    paddingHorizontal: 22,
    borderLeftWidth: 1,
    borderColor: 'rgba(255,208,96,0.1)',
  },
  profileSection: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.bg.elevated,
    borderWidth: 2,
    borderColor: 'rgba(255,208,96,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 18, fontWeight: '900', color: colors.text.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  rating: { fontSize: 12, color: colors.gold.pure, fontWeight: '700', marginLeft: 6 },
  walletCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,208,96,0.2)',
  },
  walletLabel: { fontSize: 9, fontWeight: '700', color: colors.text.muted, letterSpacing: 1 },
  walletValue: { fontSize: 24, fontWeight: '900', color: colors.gold.pure, marginVertical: 6 },
  walletSub: { fontSize: 11, color: colors.text.muted },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  menuIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: colors.bg.elevated,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  menuItemText: { fontSize: 14, fontWeight: '700', color: colors.text.primary, flex: 1 },
  logoutBtn: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginTop: 'auto',
    marginBottom: 40,
  },
  logoutText: { color: colors.error, fontWeight: '700', fontSize: 14 },
};
