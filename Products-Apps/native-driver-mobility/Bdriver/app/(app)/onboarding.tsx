import { useMemo, useState } from 'react';
import { Platform, Pressable, KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../../src/ui/Screen';
import { AuthBackground } from '../../src/ui/AuthBackground';
import { TextField } from '../../src/ui/TextField';
import { PrimaryButton } from '../../src/ui/PrimaryButton';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/auth';

type PickedAsset = { uri: string; name: string; type: string };

async function pickAsset(mode: 'image' | 'video'): Promise<PickedAsset | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes:
      mode === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
    quality: 1,
  });

  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset?.uri) return null;

  const name =
    asset.fileName ||
    asset.uri.split('/').pop() ||
    `${mode}-${Date.now().toString()}${mode === 'video' ? '.mp4' : '.jpg'}`;
  const type =
    asset.mimeType || (mode === 'video' ? 'video/mp4' : 'image/jpeg');

  return { uri: asset.uri, name, type };
}

export default function DriverOnboardingScreen() {
  const submitDriverOnboarding = useAuthStore(s => s.submitDriverOnboarding);
  const refreshDriverOnboardingStatus = useAuthStore(s => s.refreshDriverOnboardingStatus);
  const loading = useAuthStore(s => s.loading);
  const storeError = useAuthStore(s => s.error);

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [ssn, setSsn] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [address, setAddress] = useState('');

  const [isPartner, setIsPartner] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [fleetSize, setFleetSize] = useState('1');

  const [licenseFront, setLicenseFront] = useState<PickedAsset | null>(null);
  const [idProof, setIdProof] = useState<PickedAsset | null>(null);
  const [utilityBill, setUtilityBill] = useState<PickedAsset | null>(null);
  const [insurance, setInsurance] = useState<PickedAsset | null>(null);
  const [carInteriorVideo, setCarInteriorVideo] = useState<PickedAsset | null>(null);
  const [carExteriorVideo, setCarExteriorVideo] = useState<PickedAsset | null>(null);

  const [localError, setLocalError] = useState<string | null>(null);

  const progress = useMemo(() => (step / 3) * 100, [step]);

  const next = () => setStep(s => (s === 1 ? 2 : 3));
  const back = () => setStep(s => (s === 3 ? 2 : 1));

  const validateStep1 = () => {
    if (!ssn.trim() || !licenseNumber.trim() || !licenseExpiry.trim() || !address.trim()) {
      setLocalError('All fields are required');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!licenseFront || !idProof || !utilityBill || !insurance) {
      setLocalError('All documents are required');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!carInteriorVideo || !carExteriorVideo) {
      setLocalError('Interior and exterior videos are required');
      return false;
    }
    if (isPartner) {
      if (!companyName.trim() || !registrationNumber.trim() || !fleetSize.trim()) {
        setLocalError('Partner details are required');
        return false;
      }
    }
    return true;
  };

  const onSubmit = async () => {
    setLocalError(null);
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;

    // The current driver store expects the canonical `OnboardingDraft`. The
    // capture-only form here is kept intentionally minimal: we lift the
    // identity fields from the authenticated user and map the picked assets
    // into the canonical document slots. A richer flow (vehicle/bank/insurance
    // editors) is queued for P2 and will replace this adapter.
    const user = useAuthStore.getState().user;
    const draft = {
      firstName: user?.firstname ?? '',
      lastName: user?.lastname ?? '',
      email: user?.email ?? '',
      phone: user?.phone_number ?? '',
      dateOfBirth: '',
      address: address.trim(),
      city: '',
      referralCode: '',
      vehicle: {
        make: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        plate: '',
        type: 'economy' as const,
        seats: 4,
      },
      insurance: {
        provider: '',
        policyNumber: licenseNumber.trim(),
        expires: licenseExpiry.trim(),
      },
      bank: {
        bankName: '',
        accountHolder: `${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim(),
        accountNumber: '',
        routingNumber: '',
      },
      documents: {
        license: licenseFront,
        insurance,
        inspection: carInteriorVideo ?? carExteriorVideo,
        selfie: idProof,
        backgroundCheck: utilityBill,
      },
    };

    const result = await submitDriverOnboarding(draft as unknown as Parameters<typeof submitDriverOnboarding>[0]);

    if (result.success) {
      await refreshDriverOnboardingStatus();
      router.replace('/(app)/vetting-pending');
      return;
    }
    setLocalError(result.error ?? 'Onboarding submission failed');
  };

  const pickAndSet = async (mode: 'image' | 'video', setter: (a: PickedAsset | null) => void) => {
    setLocalError(null);
    const picked = await pickAsset(mode);
    if (picked) setter(picked);
  };

  const content = (
    <View style={styles.body}>
          <View style={styles.header}>
            <Text style={styles.title}>Driver onboarding</Text>
            <Text style={styles.subtitle}>Step {step} of 3</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
          >
            {step === 1 && (
              <View style={styles.card}>
                <TextField label="SSN / Tax ID" value={ssn} onChangeText={setSsn} autoCapitalize="none" />
                <TextField
                  label="Driver's license number"
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                  autoCapitalize="none"
                />
                <TextField
                  label="License expiry (YYYY-MM-DD)"
                  value={licenseExpiry}
                  onChangeText={setLicenseExpiry}
                  autoCapitalize="none"
                />
                <TextField
                  label="Home address"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  style={{ height: 96, paddingTop: 12, textAlignVertical: 'top' }}
                />

                {!!(localError || storeError) && <Text style={styles.error}>{localError || storeError}</Text>}

                <PrimaryButton
                  onPress={() => {
                    setLocalError(null);
                    if (validateStep1()) next();
                  }}
                  disabled={loading}
                >
                  Continue
                </PrimaryButton>
              </View>
            )}

            {step === 2 && (
              <View style={styles.card}>
                <PickerRow
                  label="License front"
                  value={licenseFront?.name}
                  onPick={() => pickAndSet('image', setLicenseFront)}
                />
                <PickerRow label="ID proof" value={idProof?.name} onPick={() => pickAndSet('image', setIdProof)} />
                <PickerRow
                  label="Utility bill"
                  value={utilityBill?.name}
                  onPick={() => pickAndSet('image', setUtilityBill)}
                />
                <PickerRow
                  label="Insurance"
                  value={insurance?.name}
                  onPick={() => pickAndSet('image', setInsurance)}
                />

                {!!(localError || storeError) && <Text style={styles.error}>{localError || storeError}</Text>}

                <View style={styles.row}>
                  <Pressable onPress={back} style={[styles.secondaryBtn, loading && styles.disabledBtn]} disabled={loading}>
                    <Text style={styles.secondaryText}>Back</Text>
                  </Pressable>
                  <View style={{ flex: 1 }} />
                  <Pressable
                    onPress={() => {
                      setLocalError(null);
                      if (validateStep2()) next();
                    }}
                    style={[styles.secondaryBtn, styles.primaryBtn, loading && styles.disabledBtn]}
                    disabled={loading}
                  >
                    <Text style={styles.primaryText}>Continue</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {step === 3 && (
              <View style={styles.card}>
                <View style={styles.partnerRow}>
                  <Pressable
                    onPress={() => setIsPartner(v => !v)}
                    style={[styles.checkbox, isPartner && styles.checkboxOn]}
                  />
                  <Text style={styles.partnerText}>Registering as Partner/Fleet company</Text>
                </View>

                {isPartner && (
                  <View style={{ gap: 14 }}>
                    <TextField label="Company name" value={companyName} onChangeText={setCompanyName} />
                    <TextField
                      label="Registration number"
                      value={registrationNumber}
                      onChangeText={setRegistrationNumber}
                    />
                    <TextField label="Fleet size" value={fleetSize} onChangeText={setFleetSize} keyboardType="number-pad" />
                  </View>
                )}

                <View style={{ height: 14 }} />

                <PickerRow
                  label="Car interior video"
                  value={carInteriorVideo?.name}
                  onPick={() => pickAndSet('video', setCarInteriorVideo)}
                />
                <PickerRow
                  label="Car exterior video"
                  value={carExteriorVideo?.name}
                  onPick={() => pickAndSet('video', setCarExteriorVideo)}
                />

                {!!(localError || storeError) && <Text style={styles.error}>{localError || storeError}</Text>}

                <View style={styles.row}>
                  <Pressable onPress={back} style={[styles.secondaryBtn, loading && styles.disabledBtn]} disabled={loading}>
                    <Text style={styles.secondaryText}>Back</Text>
                  </Pressable>
                  <View style={{ flex: 1 }} />
                  <Pressable
                    onPress={onSubmit}
                    style={[styles.secondaryBtn, styles.primaryBtn, loading && styles.disabledBtn]}
                    disabled={loading}
                  >
                    <Text style={styles.primaryText}>{loading ? 'Submitting...' : 'Submit for review'}</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
  );

  return (
    <Screen noPadding style={styles.screen}>
      <AuthBackground />
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.container}
        >
          <View style={styles.foreground}>{content}</View>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.container}>
          <View style={styles.foreground}>{content}</View>
        </View>
      )}
    </Screen>
  );
}

function PickerRow({
  label,
  value,
  onPick,
}: {
  label: string;
  value?: string;
  onPick: () => void;
}) {
  return (
    <View style={styles.pickerRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.pickerLabel}>{label}</Text>
        <Text style={styles.pickerValue}>{value || 'No file selected'}</Text>
      </View>
      <Pressable onPress={onPick} style={styles.pickBtn}>
        <Text style={styles.pickBtnText}>Choose</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#050505',
  },
  container: {
    flex: 1,
    zIndex: 1,
  },
  foreground: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
  },
  header: {
    gap: 6,
    marginBottom: 14,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.primary,
  },
  content: {
    paddingBottom: 180,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    borderRadius: 14,
    padding: 12,
  },
  pickerLabel: {
    color: colors.text,
    fontWeight: '800',
    marginBottom: 3,
  },
  pickerValue: {
    color: colors.textMuted,
    fontSize: 12,
  },
  pickBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  pickBtnText: {
    color: colors.text,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secondaryBtn: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '800',
  },
  primaryText: {
    color: colors.text,
    fontWeight: '900',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  checkboxOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  partnerText: {
    color: colors.text,
    fontWeight: '800',
  },
});
