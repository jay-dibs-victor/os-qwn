export const playCoinSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const context = new AudioContext();
      const osc = context.createOscillator();
      const gainNode = context.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(context.destination);
      
      // Coin sound shape (mario-esque jump in frequency)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, context.currentTime); // B5
      osc.frequency.setValueAtTime(1318.51, context.currentTime + 0.08); // E6
      
      // Gain envelope
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
      
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 0.3);
    } catch(e) {
      console.error('Audio playback failed', e);
    }
  };
