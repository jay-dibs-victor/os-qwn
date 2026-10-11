import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [onboardingData, setOnboardingData] = useState(JSON.parse(localStorage.getItem('onboardingData')) || {});

  const login = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('onboardingData');
    setIsLoggedIn(false);
    setOnboardingData({});
  };

  const updateOnboardingData = (data) => {
    const newData = { ...onboardingData, ...data };
    setOnboardingData(newData);
    localStorage.setItem('onboardingData', JSON.stringify(newData));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, onboardingData, updateOnboardingData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
