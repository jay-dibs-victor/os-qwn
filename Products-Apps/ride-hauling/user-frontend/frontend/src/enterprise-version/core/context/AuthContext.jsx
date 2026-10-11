import { createContext, useContext, useState } from 'react';

const SampleContext = createContext();

export const SampleProvider = ({ children }) => {
    // const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
    const [onboardingData, setOnboardingData] = useState(JSON.parse(localStorage.getItem('onboardingData')) || {});

    // const login = () => {
    //     localStorage.setItem('isLoggedIn', 'true');
    //     setIsLoggedIn(true);
    // };

    // const logout = () => {
    //     localStorage.removeItem('isLoggedIn');
    //     localStorage.removeItem('onboardingData');
    //     setIsLoggedIn(false);
    //     setOnboardingData({});
    // };

    const updateOnboardingData = (data) => {
        const newData = { ...onboardingData, ...data };
        setOnboardingData(newData);
        localStorage.setItem('onboardingData', JSON.stringify(newData));
    };

    return (
        <SampleContext.Provider value={{   //isLoggedIn, login, logout, 
            onboardingData, updateOnboardingData
        }}>
            {children}
        </SampleContext.Provider>
    );
};

export const useData = () => useContext(SampleContext);