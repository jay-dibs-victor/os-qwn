import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { AuthActionButton, AuthField, AuthFlowShell, authColors } from '@/ui/AuthFlow';

type UploadAsset = {
  uri: string;
  name: string;
};

type Step = 'ready' | 'car' | 'license' | 'identity' | 'address' | 'supporting';

const steps: Step[] = ['ready', 'car', 'license', 'identity', 'address', 'supporting'];
const documentStepCount = steps.length - 1;

export default function DriverVerificationScreen() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [driversLicense, setDriversLicense] = useState<UploadAsset | null>(null);
  const [identityDocument, setIdentityDocument] = useState<UploadAsset | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<UploadAsset | null>(null);
  const [supportingDocuments, setSupportingDocuments] = useState<UploadAsset[]>([]);

  const step = steps[stepIndex];
  const progress = step === 'ready' ? 0 : (stepIndex / documentStepCount) * 100;

  const canContinue = useMemo(() => {
    if (step === 'ready') return true;
    if (step === 'car') {
      return [brand, model, color, plateNumber, licenseNumber].every(value => value.trim().length > 0);
    }
    if (step === 'license') return !!driversLicense;
    if (step === 'identity') return !!identityDocument;
    if (step === 'address') return !!proofOfAddress;
    return supportingDocuments.length > 0;
  }, [brand, color, driversLicense, identityDocument, licenseNumber, model, plateNumber, proofOfAddress, step, supportingDocuments.length]);

  const pickDocument = async (multiple = false) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Please allow photo access to upload your document.');
      return [];
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: multiple,
      quality: 0.9,
    });

    if (result.canceled) return [];

    return result.assets.map((asset, index) => ({
      uri: asset.uri,
      name: asset.fileName || `document-${Date.now().toString()}-${index + 1}.jpg`,
    }));
  };

  const next = () => {
    if (!canContinue) return;

    if (stepIndex === steps.length - 1) {
      router.replace('/(auth)/verification-submitted');
      return;
    }

    setStepIndex(value => value + 1);
  };

  const back = () => {
    if (stepIndex === 0) {
      router.back();
      return;
    }

    setStepIndex(value => value - 1);
  };

  const title = step === 'ready' ? 'Driver verification' : 'Upload credentials';
  const subtitle = step === 'ready'
    ? 'Are you ready? Set go to upload your car documents and driver details.'
    : `Step ${stepIndex} of ${documentStepCount}`;

  return (
    <AuthFlowShell title={title} subtitle={subtitle} scroll contentStyle={styles.shellContent} onBackPress={back}>
      {step !== 'ready' && (
        <>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Verification progress</Text>
            <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        </>
      )}

      {step === 'ready' && <ReadyStep />}

      {step === 'car' && (
        <View style={styles.form}>
          <SectionHeader
            icon="car-sport-outline"
            title="Car document details"
            copy="Enter the vehicle information exactly as it appears on your documents."
          />
          <AuthField label="Car brand" placeholder="Toyota" value={brand} onChangeText={setBrand} autoCapitalize="words" />
          <AuthField label="Car model" placeholder="Camry" value={model} onChangeText={setModel} autoCapitalize="words" />
          <AuthField label="Color" placeholder="Black" value={color} onChangeText={setColor} autoCapitalize="words" />
          <AuthField
            label="Plate number"
            placeholder="ABC-123XY"
            value={plateNumber}
            onChangeText={setPlateNumber}
            autoCapitalize="characters"
          />
          <AuthField
            label="Licence number"
            placeholder="Driver licence number"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            autoCapitalize="characters"
          />
        </View>
      )}

      {step === 'license' && (
        <UploadStep
          icon="id-card-outline"
          title="Driver's licence"
          copy="Upload a clear photo of your valid driver's licence."
          asset={driversLicense}
          onPick={async () => setDriversLicense((await pickDocument())[0] || null)}
          onRemove={() => setDriversLicense(null)}
        />
      )}

      {step === 'identity' && (
        <UploadStep
          icon="finger-print-outline"
          title="NIN / Social Sec verification"
          copy="Upload your NIN form or social security verification document."
          asset={identityDocument}
          onPick={async () => setIdentityDocument((await pickDocument())[0] || null)}
          onRemove={() => setIdentityDocument(null)}
        />
      )}

      {step === 'address' && (
        <UploadStep
          icon="home-outline"
          title="Proof of address"
          copy="Upload a utility bill, rental agreement, or other valid proof of address."
          asset={proofOfAddress}
          onPick={async () => setProofOfAddress((await pickDocument())[0] || null)}
          onRemove={() => setProofOfAddress(null)}
        />
      )}

      {step === 'supporting' && (
        <MultiUploadStep
          assets={supportingDocuments}
          onPick={async () => {
            const picked = await pickDocument(true);
            if (picked.length) setSupportingDocuments(value => [...value, ...picked]);
          }}
          onRemove={uri => setSupportingDocuments(value => value.filter(item => item.uri !== uri))}
        />
      )}

      <View style={styles.spacer} />

      <View style={styles.actions}>
        <AuthActionButton
          variant="primary"
          onPress={next}
          disabled={!canContinue}
          style={styles.primaryButton}
          textStyle={styles.primaryText}
        >
          {step === 'ready' ? 'Start Upload' : step === 'supporting' ? 'Submit for review' : 'Next'}
        </AuthActionButton>
      </View>
    </AuthFlowShell>
  );
}

