// expo-router handles root registration via "main": "expo-router/entry" in package.json.
// Do NOT call registerRootComponent here — it conflicts with expo-router's own entry
// and causes a "Something went wrong" crash on device.
import 'expo-router/entry';
