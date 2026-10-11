import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthActionButton, AuthFlowShell, authColors } from '@/ui/AuthFlow';

type Country = {
  name: string;
  code: string;
  flag: string;
  callingCode: string;
};

type DrawerMode = 'country' | 'phone';

const countries: Country[] = [
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬', callingCode: '+234' },
  { name: 'Ghana', code: 'GH', flag: '🇬🇭', callingCode: '+233' },
  { name: 'Kenya', code: 'KE', flag: '🇰🇪', callingCode: '+254' },
  { name: 'South Africa', code: 'ZA', flag: '🇿🇦', callingCode: '+27' },
  { name: 'United States', code: 'US', flag: '🇺🇸', callingCode: '+1' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', callingCode: '+44' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦', callingCode: '+1' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', callingCode: '+971' },
  { name: 'India', code: 'IN', flag: '🇮🇳', callingCode: '+91' },
  { name: 'China', code: 'CN', flag: '🇨🇳', callingCode: '+86' },
  { name: 'France', code: 'FR', flag: '🇫🇷', callingCode: '+33' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', callingCode: '+49' },
  { name: 'Italy', code: 'IT', flag: '🇮🇹', callingCode: '+39' },
  { name: 'Spain', code: 'ES', flag: '🇪🇸', callingCode: '+34' },
  { name: 'Netherlands', code: 'NL', flag: '🇳🇱', callingCode: '+31' },
  { name: 'Brazil', code: 'BR', flag: '🇧🇷', callingCode: '+55' },
  { name: 'Mexico', code: 'MX', flag: '🇲🇽', callingCode: '+52' },
  { name: 'Egypt', code: 'EG', flag: '🇪🇬', callingCode: '+20' },
  { name: 'Morocco', code: 'MA', flag: '🇲🇦', callingCode: '+212' },
  { name: 'Cameroon', code: 'CM', flag: '🇨🇲', callingCode: '+237' },
  { name: 'Cote d’Ivoire', code: 'CI', flag: '🇨🇮', callingCode: '+225' },
  { name: 'Senegal', code: 'SN', flag: '🇸🇳', callingCode: '+221' },
  { name: 'Rwanda', code: 'RW', flag: '🇷🇼', callingCode: '+250' },
  { name: 'Uganda', code: 'UG', flag: '🇺🇬', callingCode: '+256' },
  { name: 'Tanzania', code: 'TZ', flag: '🇹🇿', callingCode: '+255' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', callingCode: '+61' },
];

export default function AdditionalInfoScreen() {
  const router = useRouter();
  const { email, password, category } = useLocalSearchParams<{
    email?: string;
    password?: string;
    category?: string;
  }>();

  const [country, setCountry] = useState(countries[0]);
  const [phoneCountry, setPhoneCountry] = useState(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [query, setQuery] = useState('');

  const drawerTitle = drawerMode === 'phone' ? 'Phone Code' : 'Select country';
  const drawerPlaceholder = drawerMode === 'phone' ? 'Search country or phone code' : 'Search country';
  const phoneDigits = phoneNumber.replace(/\D/g, '');
  const canCreateAccount = !!country && !!phoneCountry && phoneDigits.length >= 7;

  const filteredCountries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return countries;

    return countries.filter(item =>
      `${item.name} ${item.code} ${item.callingCode}`.toLowerCase().includes(normalized)
    );
  }, [query]);

  const openDrawer = (mode: DrawerMode) => {
    setDrawerMode(mode);
    setQuery('');
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setQuery('');
  };

  const handleSelectCountry = (item: Country) => {
    if (drawerMode === 'phone') {
      setPhoneCountry(item);
    } else {
      setCountry(item);
    }

    closeDrawer();
  };

  const createAccount = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Signup details are missing. Please start again.');
      router.replace('/(auth)/register');
      return;
    }

    if (!canCreateAccount) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    router.push({
      pathname: '/(auth)/registration-success',
      params: {
        email: normalizedEmail,
        phoneNumber: `${phoneCountry.callingCode}${phoneDigits}`,
        category,
        country: country.name,
        countryCode: country.code,
        phoneCountry: phoneCountry.name,
        phoneCountryCode: phoneCountry.code,
        callingCode: phoneCountry.callingCode,
      },
    });
  };

  const drawerContent = (
    <>
      <Pressable style={styles.backdropTapArea} onPress={closeDrawer} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{drawerTitle}</Text>
          <Pressable onPress={closeDrawer} hitSlop={10}>
            <Ionicons name="close" size={34} color={authColors.text} />
          </Pressable>
        </View>

        <View style={styles.search} collapsable={false}>
          <Ionicons name="search-outline" size={24} color={authColors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={drawerPlaceholder}
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
            collapsable={false}
          />
        </View>

        <ScrollView style={styles.countryList} keyboardShouldPersistTaps="always" keyboardDismissMode="none" showsVerticalScrollIndicator={false}>
          {filteredCountries.map(item => {
            const selected = drawerMode === 'phone'
              ? item.code === phoneCountry.code
              : item.code === country.code;

            return (
              <Pressable
                key={`${drawerMode}-${item.code}`}
                style={[styles.countryRow, selected && styles.countryRowSelected]}
                onPress={() => handleSelectCountry(item)}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <View style={styles.countryCopy}>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryMeta}>{item.code}  ·  {item.callingCode}</Text>
                </View>
                {selected ? (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark" size={18} color="#111111" />
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={23} color={authColors.muted} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </>
  );

  return (
    <>
      <AuthFlowShell
        title="Location Identity"
        subtitle="Add your country and phone details so riders and partners can identify you correctly."
        contentStyle={styles.shellContent}
        scroll
      >
        <Text style={styles.label}>Country</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select country"
          style={styles.select}
          onPress={() => openDrawer('country')}
        >
          <Text style={styles.flag}>{country.flag}</Text>
          <View style={styles.selectCopy}>
            <Text style={styles.selectText}>{country.name}</Text>
            <Text style={styles.selectMeta}>{country.code}</Text>
          </View>
          <Ionicons name="chevron-down" size={24} color={authColors.muted} />
        </Pressable>

        <Text style={styles.label}>Phone number</Text>
        <View style={styles.phoneRow} collapsable={false}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select phone code"
            style={styles.phoneCode}
            onPress={() => openDrawer('phone')}
          >
            <Text style={styles.phoneFlag}>{phoneCountry.flag}</Text>
            <Text style={styles.phoneCodeText}>{phoneCountry.callingCode}</Text>
            <Ionicons name="chevron-down" size={20} color={authColors.muted} />
          </Pressable>

          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Phone number"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={styles.phoneInput}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            collapsable={false}
          />
        </View>

        <View style={styles.identityHint}>
          <Ionicons name="shield-checkmark-outline" size={24} color={authColors.primary} />
          <Text style={styles.identityHintText}>
            Your country and phone code help us format your profile and contact details correctly.
          </Text>
        </View>

        <View style={styles.spacer} />

        <AuthActionButton
          variant="primary"
          onPress={createAccount}
          disabled={!canCreateAccount}
          style={styles.createButton}
          textStyle={styles.createText}
        >
          Create Account
        </AuthActionButton>
      </AuthFlowShell>

      <Modal visible={!!drawerMode} transparent animationType="slide" onRequestClose={closeDrawer}>
        {Platform.OS === 'ios' ? (
          <KeyboardAvoidingView
            behavior="padding"
            style={styles.modalBackdrop}
          >
            {drawerContent}
          </KeyboardAvoidingView>
        ) : (
          <View style={styles.modalBackdrop}>{drawerContent}</View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingBottom: 34,
  },
  label: {
    color: authColors.text,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 12,
  },
  select: {
    minHeight: 76,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    marginBottom: 28,
  },
  phoneRow: {
    minHeight: 76,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  phoneCode: {
    alignSelf: 'stretch',
    minWidth: 126,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  phoneCodeText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '800',
  },
  createButton: {
    minHeight: 66,
    marginTop: 28,
    backgroundColor: authColors.primary,
  },
  createText: {
    fontSize: 20,
    color: '#000000',
  },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  countryName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  countryMeta: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  flag: {
    fontSize: 34,
    lineHeight: 42,
  },
  selectCopy: {
    flex: 1,
  },
  selectText: {
    color: authColors.text,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 25,
  },
  selectMeta: {
    color: authColors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  phoneRow: {
    minHeight: 76,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  phoneCode: {
    alignSelf: 'stretch',
    minWidth: 126,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  phoneFlag: {
    fontSize: 24,
    lineHeight: 30,
  },
  phoneCodeText: {
    color: authColors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  phoneInput: {
    flex: 1,
    color: authColors.text,
    fontSize: 19,
    lineHeight: 25,
    paddingHorizontal: 18,
    backgroundColor: '#000000',
  },
  identityHint: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,184,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.22)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
  },
  identityHintText: {
    flex: 1,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    lineHeight: 21,
  },
  spacer: {
    flex: 1,
    minHeight: 150,
  },
  createButton: {
    minHeight: 66,
  },
  createText: {
    fontSize: 20,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  backdropTapArea: {
    flex: 1,
  },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#171717',
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  handle: {
    alignSelf: 'center',
    width: 74,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.28)',
    marginTop: 12,
    marginBottom: 22,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetTitle: {
    color: authColors.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  search: {
    minHeight: 62,
    borderRadius: 18,
    backgroundColor: '#242424',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: authColors.text,
    fontSize: 18,
    lineHeight: 24,
  },
  countryList: {
    marginTop: 2,
  },
  countryRow: {
    minHeight: 76,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  countryRowSelected: {
    backgroundColor: 'rgba(255,184,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.42)',
  },
  countryFlag: {
    width: 46,
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
  },
  countryCopy: {
    flex: 1,
  },
  countryName: {
    color: authColors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  countryMeta: {
    color: authColors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  selectedBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: authColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