function ReadyStep() {
  return (
    <>
      <View style={styles.readyCard}>
        <View style={styles.readyIcon}>
          <Ionicons name="rocket-outline" size={46} color="#111111" />
        </View>
        <Text style={styles.readyTitle}>Are you ready? Set go.</Text>
        <Text style={styles.readyCopy}>
          We will collect your car document details, driver's licence, identity verification, proof of address,
          and supporting documents.
        </Text>
      </View>

      <View style={styles.checklist}>
        {['Car details', "Driver's licence", 'NIN / Social Sec', 'Proof of address', 'Supporting documents'].map(item => (
          <View key={item} style={styles.checkRow}>
            <Ionicons name="checkmark-circle" size={24} color={authColors.primary} />
            <Text style={styles.checkText}>{item}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

function SectionHeader({ icon, title, copy }: { icon: keyof typeof Ionicons.glyphMap; title: string; copy: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={28} color="#111111" />
      </View>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionText}>{copy}</Text>
      </View>
    </View>
  );
}

function UploadStep({
  icon,
  title,
  copy,
  asset,
  onPick,
  onRemove,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  copy: string;
  asset: UploadAsset | null;
  onPick: () => void;
  onRemove: () => void;
}) {
  return (
    <View>
      <SectionHeader icon={icon} title={title} copy={copy} />
      <Pressable style={[styles.uploadCard, asset && styles.uploadCardFilled]} onPress={onPick}>
        {asset ? (
          <View style={styles.uploadPreviewWrap}>
            <Image source={{ uri: asset.uri }} style={styles.uploadPreview} />
            <View style={styles.uploadCheck}>
              <Ionicons name="checkmark" size={18} color="#111111" />
            </View>
          </View>
        ) : (
          <View style={styles.uploadEmptyIcon}>
            <Ionicons name="cloud-upload-outline" size={42} color={authColors.primary} />
          </View>
        )}
        <Text style={styles.uploadTitle}>{asset ? 'Document selected' : 'Tap to upload'}</Text>
        <Text style={styles.uploadText} numberOfLines={2}>{asset?.name || 'Choose a clear image from your phone.'}</Text>
      </Pressable>
      {!!asset && (
        <View style={styles.uploadActions}>
          <Pressable onPress={onPick} style={({ pressed }) => [styles.uploadActionButton, pressed && styles.pressed]}>
            <Ionicons name="swap-horizontal-outline" size={18} color={authColors.primary} />
            <Text style={styles.uploadActionText}>Replace</Text>
          </Pressable>
          <Pressable onPress={onRemove} style={({ pressed }) => [styles.uploadActionButton, pressed && styles.pressed]}>
            <Ionicons name="trash-outline" size={18} color={authColors.danger} />
            <Text style={[styles.uploadActionText, styles.removeText]}>Remove</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function MultiUploadStep({
  assets,
  onPick,
  onRemove,
}: {
  assets: UploadAsset[];
  onPick: () => void;
  onRemove: (uri: string) => void;
}) {
  return (
    <View>
      <SectionHeader
        icon="albums-outline"
        title="Other supporting documents"
        copy="Upload any additional documents needed to support your driver verification."
      />
      <Pressable style={styles.multiUploadButton} onPress={onPick}>
        <Ionicons name="add-circle-outline" size={28} color={authColors.primary} />
        <Text style={styles.multiUploadText}>Add documents</Text>
      </Pressable>

      <View style={styles.assetList}>
        {assets.length === 0 && (
          <Text style={styles.emptyAssets}>No supporting documents added yet.</Text>
        )}
        {assets.map(asset => (
          <View key={asset.uri} style={styles.assetRow}>
            <Image source={{ uri: asset.uri }} style={styles.assetThumb} />
            <Text style={styles.assetName} numberOfLines={1}>{asset.name}</Text>
            <Pressable accessibilityRole="button" onPress={() => onRemove(asset.uri)} hitSlop={8}>
              <Ionicons name="close-circle" size={26} color={authColors.muted} />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingBottom: 34,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    color: authColors.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  progressValue: {
    color: authColors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: authColors.primary,
  },
  readyCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.24)',
    backgroundColor: 'rgba(255,184,0,0.1)',
    alignItems: 'center',
    padding: 26,
  },
  readyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: authColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  readyTitle: {
    color: authColors.text,
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 31,
    textAlign: 'center',
  },
  readyCopy: {
    color: authColors.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 12,
  },
  checklist: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#1B1B1B',
    padding: 18,
    marginTop: 24,
    gap: 14,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkText: {
    color: authColors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  form: {
    gap: 18,
  },
  sectionHeader: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#1B1B1B',
    flexDirection: 'row',
    gap: 14,
    padding: 18,
    marginBottom: 22,
  },
  sectionIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: authColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCopy: {
    flex: 1,
  },
  sectionTitle: {
    color: authColors.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  sectionText: {
    color: authColors.muted,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 5,
  },
  uploadCard: {
    minHeight: 260,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,184,0,0.36)',
    backgroundColor: 'rgba(255,184,0,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    overflow: 'hidden',
  },
  uploadCardFilled: {
    borderStyle: 'solid',
    backgroundColor: '#1B1B1B',
  },
  uploadPreviewWrap: {
    marginBottom: 18,
  },
  uploadPreview: {
    width: 128,
    height: 128,
    borderRadius: 20,
  },
  uploadCheck: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: authColors.primary,
    borderWidth: 4,
    borderColor: '#1B1B1B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadEmptyIcon: {
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: 'rgba(255,184,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  uploadTitle: {
    color: authColors.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  uploadText: {
    color: authColors.muted,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 6,
  },
  uploadActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  uploadActionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#1B1B1B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadActionText: {
    color: authColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  removeText: {
    color: authColors.danger,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  multiUploadButton: {
    minHeight: 66,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.28)',
    backgroundColor: 'rgba(255,184,0,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  multiUploadText: {
    color: authColors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  assetList: {
    gap: 10,
    marginTop: 16,
  },
  emptyAssets: {
    color: authColors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: 8,
  },
  assetRow: {
    minHeight: 70,
    borderRadius: 16,
    backgroundColor: '#1B1B1B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
  },
  assetThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  assetName: {
    flex: 1,
    color: authColors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  spacer: {
    flex: 1,
    minHeight: 110,
  },
  actions: {
    width: '100%',
  },
  primaryButton: {
    minHeight: 66,
    width: '100%',
    backgroundColor: authColors.primary,
  },
  primaryText: {
    fontSize: 20,
    color: '#000000',
  },
});
