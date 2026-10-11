import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { WalletProvider } from './contexts/WalletContext';
import { RideProvider } from './contexts/RideContext';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import OTPScreen from './screens/OTPScreen';
import RegisterScreen from './screens/RegisterScreen';
import CardSetupScreen from './screens/CardSetupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import WalletScreen from './screens/WalletScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SupportScreen from './screens/SupportScreen';
import DisputeResolutionScreen from './screens/DisputeResolutionScreen';
import TripHistoryScreen from './screens/TripHistoryScreen';
import IncidentReportScreen from './screens/IncidentReportScreen';
import SavedPlacesScreen from './screens/SavedPlacesScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <WalletProvider>
          <RideProvider>
            <SafeAreaProvider>
              <NavigationContainer>
                <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="Splash" component={SplashScreen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="OTP" component={OTPScreen} />
                  <Stack.Screen name="Register" component={RegisterScreen} />
                  <Stack.Screen name="CardSetup" component={CardSetupScreen} />
                  <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                  <Stack.Screen name="Home" component={HomeScreen} />
                  <Stack.Screen name="Wallet" component={WalletScreen} />
                  <Stack.Screen name="Profile" component={ProfileScreen} />
                  <Stack.Screen name="Settings" component={SettingsScreen} />
                  <Stack.Screen name="Notifications" component={NotificationsScreen} />
                  <Stack.Screen name="Support" component={SupportScreen} />
                  <Stack.Screen name="DisputeResolution" component={DisputeResolutionScreen} />
                  <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
                  <Stack.Screen name="IncidentReport" component={IncidentReportScreen} />
                  <Stack.Screen name="SavedPlaces" component={SavedPlacesScreen} />
                  <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                </Stack.Navigator>
              </NavigationContainer>
            </SafeAreaProvider>
          </RideProvider>
        </WalletProvider>
      </UserProvider>
    </AuthProvider>
  );
}
