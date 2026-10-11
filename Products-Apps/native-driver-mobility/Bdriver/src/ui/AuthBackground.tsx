import { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

function AuthBackgroundBase() {
  if (Platform.OS === 'web') {
    return <WebAuthBackground />;
  }

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.background}
    >
      <Svg
        pointerEvents="none"
        width="100%"
        height="100%"
        viewBox="0 0 390 844"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id="authBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#090909" />
            <Stop offset="0.62" stopColor="#050505" />
            <Stop offset="1" stopColor="#0B0800" />
          </LinearGradient>
          <LinearGradient id="goldLine" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#6E5608" stopOpacity="0.72" />
            <Stop offset="0.52" stopColor="#FFB800" stopOpacity="0.36" />
            <Stop offset="1" stopColor="#4B3900" stopOpacity="0.52" />
          </LinearGradient>
          <RadialGradient id="pinGlow" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#FFB800" stopOpacity="0.94" />
            <Stop offset="0.42" stopColor="#FFB800" stopOpacity="0.46" />
            <Stop offset="1" stopColor="#FFB800" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect width="390" height="844" fill="url(#authBg)" />

        <G opacity="0.18">
          <Path d="M195 0V844M388 0V844" stroke="#FFFFFF" strokeWidth="1" />
          <Path d="M0 78H390M0 324H390M0 616H390M0 760H390" stroke="#FFFFFF" strokeWidth="1" />
        </G>

        <G opacity="0.16">
          <Path d="M-42 404C58 360 118 400 187 354C257 307 290 211 410 184" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          <Path d="M55 -10C66 145 88 264 126 378C164 492 226 584 261 720C273 766 278 808 278 868" stroke="#FFFFFF" strokeWidth="1.7" fill="none" />
          <Path d="M-20 840C58 664 120 553 196 440C255 352 320 280 420 236" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
          <Path d="M318 -22C282 134 283 290 318 446C348 579 357 699 324 870" stroke="#FFFFFF" strokeWidth="1.4" fill="none" />
          <Path d="M-40 676C68 626 148 655 231 616C309 580 347 504 426 472" stroke="#FFFFFF" strokeWidth="1.6" fill="none" />
        </G>

        <G opacity="0.82">
          <Path d="M-44 296C58 300 116 298 172 262C226 228 248 179 310 168C352 160 386 174 424 210" stroke="url(#goldLine)" strokeWidth="7" strokeLinecap="round" fill="none" />
          <Path d="M71 -36C78 116 93 244 132 364C175 495 246 570 274 704C286 759 288 817 279 888" stroke="url(#goldLine)" strokeWidth="7" strokeLinecap="round" fill="none" />
          <Path d="M-55 736C53 708 135 717 222 722C302 727 362 700 432 648" stroke="url(#goldLine)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <Path d="M398 70C356 160 340 274 356 396C371 510 413 600 420 732" stroke="url(#goldLine)" strokeWidth="4" strokeLinecap="round" fill="none" />
        </G>

        <Circle cx="195" cy="326" r="52" fill="url(#pinGlow)" />
        <Circle cx="195" cy="326" r="28" fill="#FFB800" opacity="0.36" />
        <Circle cx="195" cy="326" r="20" fill="#FFB800" opacity="0.9" />
        <Circle cx="195" cy="326" r="8" fill="#FFFFFF" />
        <Circle cx="195" cy="326" r="4" fill="#111111" />
      </Svg>
      <View pointerEvents="none" style={styles.vignette} />
    </View>
  );
}

export const AuthBackground = memo(AuthBackgroundBase);

