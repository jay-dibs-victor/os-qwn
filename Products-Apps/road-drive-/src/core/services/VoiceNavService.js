/**
 * VoiceNavService — taxibooking-userapp
 * Uses Web Speech API for real-time driver/user notifications.
 */
export const VoiceNavService = {
  speak: (text) => {
    if (!window.speechSynthesis) return;

    // Use a queue to prevent overlapping speech
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Samantha'));
    if (premiumVoice) utterance.voice = premiumVoice;

    utterance.pitch = 1.0;
    utterance.rate = 1.1;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  },

  announceManeuver: (instruction, distance) => {
    // Sanitizing HTML instructions from Google API
    const cleanInstruction = instruction.replace(/<[^>]*>?/gm, '');
    const text = distance 
      ? `In ${distance}, ${cleanInstruction}`
      : `${cleanInstruction}`;
    
    VoiceNavService.speak(text);
  },

  alertTraffic: (delayMins) => {
    VoiceNavService.speak(`Traffic jam ahead. Expected delay of ${delayMins} minutes. Calculating optimal bypass.`);
  },

  alertSafetyImmobile: () => {
    VoiceNavService.speak('Immobility threshold exceeded. Checking your status. Please confirm your safety or press SOS.');
  },

  announceArrival: (destination) => {
    VoiceNavService.speak(`Approaching destination: ${destination}. Preparing for trip completion.`);
  }
};
