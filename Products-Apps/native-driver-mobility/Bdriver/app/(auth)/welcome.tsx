import { useRef, useState, type ReactNode } from 'react';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { Screen } from '../../src/ui/Screen';
import { colors } from '../../src/theme/colors';
import { QueensLogo } from '../../src/ui/QueensLogo';

type Slide = {
  id: string;
  accentWord: string;
  titlePrefix: string;
  titleSuffix: string;
  body: string;
  variant: 'brand' | 'driver' | 'pickup' | 'chat' | 'airport';
};

const slides: Slide[] = [
  {
    id: 'brand',
    accentWord: 'Queens',
    titlePrefix: 'Welcome To',
    titleSuffix: 'Driver',
    body: 'A premium driver app built for trusted trips, smooth dispatch, and better daily movement.',
    variant: 'brand',
  },
  {
    id: 'driver',
    accentWord: 'Steady',
    titlePrefix: 'Stay In Control,',
    titleSuffix: 'On Every Trip',
    body: 'See the route, manage requests, and keep your focus where it matters most: the road ahead.',
    variant: 'driver',
  },
  {
    id: 'pickup',
    accentWord: 'Queens',
    titlePrefix: 'Drive With',
    titleSuffix: 'Confidence',
    body: 'Accept nearby rides, follow clear pickup cues, and keep every trip moving smoothly.',
    variant: 'pickup',
  },
  {
    id: 'chat',
    accentWord: 'Earnings',
    titlePrefix: 'Your Daily',
    titleSuffix: 'At A Glance',
    body: 'Track requests, payouts, rider updates, and trip progress from one focused driver hub.',
    variant: 'chat',
  },
  {
    id: 'airport',
    accentWord: 'Opportunities',
    titlePrefix: 'More',
    titleSuffix: 'On Every Route',
    body: 'Handle city rides, airport pickups, courier jobs, and scheduled work in the Queens app.',
    variant: 'airport',
  },
];

const queensLogoSrc = require('../../assets/logo.jpg');

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const [active, setActive] = useState(0);

  const goToAuth = () => router.replace('/(auth)/auth-choice');

  const onContinue = () => {
    if (active < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: active + 1, animated: true });
      setActive(active + 1);
      return;
    }

    goToAuth();
  };

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActive(Math.min(Math.max(nextIndex, 0), slides.length - 1));
  };

  return (
    <Screen noPadding style={styles.screen}>
      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        bounces={false}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item }) => <SlideView slide={item} width={width} />}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((slide, index) => (
            <View key={slide.id} style={[styles.dot, active === index && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onContinue} style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}>
            <Text style={styles.continueText}>Continue</Text>
          </Pressable>

          {active < slides.length - 1 && (
            <Pressable onPress={goToAuth} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Screen>
  );
}

function SlideView({ slide, width }: { slide: Slide; width: number }) {
  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.heroWrap}>
        <HeroArt variant={slide.variant} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>
          <Text>{slide.titlePrefix} </Text>
          <Text style={styles.accent}>{slide.accentWord}</Text>
          <Text> {slide.titleSuffix}</Text>
        </Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>
    </View>
  );
}

function HeroBackground() {
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} viewBox="0 0 390 760" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#101827" />
          <Stop offset="0.45" stopColor="#111111" />
          <Stop offset="1" stopColor="#050505" />
        </LinearGradient>
      </Defs>
      <Rect width="390" height="760" fill="url(#bg)" />
      <Circle cx="332" cy="86" r="106" fill="#FFB800" opacity="0.18" />
      <Circle cx="70" cy="270" r="128" fill="#0D6A84" opacity="0.12" />
      {Array.from({ length: 9 }).map((_, index) => (
        <Ellipse
          key={`left-${index.toString()}`}
          cx="109"
          cy="200"
          rx={72 + index * 23}
          ry={112 + index * 28}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="3"
          fill="none"
          transform={`rotate(-24 109 200)`}
        />
      ))}
      {Array.from({ length: 7 }).map((_, index) => (
        <Ellipse
          key={`right-${index.toString()}`}
          cx="340"
          cy="152"
          rx={32 + index * 18}
          ry={68 + index * 20}
          stroke="rgba(255,184,0,0.12)"
          strokeWidth="3"
          fill="none"
          transform={`rotate(16 340 152)`}
        />
      ))}
      <Rect x="0" y="474" width="390" height="286" fill="#0D0D0D" opacity="0.95" />
    </Svg>
  );
}