function WebAuthBackground() {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.background, styles.webBackground]}
    >
      <View pointerEvents="none" style={[styles.webMapLine, styles.webVerticalCenter]} />
      <View pointerEvents="none" style={[styles.webMapLine, styles.webVerticalRight]} />
      <View pointerEvents="none" style={[styles.webMapLine, styles.webHorizontalTop]} />
      <View pointerEvents="none" style={[styles.webMapLine, styles.webHorizontalMid]} />
      <View pointerEvents="none" style={[styles.webMapLine, styles.webHorizontalLow]} />

      <View pointerEvents="none" style={[styles.webThinRoad, styles.webThinRoadOne]} />
      <View pointerEvents="none" style={[styles.webThinRoad, styles.webThinRoadTwo]} />
      <View pointerEvents="none" style={[styles.webThinRoad, styles.webThinRoadThree]} />

      <View pointerEvents="none" style={[styles.webGoldRoad, styles.webGoldTop]} />
      <View pointerEvents="none" style={[styles.webGoldRoad, styles.webGoldLeft]} />
      <View pointerEvents="none" style={[styles.webGoldRoad, styles.webGoldBottom]} />
      <View pointerEvents="none" style={[styles.webGoldRoad, styles.webGoldRight]} />

      <View pointerEvents="none" style={styles.webPinGlow} />
      <View pointerEvents="none" style={styles.webPinOuter} />
      <View pointerEvents="none" style={styles.webPin} />
      <View pointerEvents="none" style={styles.webPinCore} />
      <View pointerEvents="none" style={styles.vignette} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
  },
  vignette: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  webBackground: {
    backgroundColor: '#050505',
    overflow: 'hidden',
  },
  webMapLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  webVerticalCenter: {
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
  },
  webVerticalRight: {
    top: 0,
    bottom: 0,
    right: 2,
    width: 1,
  },
  webHorizontalTop: {
    top: '9%',
    left: 0,
    right: 0,
    height: 1,
  },
  webHorizontalMid: {
    top: '38%',
    left: 0,
    right: 0,
    height: 1,
  },
  webHorizontalLow: {
    bottom: '15%',
    left: 0,
    right: 0,
    height: 1,
  },
  webThinRoad: {
    position: 'absolute',
    borderColor: 'rgba(255,255,255,0.13)',
    borderWidth: 2,
  },
  webThinRoadOne: {
    width: 520,
    height: 250,
    left: -92,
    top: 250,
    borderRadius: 220,
    transform: [{ rotate: '-23deg' }],
  },
  webThinRoadTwo: {
    width: 580,
    height: 620,
    left: 78,
    top: -40,
    borderRadius: 290,
    transform: [{ rotate: '9deg' }],
  },
  webThinRoadThree: {
    width: 520,
    height: 360,
    left: -112,
    bottom: -10,
    borderRadius: 240,
    transform: [{ rotate: '-15deg' }],
  },
  webGoldRoad: {
    position: 'absolute',
    borderColor: 'rgba(104,82,10,0.62)',
    borderWidth: 7,
  },
  webGoldTop: {
    width: 500,
    height: 210,
    left: -96,
    top: 170,
    borderRadius: 230,
    transform: [{ rotate: '-13deg' }],
  },
  webGoldLeft: {
    width: 430,
    height: 960,
    left: -306,
    top: -40,
    borderRadius: 230,
    transform: [{ rotate: '-6deg' }],
  },
  webGoldBottom: {
    width: 540,
    height: 260,
    left: -112,
    bottom: 12,
    borderRadius: 260,
    transform: [{ rotate: '-4deg' }],
  },
  webGoldRight: {
    width: 250,
    height: 720,
    right: -224,
    top: 20,
    borderRadius: 160,
    borderWidth: 4,
    transform: [{ rotate: '2deg' }],
  },
  webPinGlow: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    width: 104,
    height: 104,
    marginLeft: -52,
    marginTop: -52,
    borderRadius: 52,
    backgroundColor: 'rgba(255,184,0,0.18)',
  },
  webPinOuter: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    width: 56,
    height: 56,
    marginLeft: -28,
    marginTop: -28,
    borderRadius: 28,
    backgroundColor: 'rgba(255,184,0,0.34)',
  },
  webPin: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    width: 34,
    height: 34,
    marginLeft: -17,
    marginTop: -17,
    borderRadius: 17,
    backgroundColor: '#FFB800',
  },
  webPinCore: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    width: 12,
    height: 12,
    marginLeft: -6,
    marginTop: -6,
    borderRadius: 6,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#111111',
  },
});
