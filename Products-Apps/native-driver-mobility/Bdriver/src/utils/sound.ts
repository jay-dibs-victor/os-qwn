export const playSuccessChime = () => {
  if (typeof window !== 'undefined' && window.AudioContext) {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play a simple success sequence
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gainNode.gain.setValueAtTime(0.2, startTime + duration - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;
    playNote(659.25, now, 0.1); // E5
    playNote(783.99, now + 0.1, 0.3); // G5
  }
};