function HeroArt({ variant }: { variant: Slide['variant'] }) {
  if (variant === 'brand') return <BrandHero />;
  if (variant === 'driver') return <DriverHero />;
  if (variant === 'chat') return <ChatHero />;
  if (variant === 'airport') return <AirportHero />;
  return <PickupHero />;
}

function BrandHero() {
  return (
    <View style={styles.heroArt}>
      <View style={styles.logoDisplay}>
        <Image
          source={queensLogoSrc}
          style={styles.logoDisplayImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

function DriverHero() {
  return (
    <View style={styles.heroArt}>
      <View style={styles.photoCard}>
        <Image
          source={require('../../assets/onboarding-driver-steering.jpg')}
          style={styles.driverPhoto}
          resizeMode="cover"
        />
        <View style={styles.photoShade} />
        <View style={styles.photoBadge}>
          <Text style={styles.photoBadgeLabel}>LIVE ROUTE</Text>
          <Text style={styles.photoBadgeValue}>12 min</Text>
        </View>
      </View>
      <View style={styles.photoLogoChip}>
        <QueensLogo size={72} />
      </View>
      <FloatingMessage x={54} y={286} name="Focus mode" text="Trip details stay glanceable" />
      <FloatingMessage x={120} y={350} name="Queens Assist" text="Route support ready" dark />
    </View>
  );
}

function DeviceMockup({ children }: { children: ReactNode }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 330 430">
      <Defs>
        <LinearGradient id="deviceChrome" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F9E7BC" />
          <Stop offset="0.22" stopColor="#4C4639" />
          <Stop offset="0.5" stopColor="#080808" />
          <Stop offset="1" stopColor="#8F7A3B" />
        </LinearGradient>
        <LinearGradient id="screenFade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="0.72" stopColor="#F8FAFC" />
          <Stop offset="1" stopColor="#D7DDE8" />
        </LinearGradient>
      </Defs>
      <Rect x="42" y="7" width="246" height="388" rx="45" fill="url(#deviceChrome)" />
      <Rect x="50" y="17" width="230" height="369" rx="37" fill="url(#screenFade)" />
      <Rect x="122" y="30" width="86" height="26" rx="13" fill="#030303" />
      <Circle cx="224" cy="43" r="3" fill="#1C1C1C" />
      <Rect x="66" y="70" width="198" height="1" fill="#EEF0F4" />
      {children}
    </Svg>
  );
}

function PickupHero() {
  return (
    <View style={styles.heroArt}>
      <DeviceMockup>
        <Circle cx="80" cy="49" r="9" fill="#D9DEE7" />
        <Rect x="96" y="41" width="58" height="8" rx="4" fill="#111827" opacity="0.2" />
        <Rect x="96" y="54" width="34" height="6" rx="3" fill="#111827" opacity="0.12" />
        <Rect x="210" y="40" width="30" height="22" rx="11" fill="#FFF7DA" />
        <Path d="M220 49H231" stroke="#FFB800" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M225.5 43.5V54.5" stroke="#FFB800" strokeWidth="2.5" strokeLinecap="round" />

        <Rect x="68" y="91" width="194" height="88" rx="24" fill="#111111" />
        <Path d="M86 151C112 130 133 130 154 150C178 172 203 162 238 124" stroke="#2E3440" strokeWidth="14" strokeLinecap="round" fill="none" />
        <Path d="M86 151C112 130 133 130 154 150C178 172 203 162 238 124" stroke="#FFB800" strokeWidth="4" strokeLinecap="round" fill="none" />
        <Circle cx="86" cy="151" r="9" fill="#FFFFFF" />
        <Circle cx="238" cy="124" r="9" fill="#FFB800" />

        <Rect x="68" y="197" width="194" height="64" rx="18" fill="#FFFFFF" />
        <Rect x="84" y="213" width="52" height="8" rx="4" fill="#141414" />
        <Rect x="84" y="229" width="140" height="7" rx="3.5" fill="#C9CFD8" />
        <Rect x="84" y="243" width="86" height="7" rx="3.5" fill="#DDE2EA" />
        <Rect x="212" y="218" width="32" height="28" rx="14" fill="#FFF1BD" />
        <Path d="M221 232H235" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />

        <Rect x="68" y="276" width="92" height="72" rx="18" fill="#FFFFFF" />
        <Rect x="84" y="292" width="35" height="7" rx="3.5" fill="#A3AAB5" />
        <SvgText x="84" y="325" fill="#111111" fontSize="26" fontWeight="800">24</SvgText>
        <Rect x="68" y="360" width="194" height="11" rx="5.5" fill="#E9EDF3" />
        <Rect x="174" y="276" width="88" height="72" rx="18" fill="#111111" />
        <Rect x="190" y="294" width="34" height="7" rx="3.5" fill="#FFFFFF" opacity="0.5" />
        <SvgText x="190" y="326" fill="#FFB800" fontSize="23" fontWeight="800">4.9</SvgText>
      </DeviceMockup>
      <View style={[styles.phoneLogo, { left: 111, top: 76 }]}>
        <QueensLogo size={104} />
      </View>
      <FloatingMessage x={42} y={210} name="Queens Dispatch" text="New ride request nearby" />
      <FloatingMessage x={88} y={292} name="Pickup ETA" text="4 minutes away" dark />
      <MetricTile x={234} y={112} label="Live" value="₦" />
      <MetricTile x={32} y={330} label="Trips" value="24" />
    </View>
  );
}

function ChatHero() {
  return (
    <View style={styles.heroArt}>
      <DeviceMockup>
        <Rect x="75" y="87" width="180" height="56" rx="18" fill="#FFF7DA" />
        <Circle cx="101" cy="115" r="15" fill="#111111" />
        <Path d="M93 115H109M101 107V123" stroke="#FFB800" strokeWidth="2.4" strokeLinecap="round" />
        <SvgText x="126" y="112" fill="#111111" fontSize="13" fontWeight="800">Upload documents</SvgText>
        <SvgText x="126" y="130" fill="#6B7280" fontSize="10" fontWeight="600">License, proof and vehicle files</SvgText>

        <Rect x="75" y="162" width="180" height="44" rx="12" fill="#111111" />
        <SvgText x="119" y="190" fill="#FFFFFF" fontSize="14" fontWeight="800">Upload file</SvgText>
        <Path d="M98 185H109M103.5 177V188" stroke="#FFB800" strokeWidth="2.5" strokeLinecap="round" />

        <Rect x="75" y="224" width="180" height="44" rx="14" fill="#FFFFFF" />
        <SvgText x="91" y="249" fill="#111111" fontSize="12" fontWeight="800">Insurance verified</SvgText>
        <Circle cx="235" cy="246" r="11" fill="#EFF9EF" />
        <Path d="M229 246L234 251L242 240" stroke="#1B8F3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        <Rect x="75" y="287" width="180" height="64" rx="18" fill="#FFFFFF" />
        <Rect x="92" y="304" width="54" height="9" rx="4.5" fill="#111111" />
        <Rect x="92" y="322" width="124" height="7" rx="3.5" fill="#C9CFD8" />
        <Rect x="92" y="337" width="82" height="7" rx="3.5" fill="#DDE2EA" />
      </DeviceMockup>
      <View style={[styles.documentTile, { left: 34, top: 52, transform: [{ rotate: '-10deg' }] }]}>
        <Text style={styles.documentType}>PDF</Text>
        <Text style={styles.documentMark}>A</Text>
      </View>
      <View style={[styles.documentTile, { left: 235, top: 112, transform: [{ rotate: '10deg' }] }]}>
        <Text style={styles.documentType}>DOC</Text>
        <Text style={styles.documentMark}>Q</Text>
      </View>
      <View style={[styles.logoChip, { left: 44, top: 284 }]}>
        <QueensLogo size={62} />
      </View>
      <FloatingMessage x={116} y={316} name="Vetting" text="Review ready" dark />
    </View>
  );
}

function AirportHero() {
  return (
    <View style={styles.heroArt}>
      <Svg width="100%" height="100%" viewBox="0 0 330 430">
        <Defs>
          <LinearGradient id="routePanel" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#18202E" />
            <Stop offset="1" stopColor="#080808" />
          </LinearGradient>
        </Defs>
        <Rect x="50" y="52" width="230" height="288" rx="40" fill="url(#routePanel)" />
        <Path d="M74 254C118 186 151 243 191 174C219 126 242 118 264 100" stroke="#2F3745" strokeWidth="18" strokeLinecap="round" fill="none" />
        <Path d="M74 254C118 186 151 243 191 174C219 126 242 118 264 100" stroke="#FFB800" strokeWidth="5" strokeLinecap="round" fill="none" />
        <Circle cx="74" cy="254" r="12" fill="#FFFFFF" />
        <Circle cx="264" cy="100" r="12" fill="#FFB800" />
        <Rect x="78" y="278" width="174" height="38" rx="19" fill="#FFFFFF" opacity="0.96" />
        <SvgText x="104" y="302" fill="#111111" fontSize="14" fontWeight="800">Airport pickup confirmed</SvgText>
        <Path d="M89 297H98" stroke="#FFB800" strokeWidth="3" strokeLinecap="round" />
      </Svg>
      <View style={styles.showcaseLogo}>
        <QueensLogo size={176} />
      </View>
      <ProfessionalTile x={42} y={74} label="CITY" />
      <ProfessionalTile x={238} y={100} label="AIR" />
      <ProfessionalTile x={44} y={292} label="VIP" />
      <FloatingMessage x={102} y={328} name="Queens Route" text="Scheduled work available" dark />
    </View>
  );
}

function MetricTile({ x, y, label, value }: { x: number; y: number; label: string; value: string }) {
  return (
    <View style={[styles.metricTile, { left: x, top: y }]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function ProfessionalTile({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <View style={[styles.professionalTile, { left: x, top: y }]}>
      <Text style={styles.professionalTileText}>{label}</Text>
    </View>
  );
}

function FloatingMessage({ x, y, name, text, dark }: { x: number; y: number; name: string; text: string; dark?: boolean }) {
  return (
    <View style={[styles.floatingMessage, dark && styles.floatingMessageDark, { left: x, top: y }]}>
      <Text style={[styles.floatingName, dark && styles.floatingTextDark]}>{name}</Text>
      <Text style={[styles.floatingText, dark && styles.floatingTextDark]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#050505',
  },
  slide: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 10,
    paddingBottom: 198,
    justifyContent: 'space-between',
  },
  heroWrap: {
    height: '64%',
    minHeight: 390,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroArt: {
    width: '100%',
    maxWidth: 380,
    height: 440,
    position: 'relative',
  },
  copy: {
    alignItems: 'center',
    marginTop: 6,
  },
  title: {
    color: colors.text,
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 38,
    textAlign: 'center',
  },
  accent: {
    color: colors.primary,
  },
  body: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 17,
    lineHeight: 25,
    marginTop: 14,
    maxWidth: 324,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 32,
    paddingBottom: 28,
    paddingTop: 12,
    backgroundColor: '#0D0D0D',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 22,
  },
  dot: {
    width: 42,
    height: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.32)',
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  continueButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  skipButton: {
    width: 80,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#424242',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.86,
  },
  metricTile: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    boxShadow: '0px 12px 20px #000000',
    elevation: 6,
  },
  metricLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#111111',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  logoDisplay: {
    position: 'absolute',
    left: 66,
    top: 70,
    width: 198,
    height: 198,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFB800',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    boxShadow: '0px 0px 28px #FFB800',
    elevation: 12,
  },
  logoDisplayImage: {
    width: '85%',
    height: '85%',
  },
  photoCard: {
    position: 'absolute',
    left: 24,
    top: 42,
    width: 282,
    height: 318,
    borderRadius: 42,
    backgroundColor: '#111111',
    borderColor: 'rgba(255, 184, 0, 0.26)',
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.32,
    shadowRadius: 34,
    boxShadow: '0px 22px 34px #000000',
    elevation: 10,
  },
  driverPhoto: {
    width: '100%',
    height: '100%',
  },
  photoShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  photoBadge: {
    position: 'absolute',
    left: 22,
    bottom: 22,
    minWidth: 116,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  photoBadgeLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '900',
  },
  photoBadgeValue: {
    color: '#111111',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  photoLogoChip: {
    position: 'absolute',
    right: 28,
    top: 70,
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    boxShadow: '0px 14px 24px #000000',
    elevation: 8,
  },
  logoChip: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    boxShadow: '0px 12px 20px #000000',
    elevation: 6,
    overflow: 'hidden',
  },
  phoneLogo: {
    position: 'absolute',
    width: 118,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    boxShadow: '0px 12px 22px #000000',
    elevation: 7,
  },
  showcaseLogo: {
    position: 'absolute',
    left: 84,
    top: 94,
    width: 164,
    height: 144,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.24,
    shadowRadius: 26,
    boxShadow: '0px 16px 26px #000000',
    elevation: 8,
  },
  floatingMessage: {
    position: 'absolute',
    width: 202,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    boxShadow: '0px 14px 24px #000000',
    elevation: 7,
  },
  floatingMessageDark: {
    backgroundColor: '#1F2937',
  },
  floatingName: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '800',
  },
  floatingText: {
    color: '#555555',
    fontSize: 14,
    marginTop: 3,
    fontWeight: '600',
  },
  floatingTextDark: {
    color: '#FFFFFF',
  },
  documentTile: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    boxShadow: '0px 14px 24px #000000',
    elevation: 8,
  },
  documentType: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  documentMark: {
    color: '#111111',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 2,
  },
  professionalTile: {
    position: 'absolute',
    width: 78,
    height: 78,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    boxShadow: '0px 14px 24px #000000',
    elevation: 8,
  },
  professionalTileText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
