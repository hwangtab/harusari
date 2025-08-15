// Audio utility functions for retro sound effects

export const createNoiseBuffer = (audioContext: AudioContext, duration: number = 0.5): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate white noise
  for (let i = 0; i < frameCount; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3; // Volume at 30%
  }

  return buffer;
};

export const createGlitchBuffer = (audioContext: AudioContext, duration: number = 0.3): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate glitchy digital noise
  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    const freq = 100 + Math.sin(t * 50) * 200; // Varying frequency
    const glitch = Math.random() > 0.7 ? (Math.random() * 2 - 1) : 0; // Random glitches
    data[i] = (Math.sin(t * freq * 2 * Math.PI) * 0.2) + (glitch * 0.1);
  }

  return buffer;
};

export const playTrashSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as typeof AudioContext))();
    const buffer = createNoiseBuffer(audioContext, 0.2);
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = buffer;
    
    // Quick fade in/out to prevent clicks
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.19);
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    source.start();
    source.stop(audioContext.currentTime + 0.2);
    
  } catch {
    console.log('Audio not supported or blocked by browser policy');
  }
};

export const playGlitchSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as typeof AudioContext))();
    const buffer = createGlitchBuffer(audioContext, 0.15);
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = buffer;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.14);
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    source.start();
    source.stop(audioContext.currentTime + 0.15);
    
  } catch {
    console.log('Audio not supported or blocked by browser policy');
  }
};

// Guitar tuning frequencies (standard tuning)
export const guitarStrings = {
  'E6': { note: 'E', frequency: 82.41, string: 6 },  // Low E (6th string)
  'A5': { note: 'A', frequency: 110.00, string: 5 }, // A (5th string)
  'D4': { note: 'D', frequency: 146.83, string: 4 }, // D (4th string)
  'G3': { note: 'G', frequency: 196.00, string: 3 }, // G (3rd string)
  'B2': { note: 'B', frequency: 246.94, string: 2 }, // B (2nd string)
  'E1': { note: 'E', frequency: 329.63, string: 1 }  // High E (1st string)
};

export const createGuitarToneBuffer = (
  audioContext: AudioContext, 
  frequency: number, 
  duration: number = 2.5
): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate guitar-like tone with harmonics
  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    
    // Fundamental frequency
    let sample = Math.sin(t * frequency * 2 * Math.PI) * 0.4;
    
    // Add harmonics for richer guitar-like sound
    sample += Math.sin(t * frequency * 2 * 2 * Math.PI) * 0.2; // 2nd harmonic
    sample += Math.sin(t * frequency * 3 * 2 * Math.PI) * 0.1; // 3rd harmonic
    sample += Math.sin(t * frequency * 4 * 2 * Math.PI) * 0.05; // 4th harmonic
    
    // Envelope: quick attack, sustain, slow decay
    let envelope = 1;
    if (t < 0.05) {
      envelope = t / 0.05; // Attack
    } else if (t > duration - 0.5) {
      envelope = (duration - t) / 0.5; // Decay
    }
    
    // Add slight vibrato for realism
    const vibrato = 1 + Math.sin(t * 6 * 2 * Math.PI) * 0.02;
    
    data[i] = sample * envelope * vibrato * 0.3; // Overall volume at 30%
  }

  return buffer;
};

export const playGuitarString = (stringKey: keyof typeof guitarStrings, volume: number = 0.3) => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as typeof AudioContext))();
    const stringInfo = guitarStrings[stringKey];
    const buffer = createGuitarToneBuffer(audioContext, stringInfo.frequency, 2.5);
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = buffer;
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, audioContext.currentTime + 2.0);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2.5);
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    source.start();
    source.stop(audioContext.currentTime + 2.5);
    
  } catch {
    console.log('Audio not supported or blocked by browser policy');
  }
};