/**
 * CollapsibleSheet
 *
 * A wrapper that adds a tap-to-collapse / tap-to-expand drag handle to any
 * bottom-sheet component.  When collapsed only a small "peek strip" (handle +
 * label) is visible so the map takes up as much of the screen as possible.
 *
 * Usage:
 *   <CollapsibleSheet label="Finding trips" defaultCollapsed={false}>
 *     <FindingTrips />
 *   </CollapsibleSheet>
 */

import React, {
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';

interface Props {
  /** Short label shown in the peek strip when collapsed */
  label: string;
  /** Accent colour for the handle pill (defaults to primary) */
  accentColor?: string;
  /** Start collapsed? (default false — open) */
  defaultCollapsed?: boolean;
  /** Called whenever collapsed state changes */
  onCollapseChange?: (collapsed: boolean) => void;
}

const ANIMATION_DURATION = 280;
/** Height of the drag-handle row that stays visible when collapsed */
const PEEK_HEIGHT = 44;

export default function CollapsibleSheet({
  label,
  accentColor = colors.primary,
  defaultCollapsed = false,
  onCollapseChange,
  children,
}: PropsWithChildren<Props>) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const animatedHeight = useRef(new Animated.Value(defaultCollapsed ? 0 : 1)).current;
  // Track whether we've measured once already
  const hasMeasured = useRef(false);

  // Whenever collapsed flips, animate
  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: collapsed ? 0 : 1,
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    onCollapseChange?.(collapsed);
  }, [collapsed, animatedHeight, onCollapseChange]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (!hasMeasured.current && h > 0) {
      hasMeasured.current = true;
      setContentHeight(h);
      // If we start collapsed, snap to 0 immediately without animation on first measure
      if (defaultCollapsed) {
        animatedHeight.setValue(0);
      }
    }
  };

  const toggle = () => setCollapsed(c => !c);

  // Interpolate height: 0 → PEEK_HEIGHT only, 1 → PEEK_HEIGHT + contentHeight
  const containerHeight =
    contentHeight !== null
      ? animatedHeight.interpolate({
          inputRange: [0, 1],
          outputRange: [PEEK_HEIGHT, PEEK_HEIGHT + contentHeight],
        })
      : undefined;

  // Rotate the chevron: 0 = collapsed (chevron up), 1 = expanded (chevron down)
  const chevronRotate = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg'],
  });

  // Fade the body content in/out
  const bodyOpacity = animatedHeight.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        containerHeight !== undefined ? { height: containerHeight } : undefined,
      ]}
    >
      {/* ── Drag handle / header row ── */}
      <Pressable
        onPress={toggle}
        style={styles.handleRow}
        accessibilityRole="button"
        accessibilityLabel={collapsed ? `Expand ${label}` : `Collapse ${label}`}
        hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
      >
        {/* Centre pill */}
        <View style={styles.pillWrap}>
          <View style={[styles.pill, { backgroundColor: accentColor + '55' }]} />
        </View>

        {/* Label — fades when expanded */}
        <Animated.Text
          style={[
            styles.peekLabel,
            {
              opacity: animatedHeight.interpolate({
                inputRange: [0, 0.5],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
              color: accentColor,
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>

        {/* Chevron */}
        <Animated.View
          style={[styles.chevron, { transform: [{ rotate: chevronRotate }] }]}
        >
          <Ionicons name="chevron-down" size={16} color={accentColor} />
        </Animated.View>
      </Pressable>

      {/* ── Sheet body ── measured once, then animated via opacity/height ── */}
      <Animated.View style={[styles.body, { opacity: bodyOpacity }]} onLayout={handleLayout}>
        {children}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 8,
  },
  handleRow: {
    height: PEEK_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    position: 'relative',
  },
  pillWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    paddingTop: 10,
  },
  pill: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  peekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  chevron: {
    position: 'absolute',
    right: 18,
    top: 14,
  },
  body: {
    // No explicit height — measured naturally, then clipped by wrapper
  },
});
