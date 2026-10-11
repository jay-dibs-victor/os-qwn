import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { AuthActionButton, AuthFlowShell, authColors } from '@/ui/AuthFlow';

export default function ProfileStepTwoScreen() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [usernameFocused, setUsernameFocused] = useState(false);

  const fallbackUsername = useMemo(() => user?.username || user?.email?.split('@')?.[0] || '', [user]);

  const setPickedAvatar = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatar(result.assets[0].uri);
    }
  };

  const takeSelfie = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Please allow camera access to take a selfie.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      cameraType: ImagePicker.CameraType.front,
    });

    setPickedAvatar(result);
  };

  const uploadAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Please allow photo access to upload from your phone.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    setPickedAvatar(result);
  };

  const completeProfile = () => {
    router.push('/(auth)/profile-saved');
  };

  return (
    <AuthFlowShell
      title="Set up your profile"
      subtitle="Finish with a profile image and username."
      contentStyle={styles.shellContent}
      scroll
    >
      <View style={styles.progressCard}>
        <View style={styles.stepPill}>
          <Text style={styles.stepPillText}>Step 2 of 2</Text>
        </View>
        <Text style={styles.progressTitle}>Public profile</Text>
        <Text style={styles.progressCopy}>A clear photo and simple username help people recognize you quickly.</Text>
      </View>

      <View style={styles.profileCard}>
        <Pressable style={({ pressed }) => [styles.avatarWrap, pressed && styles.pressed]} onPress={takeSelfie}>
          <View style={styles.avatar}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="camera-outline" size={50} color="rgba(255,255,255,0.58)" />
            )}
          </View>
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={22} color="#111111" />
          </View>
        </Pressable>
        <Text style={styles.avatarLabel}>Profile picture</Text>
        <Text style={styles.avatarHint}>Take a fresh selfie or upload an existing photo.</Text>

        <View style={styles.photoActions}>
          <Pressable style={({ pressed }) => [styles.photoAction, pressed && styles.pressed]} onPress={takeSelfie}>
            <View style={styles.photoActionIcon}>
              <Ionicons name="camera-outline" size={21} color="#111111" />
            </View>
            <Text numberOfLines={1} adjustsFontSizeToFit style={styles.photoActionText}>Selfie</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.photoAction, pressed && styles.pressed]} onPress={uploadAvatar}>
            <View style={styles.photoActionIcon}>
              <Ionicons name="image-outline" size={21} color="#111111" />
            </View>
            <Text numberOfLines={1} adjustsFontSizeToFit style={styles.photoActionText}>Upload</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Username</Text>
        <View style={[styles.usernameFrame, usernameFocused && styles.usernameFrameFocused]} collapsable={false}>
          <Text style={styles.usernamePrefix}>@</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder={fallbackUsername || 'yourusername'}
            placeholderTextColor="rgba(255,255,255,0.46)"
            autoCapitalize="none"
            onFocus={() => setUsernameFocused(true)}
            onBlur={() => setUsernameFocused(false)}
            style={styles.usernameInput}
            collapsable={false}
          />
        </View>
      </View>

      <View style={styles.spacer} />

      <AuthActionButton
        variant="primary"
        onPress={completeProfile}
        style={styles.completeButton}
        textStyle={styles.completeText}
      >
        Complete Profile
      </AuthActionButton>
    </AuthFlowShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingBottom: 34,
  },
  avatarWrap: {
    alignSelf: 'center',
  },
  avatar: {
    width: 138,
    height: 138,
    borderRadius: 69,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    right: 4,
    bottom: 8,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: authColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: authColors.bg,
  },
  avatarLabel: {
    color: authColors.text,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 16,
  },
  avatarHint: {
    color: authColors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 18,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  photoAction: {
    flex: 1,
    minWidth: 0,
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.26)',
    backgroundColor: '#242424',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  photoActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: authColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActionText: {
    color: authColors.text,
    fontSize: 16,
    fontWeight: '900',
    maxWidth: 86,
  },
  progressCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#000000',
    padding: 18,
    marginBottom: 24,
  },
  usernameFrame: {
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  photoAction: {
    flex: 1,
    minWidth: 0,
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.26)',
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  avatar: {
    width: 138,
    height: 138,
    borderRadius: 69,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
  profileCard: {
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  label: {
    color: authColors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 12,
  },
  usernameFrame: {
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  usernameFrameFocused: {
    borderColor: authColors.primary,
    shadowColor: authColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    boxShadow: '0px 0px 10px authColors.primary',
    elevation: 2,
  },
  usernamePrefix: {
    color: authColors.primary,
    fontSize: 22,
    fontWeight: '900',
    marginRight: 2,
  },
  usernameInput: {
    flex: 1,
    color: authColors.text,
    fontSize: 19,
    lineHeight: 25,
    paddingHorizontal: 8,
    backgroundColor: '#000000',
  },
  spacer: {
    height: 64,
  },
  completeButton: {
    minHeight: 66,
    width: '100%',
    backgroundColor: authColors.primary,
  },
  completeText: {
    fontSize: 18,
    color: '#000000',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
