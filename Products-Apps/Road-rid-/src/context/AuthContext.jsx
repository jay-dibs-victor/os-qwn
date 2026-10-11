import { createContext, useContext, useState } from 'react';
import { useAuthStore } from '../core/store/useAuthStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storeUser = useAuthStore((state) => state.user);
  const storeToken = useAuthStore((state) => state.token);
  const storeLogin = useAuthStore((state) => state.login);
  const storeLogout = useAuthStore((state) => state.logout);
  const storeRegister = useAuthStore((state) => state.register);

  const isLoggedIn = !!storeToken && !!storeUser;

  const [onboardingData, setOnboardingData] = useState(JSON.parse(localStorage.getItem('onboardingData')) || {});

  const login = async (credentials) => {
    return await storeLogin(credentials);
  };

  const register = async (userData) => {
    return await storeRegister(userData);
  };

  const logout = () => {
    storeLogout();
    localStorage.removeItem('onboardingData');
    setOnboardingData({});
  };

  const updateOnboardingData = (data) => {
    const newData = { ...onboardingData, ...data };
    setOnboardingData(newData);
    localStorage.setItem('onboardingData', JSON.stringify(newData));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user: storeUser, token: storeToken, login, register, logout, onboardingData, updateOnboardingData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
