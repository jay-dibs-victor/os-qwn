import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SettingsList, { SETTINGS_GROUPS, SettingsItem } from '../../../src/components/driver/settings/SettingsList';

export default function SettingsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SETTINGS</Text>
          <Text style={styles.title}>Preferences</Text>
        </View>
        <SettingsList
          groups={SETTINGS_GROUPS}
          onPressItem={(item: SettingsItem) => {
            if (item.route) router.push(item.route as never);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scroll: {
    paddingBottom: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  eyebrow: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    color: '#0F1A2B',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
});
