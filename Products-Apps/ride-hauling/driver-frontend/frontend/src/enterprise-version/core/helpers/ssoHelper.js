/**
 * ssoHelper — queens-driverapp
 * Handles secure session sharing between applications.
 */
import Cookies from 'js-cookie';

export const decryptPayload = (encodedData) => {
  try {
    const jsonString = decodeURIComponent(escape(atob(encodedData)));
    const data = JSON.parse(jsonString);
    
    // Safety check: 5-minute expiry for the handover payload
    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - data.timestamp > fiveMinutes) {
      console.warn('SSO Payload expired');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('SSO Decryption Error:', error);
    return null;
  }
};

export const getSSOCookie = () => {
  return Cookies.get('goom_sso_session');
};

export const clearSSOSession = () => {
    Cookies.remove('goom_sso_session', { path: '/' });
}
