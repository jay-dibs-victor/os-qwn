import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, Animated, Dimensions } from 'react-native';
import { Home, Clock, Wallet, User, Menu } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NAV_PADDING = 32;
const TAB_WIDTH = (SCREEN_WIDTH - NAV_PADDING) / 5;

export default function BottomNav({ activeTab, setActiveTab, onMenuPress }) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  const tabs = [
    { key: 'Home', icon: Home, label: 'Home' },
    { key: 'Rides', icon: Clock, label: 'Rides' },
    { key: 'Wallet', icon: Wallet, label: 'Wallet' },
    { key: 'Account', icon: User, label: 'Account' },
    { key: 'Menu', icon: Menu, label: 'Menu' },
  ];

  useEffect(() => {
    const tabIndex = tabs.findIndex(t => t.key === activeTab);
    if (tabIndex >= 0) {
      Animated.spring(slideAnim, {
        toValue: tabIndex * TAB_WIDTH,
        useNativeDriver: true,
        tension: 120,
        friction: 12,
      }).start();
    }
  }, [activeTab]);

  const handlePress = (key) => {
    if (key === 'Menu') {
      if (onMenuPress) onMenuPress();
      return;
    }
    setActiveTab(key);
  };

  return (
    <View style={navStyles.container}>
      <Animated.View
        style={[
          navStyles.indicator,
          { transform: [{ translateX: slideAnim }], width: TAB_WIDTH - 12 },
        ]}
      />
      {tabs.map(({ key, icon: Icon, label }) => (
        <TouchableOpacity
          key={key}
          style={navStyles.tab}
          onPress={() => handlePress(key)}
          activeOpacity={0.7}
        >
          <View style={[navStyles.iconWrap, activeTab === key && navStyles.iconWrapActive]}>
            <Icon
              color={activeTab === key ? colors.bg.deep : colors.text.secondary}
              size={key === 'Menu' ? 22 : 20}
              strokeWidth={activeTab === key ? 2.5 : 1.5}
            />
          </View>
          <Text style={[navStyles.label, activeTab === key && navStyles.labelActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const navStyles = {
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(20,24,40,0.92)',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    elevation: 24,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,208,96,0.25)',
    zIndex: 25,
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
  },
  indicator: {
    position: 'absolute',
    top: 6,
    left: 6,
    height: 36,
    backgroundColor: colors.gold.bright,
    borderRadius: 999,
    elevation: 4,
    shadowColor: colors.gold.bright,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    zIndex: 2,
  },
  iconWrap: {
    width: 36,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: colors.gold.bright,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
};
