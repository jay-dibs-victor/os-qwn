import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SESSION: 'user_session',
  PROFILE: 'user_profile',
  WALLET: 'user_wallet',
  SETTINGS: 'user_settings',
};

export const storage = {
  async saveSession(token, user) {
    await AsyncStorage.setItem(KEYS.SESSION, JSON.stringify({ token, user, timestamp: Date.now() }));
  },
  async getSession() {
    try {
      const data = await AsyncStorage.getItem(KEYS.SESSION);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },
  async clearSession() {
    await AsyncStorage.removeItem(KEYS.SESSION);
  },

  async saveProfile(profile) {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },
  async getProfile() {
    try {
      const data = await AsyncStorage.getItem(KEYS.PROFILE);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },

  async saveWallet(wallet) {
    await AsyncStorage.setItem(KEYS.WALLET, JSON.stringify(wallet));
  },
  async getWallet() {
    try {
      const data = await AsyncStorage.getItem(KEYS.WALLET);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },

  async saveSettings(settings) {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },
  async getSettings() {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },

  async hasCardSetup() {
    try {
      const data = await AsyncStorage.getItem('@queens:card_setup_complete');
      return data === 'true';
    } catch { return false; }
  },
  async setCardSetupComplete() {
    await AsyncStorage.setItem('@queens:card_setup_complete', 'true');
  },

  async getSavedPlaces() {
    try {
      const data = await AsyncStorage.getItem('@queens:saved_places');
      return data ? JSON.parse(data) : [
        { id: 'home', label: 'Home', location: 'Lekki Phase 1, Lagos' },
        { id: 'work', label: 'Work', location: 'Victoria Island, Lagos' },
      ];
    } catch {
      return [
        { id: 'home', label: 'Home', location: 'Lekki Phase 1, Lagos' },
        { id: 'work', label: 'Work', location: 'Victoria Island, Lagos' },
      ];
    }
  },
  async saveSavedPlaces(places) {
    await AsyncStorage.setItem('@queens:saved_places', JSON.stringify(places));
  },
};
