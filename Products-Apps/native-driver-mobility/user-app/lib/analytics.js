const logEvent = (eventName, properties = {}) => {
  const event = {
    event: eventName,
    properties,
    timestamp: new Date().toISOString(),
  };
  if (__DEV__) {
    console.log('[Analytics]', JSON.stringify(event));
  }
};

export const analytics = {
  trackScreen: (screenName) => {
    logEvent('screen_view', { screen: screenName });
  },

  trackAction: (action, properties = {}) => {
    logEvent(action, properties);
  },
};
