/**
 * SoundService — queens-userapp
 */

const COIN_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/911/911-preview.mp3';
const CALL_BEEP_URL = 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3';

class SoundService {
  constructor() {
    this.coinAudio = typeof Audio !== 'undefined' ? new Audio(COIN_SOUND_URL) : null;
    this.callBeepAudio = typeof Audio !== 'undefined' ? new Audio(CALL_BEEP_URL) : null;
    
    if (this.coinAudio) this.coinAudio.load();
    if (this.callBeepAudio) {
      this.callBeepAudio.load();
      this.callBeepAudio.loop = true;
    }
  }

  playCoin() {
    if (!this.coinAudio) return;
    this.coinAudio.currentTime = 0;
    this.coinAudio.play().catch(e => console.warn('Audio play failed:', e));
  }

  playCallBeep() {
    if (!this.callBeepAudio) return;
    this.callBeepAudio.play().catch(e => console.warn('Audio play failed:', e));
  }

  stopCallBeep() {
    if (!this.callBeepAudio) return;
    this.callBeepAudio.pause();
    this.callBeepAudio.currentTime = 0;
  }
}

export const soundService = new SoundService();
