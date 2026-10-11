/**
 * ssoHelper — taxibooking-userapp
 * Handles secure session sharing between applications.
 */
import Cookies from 'js-cookie';

export const encryptPayload = (data) => {
  try {
    const jsonString = JSON.stringify({
      ...data,
      timestamp: Date.now(),
    });
    // For this implementation, we use Base64 as the transport encoding
    // In production, this should ideally be integrated with a proper encryption lib
    return btoa(unescape(encodeURIComponent(jsonString)));
  } catch (error) {
    console.error('SSO Encryption Error:', error);
    return null;
  }
};

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

export const setSSOCookie = (token, user) => {
  // Set shared cookie for the domain
  // Using localhost-friendly settings
  Cookies.set('goom_sso_session', token, { 
    expires: 1, 
    path: '/',
    sameSite: 'Lax'
  });
};

export const clearSSOSession = () => {
    Cookies.remove('goom_sso_session', { path: '/' });
}
