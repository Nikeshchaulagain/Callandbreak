// Procedural Audio Synthesizer using Web Audio API for CallBreak sound effects.
// All sounds are synthesized dynamically, ensuring zero external asset dependencies
// and perfect offline support.

let audioCtx: AudioContext | null = null;
let isMute = false;

// Initialize mute state from localStorage
try {
  const storedMute = localStorage.getItem('sound_muted');
  if (storedMute !== null) {
    isMute = storedMute === 'true';
  }
} catch (e) {
  console.warn('Failed to read sound mute setting from localStorage:', e);
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioCtx) {
    // Standard AudioContext initialization
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  
  // Resume context if suspended (browser autoplay policy security)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch((err) => {
      console.warn('Failed to resume AudioContext:', err);
    });
  }
  
  return audioCtx;
}

export const audioSystem = {
  isMuted: () => isMute,
  
  toggleMuted: (): boolean => {
    isMute = !isMute;
    try {
      localStorage.setItem('sound_muted', String(isMute));
    } catch (e) {
      console.warn('Failed to write sound mute setting to localStorage:', e);
    }
    return isMute;
  },

  // A ultra-short subtle high-pitched clicking sound for general action buttons.
  playClick: () => {
    const ctx = getAudioContext();
    if (!ctx || isMute) return;
    
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
      
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn('Playback error:', e);
    }
  },

  // A crisp tactile bubble pop/tap for score/bid/trick entry updates.
  playScoreChange: () => {
    const ctx = getAudioContext();
    if (!ctx || isMute) return;
    
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.06);
      
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      console.warn('Playback error:', e);
    }
  },

  // A premium harmonic double-ping sound played when successfully locking/saving a round.
  playSuccess: () => {
    const ctx = getAudioContext();
    if (!ctx || isMute) return;
    
    try {
      const now = ctx.currentTime;
      
      // Tone 1: C5 to E5 pitch bend (ascending)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.16); // E5
      gain1.gain.setValueAtTime(0.06, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.16);

      // Tone 2: slightly delayed, E5 to G5 pitch bend (harmony)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.24); // G5
      gain2.gain.setValueAtTime(0.06, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.24);
    } catch (e) {
      console.warn('Playback error:', e);
    }
  },

  // A rich and warm major-chord arpeggio celebration sound played when the winner is declared.
  playCelebration: () => {
    const ctx = getAudioContext();
    if (!ctx || isMute) return;
    
    try {
      const now = ctx.currentTime;
      // C5, E5, G5, C6 notes in a cheerful arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50];
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteDelay = idx * 0.08;
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + noteDelay);
        
        gain.gain.setValueAtTime(0.0, now + noteDelay);
        gain.gain.linearRampToValueAtTime(0.05, now + noteDelay + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + noteDelay + 0.35);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + noteDelay);
        osc.stop(now + noteDelay + 0.35);
      });
    } catch (e) {
      console.warn('Playback error:', e);
    }
  }
};
