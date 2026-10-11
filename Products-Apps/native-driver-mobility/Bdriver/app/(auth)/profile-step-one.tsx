import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AuthActionButton,
  AuthBottomSheetSelect,
  AuthField,
  AuthFlowShell,
  authColors,
  type AuthSelectOption,
} from '@/ui/AuthFlow';

const genderOptions: AuthSelectOption[] = [
  { label: 'Male', value: 'Male', icon: 'male-outline' },
  { label: 'Female', value: 'Female', icon: 'female-outline' },
  { label: 'Other', value: 'Other', icon: 'person-outline' },
];

export default function ProfileStepOneScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [genderSheetOpen, setGenderSheetOpen] = useState(false);
  const canContinue = !!firstName.trim() && !!lastName.trim();

  const handleContinue = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    router.push({
      pathname: '/(auth)/profile-step-two',
      params: {
        email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dob: dob.trim(),
        gender,
      },
    });
  };

  return (
    <AuthFlowShell
      title="Set up your profile"
      subtitle="Add the basics riders and partners will see on your profile."
      scroll
      contentStyle={styles.shellContent}
    >
      <View style={styles.progressCard}>
        <View style={styles.stepPill}>
          <Text style={styles.stepPillText}>Step 1 of 2</Text>
        </View>
        <Text style={styles.progressTitle}>Personal details</Text>
        <Text style={styles.progressCopy}>Use the same name that appears on your driver documents.</Text>
      </View>

      <View style={styles.form}>
        <AuthField
          label="First Name"
          placeholder="Enter your first name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />
        <AuthField
          label="Last Name"
          placeholder="Enter your last name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />
        {Platform.OS === 'web' ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Date of Birth (Optional)</Text>
            <View style={styles.webDatePickerContainer}>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                style={styles.webDatePicker}
              />
            </View>
          </View>
        ) : (
          <AuthField
            label="Date of Birth (Optional)"
            placeholder="MM/DD/YYYY"
            value={dob}
            onChangeText={setDob}
            keyboardType="numbers-and-punctuation"
            trailing={<Ionicons name="calendar-outline" size={30} color="rgba(255,255,255,0.68)" />}
          />
        )}
        <View style={styles.selectGroup}>
          <Text style={styles.fieldLabel}>Gender (Optional)</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setGenderSheetOpen(true)}
            style={[styles.selectButton, !!gender && styles.selectButtonFilled]}
          >
            <Text style={[styles.selectText, !gender && styles.selectPlaceholder]}>
              {gender || 'Select gender'}
            </Text>
            <Ionicons name={genderSheetOpen ? 'chevron-up' : 'chevron-down'} size={24} color="rgba(255,255,255,0.68)" />
          </Pressable>
        </View>

        <AuthBottomSheetSelect
          visible={genderSheetOpen}
          title="Choose gender"
          options={genderOptions}
          value={gender}
          onSelect={setGender}
          onClose={() => setGenderSheetOpen(false)}
        />

        <AuthActionButton
          variant="primary"
          onPress={handleContinue}
          disabled={!canContinue}
          style={styles.continueButton}
          textStyle={styles.continueText}
        >
          Continue
        </AuthActionButton>
      </View>
    </AuthFlowShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingBottom: 34,
  },
  form: {
    gap: 20,
  },
  progressCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#1B1B1B',
    padding: 18,
    marginBottom: 26,
  },
  stepPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(255,184,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.26)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
  },
  stepPillText: {
    color: authColors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  progressTitle: {
    color: authColors.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  progressCopy: {
    color: authColors.muted,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 5,
  },
  fieldGroup: {
    gap: 12,
  },
  fieldLabel: {
    color: authColors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  webDatePickerContainer: {
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: authColors.borderStrong,
    backgroundColor: authColors.field,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  webDatePicker: {
    color: authColors.text,
    fontSize: 20,
    backgroundColor: 'transparent',
    borderWidth: 0,
    outlineStyle: 'none',
  },
  selectGroup: {
    gap: 12,
  },
  selectButton: {
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: authColors.borderStrong,
    backgroundColor: authColors.field,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 22,
  },
  selectButtonFilled: {
    borderColor: 'rgba(255,184,0,0.48)',
  },
  selectText: {
    flex: 1,
    color: authColors.text,
    fontSize: 20,
    lineHeight: 26,
  },
  selectPlaceholder: {
    color: 'rgba(255,255,255,0.56)',
  },
  continueButton: {
    minHeight: 66,
    marginTop: 12,
    backgroundColor: authColors.primary,
  },
  continueText: {
    fontSize: 20,
    color: '#000000',
  },
});
