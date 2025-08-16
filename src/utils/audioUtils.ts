// Audio utility functions for retro sound effects

// Audio constants
const SAMPLE_RATES = {
  DEFAULT: 44100
} as const;

const VOLUMES = {
  LOW: 0.6,
  MEDIUM: 0.75,
  HIGH: 0.9
} as const;

const DURATIONS = {
  VERY_SHORT: 0.12,
  SHORT: 0.15,
  MEDIUM_SHORT: 0.2,
  MEDIUM: 0.25,
  MEDIUM_LONG: 0.3,
  LONG: 0.35,
  VERY_LONG: 0.4
} as const;

// Musical frequencies (Hz)
const FREQUENCIES = {
  // C Major Scale
  C4: 261.63,
  E4: 329.63,
  G4: 392.00,
  C5: 523.25,
  E5: 659.25,
  G5: 783.99,
  // Guitar strings (standard tuning)
  E2: 82.41,   // Low E (6th string)
  A2: 110.00,  // A (5th string)
  D3: 146.83,  // D (4th string)
  G3: 196.00,  // G (3rd string)
  B3: 246.94,  // B (2nd string)
  E4: 329.63   // High E (1st string)
} as const;

/**
 * Creates a cross-browser compatible AudioContext
 * @returns AudioContext instance
 * @throws Error if Web Audio API is not supported
 */
const createAudioContext = (): AudioContext => {
  const AudioContextClass = window.AudioContext || 
                           (window as any).webkitAudioContext || 
                           (window as any).mozAudioContext;
  if (!AudioContextClass) {
    throw new Error('Web Audio API not supported');
  }
  return new AudioContextClass();
};

/**
 * Generic sound player with consistent envelope and error handling
 * @param createBuffer Function that creates the audio buffer
 * @param volume Volume level (0-1)
 * @param duration Duration in seconds
 */
const playSound = (
  createBuffer: (ctx: AudioContext) => AudioBuffer, 
  volume: number = VOLUMES.MEDIUM,
  duration?: number
) => {
  try {
    const audioContext = createAudioContext();
    const buffer = createBuffer(audioContext);
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = buffer;
    
    // Calculate actual duration from buffer if not provided
    const actualDuration = duration || buffer.duration;
    
    // Smooth envelope to prevent clicks
    const attackTime = 0.01;
    const releaseTime = Math.min(0.05, actualDuration * 0.1);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + attackTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.8, audioContext.currentTime + actualDuration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + actualDuration);
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    source.start();
    source.stop(audioContext.currentTime + actualDuration);
    
  } catch (error) {
    console.log('Audio not supported or blocked by browser policy:', error);
  }
};

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

// Icon-specific sound effects

/**
 * Creates a retro 8-bit melody sound buffer (C-E-G chord progression)
 * @param audioContext The audio context
 * @param duration Duration in seconds
 * @returns AudioBuffer containing the melody
 */
export const createMelodyBuffer = (audioContext: AudioContext, duration: number = DURATIONS.VERY_LONG): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  // C-E-G chord progression using constants
  const frequencies = [FREQUENCIES.C4, FREQUENCIES.E4, FREQUENCIES.G4];
  const noteDuration = duration / frequencies.length;

  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    const noteIndex = Math.floor(t / noteDuration);
    const freq = frequencies[noteIndex] || frequencies[frequencies.length - 1];
    
    // Enhanced 8-bit style with square wave and subtle harmonics
    const fundamental = Math.sin(t * freq * 2 * Math.PI) > 0 ? 1 : -1;
    const harmonic = Math.sin(t * freq * 4 * Math.PI) > 0 ? 0.3 : -0.3; // Octave harmonic
    
    // Per-note envelope
    const noteTime = t % noteDuration;
    let envelope = 1;
    const attackTime = 0.02;
    const releaseTime = 0.05;
    
    if (noteTime < attackTime) {
      envelope = noteTime / attackTime;
    } else if (noteTime > noteDuration - releaseTime) {
      envelope = (noteDuration - noteTime) / releaseTime;
    }
    
    // Combine fundamental and harmonic
    data[i] = (fundamental * 0.8 + harmonic * 0.2) * envelope * 0.15;
  }

  return buffer;
};

/**
 * Creates a realistic crayon scratching sound buffer
 * @param audioContext The audio context
 * @param duration Duration in seconds
 * @returns AudioBuffer containing the scratch sound
 */
export const createScratchBuffer = (audioContext: AudioContext, duration: number = DURATIONS.MEDIUM): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    
    // Multi-layered scratch texture
    const baseNoise = (Math.random() * 2 - 1);
    
    // Primary scratch frequency (varies for realistic texture)
    const scratchFreq = 1800 + Math.sin(t * 25) * 600 + Math.cos(t * 15) * 200;
    const primaryTexture = Math.sin(t * scratchFreq * 2 * Math.PI);
    
    // Secondary high-frequency texture for paper grain
    const grainFreq = 3500 + Math.sin(t * 40) * 800;
    const grainTexture = Math.sin(t * grainFreq * 2 * Math.PI) * 0.4;
    
    // Irregular scratching pattern
    const irregularity = Math.sin(t * 8) * Math.cos(t * 12) * 0.3;
    
    // Dynamic envelope for more natural feel
    const baseDecay = Math.exp(-t * 6);
    const modulation = 1 + Math.sin(t * 20) * 0.2; // Slight amplitude variation
    const envelope = baseDecay * modulation;
    
    // Combine all elements
    const scratch = (
      baseNoise * 0.3 +
      primaryTexture * 0.5 +
      grainTexture * 0.3 +
      irregularity * 0.2
    ) * envelope;
    
    data[i] = scratch * 0.25;
  }

  return buffer;
};

/**
 * Creates a cheerful quiz show bell sound (ascending C-E-G progression)
 * @param audioContext The audio context
 * @param duration Duration in seconds
 * @returns AudioBuffer containing the quiz bell sound
 */
export const createQuizBuffer = (audioContext: AudioContext, duration: number = DURATIONS.MEDIUM_LONG): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  // Ascending bell progression using constants
  const frequencies = [FREQUENCIES.C5, FREQUENCIES.E5, FREQUENCIES.G5];
  
  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    let sample = 0;
    
    frequencies.forEach((freq, index) => {
      const delay = index * 0.08; // Staggered bell chimes
      if (t >= delay) {
        const noteTime = t - delay;
        
        // Enhanced bell sound with harmonics
        const fundamental = Math.sin(noteTime * freq * 2 * Math.PI);
        const harmonic2 = Math.sin(noteTime * freq * 3 * 2 * Math.PI) * 0.3;
        const harmonic3 = Math.sin(noteTime * freq * 5 * 2 * Math.PI) * 0.15;
        
        // Bell-like decay envelope
        const envelope = Math.exp(-noteTime * 5) * (1 + Math.cos(noteTime * freq * 0.1) * 0.1);
        
        sample += (fundamental + harmonic2 + harmonic3) * envelope * 0.25;
      }
    });
    
    data[i] = sample * 0.2;
  }

  return buffer;
};

/**
 * Creates a realistic camera shutter click sound
 * @param audioContext The audio context
 * @param duration Duration in seconds
 * @returns AudioBuffer containing the shutter sound
 */
export const createShutterBuffer = (audioContext: AudioContext, duration: number = DURATIONS.SHORT): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    
    // Two-phase shutter mechanism
    let sample = 0;
    
    // Initial sharp click (shutter opening)
    if (t < 0.02) {
      const clickNoise = (Math.random() * 2 - 1) * Math.exp(-t * 50);
      const clickTone = Math.sin(t * 1200 * 2 * Math.PI) * Math.exp(-t * 30);
      sample += (clickNoise * 0.6 + clickTone * 0.4) * 2;
    }
    
    // Secondary click (shutter closing) - slightly delayed and softer
    if (t > 0.04 && t < 0.08) {
      const delayedT = t - 0.04;
      const secondClick = (Math.random() * 2 - 1) * Math.exp(-delayedT * 40) * 0.7;
      const secondTone = Math.sin(delayedT * 900 * 2 * Math.PI) * Math.exp(-delayedT * 25) * 0.5;
      sample += secondClick * 0.5 + secondTone * 0.3;
    }
    
    // Mechanical resonance (mirror flip mechanism)
    const resonance = Math.sin(t * 180 * 2 * Math.PI) * Math.exp(-t * 15) * 0.2;
    sample += resonance;
    
    // Overall envelope
    const envelope = Math.exp(-t * 12);
    data[i] = sample * envelope * 0.25;
  }

  return buffer;
};

/**
 * Creates a natural paper page flip sound
 * @param audioContext The audio context
 * @param duration Duration in seconds
 * @returns AudioBuffer containing the page flip sound
 */
export const createPageFlipBuffer = (audioContext: AudioContext, duration: number = DURATIONS.MEDIUM_SHORT): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    
    // Multi-frequency paper rustle
    const baseNoise = (Math.random() * 2 - 1);
    
    // Primary rustle (mid-high frequency)
    const primaryRustle = Math.sin(t * 6000 * 2 * Math.PI) * (Math.random() * 0.5 + 0.5);
    
    // Secondary rustle (higher frequency for texture)
    const secondaryRustle = Math.sin(t * 9000 * 2 * Math.PI) * (Math.random() * 0.3 + 0.3);
    
    // Low-frequency paper body resonance
    const bodyResonance = Math.sin(t * 200 * 2 * Math.PI) * Math.exp(-t * 8) * 0.3;
    
    // Three-phase envelope for realistic page turn
    let envelope;
    if (t < 0.03) {
      // Initial lift/bend
      envelope = (t / 0.03) * 0.6;
    } else if (t < 0.08) {
      // Main flip motion
      envelope = 0.6 + ((t - 0.03) / 0.05) * 0.4; // Peak intensity
    } else {
      // Settle down
      envelope = Math.exp(-(t - 0.08) * 12);
    }
    
    // Add slight flutter effect
    const flutter = 1 + Math.sin(t * 60) * 0.1;
    
    // Combine all elements
    const paperSound = (
      baseNoise * 0.4 +
      primaryRustle * 0.4 +
      secondaryRustle * 0.2 +
      bodyResonance * 0.3
    ) * envelope * flutter;
    
    data[i] = paperSound * 0.15;
  }

  return buffer;
};

/**
 * Creates a realistic guitar strum sound with enhanced harmonics
 * @param audioContext The audio context
 * @param duration Duration in seconds
 * @returns AudioBuffer containing the guitar strum
 */
export const createStrumBuffer = (audioContext: AudioContext, duration: number = DURATIONS.LONG): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  // E-A-D chord using frequency constants
  const chordFreqs = [FREQUENCIES.E2, FREQUENCIES.A2, FREQUENCIES.D3];
  
  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    let sample = 0;
    
    chordFreqs.forEach((freq, index) => {
      const stringDelay = index * 0.015; // Slight stagger for realism
      if (t >= stringDelay) {
        const stringTime = t - stringDelay;
        
        // Enhanced guitar string model with multiple harmonics
        const fundamental = Math.sin(stringTime * freq * 2 * Math.PI);
        const harmonic2 = Math.sin(stringTime * freq * 2 * 2 * Math.PI) * 0.4;
        const harmonic3 = Math.sin(stringTime * freq * 3 * 2 * Math.PI) * 0.2;
        const harmonic4 = Math.sin(stringTime * freq * 4 * 2 * Math.PI) * 0.1;
        const harmonic5 = Math.sin(stringTime * freq * 5 * 2 * Math.PI) * 0.05;
        
        // Realistic guitar envelope (sharp attack, sustain, decay)
        let envelope;
        if (stringTime < 0.005) {
          envelope = stringTime / 0.005; // Very quick attack
        } else if (stringTime < 0.1) {
          envelope = 1.0; // Brief sustain
        } else {
          envelope = Math.exp(-(stringTime - 0.1) * 3); // Natural decay
        }
        
        // Add subtle vibrato for realism
        const vibrato = 1 + Math.sin(stringTime * 6 * 2 * Math.PI) * 0.02;
        
        // Combine harmonics
        const stringSound = (
          fundamental * 1.0 +
          harmonic2 * 0.4 +
          harmonic3 * 0.2 +
          harmonic4 * 0.1 +
          harmonic5 * 0.05
        ) * envelope * vibrato;
        
        // Each string has slightly different characteristics
        const stringCharacter = 1 - (index * 0.1); // Lower strings slightly duller
        sample += stringSound * stringCharacter * 0.3;
      }
    });
    
    data[i] = sample * 0.2;
  }

  return buffer;
};

/**
 * Creates a metallic mailbox opening sound
 * @param audioContext The audio context
 * @param duration Duration in seconds
 * @returns AudioBuffer containing the mailbox sound
 */
export const createMailboxBuffer = (audioContext: AudioContext, duration: number = DURATIONS.MEDIUM): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    
    // Metallic resonance with frequency wobble
    const baseFreq = 220 + Math.sin(t * 8) * 60;
    const metallic = Math.sin(t * baseFreq * 2 * Math.PI);
    
    // Higher frequency harmonics for metallic character
    const harmonic = Math.sin(t * baseFreq * 3.2 * 2 * Math.PI) * 0.4;
    
    // Creaky noise component
    const creakNoise = (Math.random() * 2 - 1) * 0.4;
    
    // Mechanical strain sound (lower frequency)
    const strain = Math.sin(t * 80 * 2 * Math.PI) * Math.exp(-t * 3) * 0.3;
    
    // Two-phase envelope: initial creak then settling
    let envelope;
    if (t < 0.1) {
      envelope = (t / 0.1) * 0.8; // Gradual opening
    } else {
      envelope = 0.8 * Math.exp(-(t - 0.1) * 8); // Quick settle
    }
    
    const mailboxSound = (
      metallic * 0.5 +
      harmonic * 0.3 +
      creakNoise * 0.3 +
      strain * 0.4
    ) * envelope;
    
    data[i] = mailboxSound * 0.18;
  }

  return buffer;
};

/**
 * Creates a bright camera flash pop sound
 * @param audioContext The audio context
 * @param duration Duration in seconds
 * @returns AudioBuffer containing the flash sound
 */
export const createFlashBuffer = (audioContext: AudioContext, duration: number = DURATIONS.VERY_SHORT): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    
    // Layered bright pop sound
    const pop1 = Math.sin(t * 2200 * 2 * Math.PI) * Math.exp(-t * 35);
    const pop2 = Math.sin(t * 3300 * 2 * Math.PI) * Math.exp(-t * 45) * 0.6;
    
    // High-frequency sparkle
    const sparkle1 = Math.sin(t * 5500 * 2 * Math.PI) * Math.exp(-t * 60) * 0.4;
    const sparkle2 = Math.sin(t * 7700 * 2 * Math.PI) * Math.exp(-t * 80) * 0.2;
    
    // Brief electrical discharge simulation
    const discharge = (Math.random() * 2 - 1) * Math.exp(-t * 100) * 0.3;
    
    // Very sharp envelope for flash effect
    const envelope = Math.exp(-t * 25);
    
    const flashSound = (
      pop1 * 0.6 +
      pop2 * 0.4 +
      sparkle1 * 0.3 +
      sparkle2 * 0.2 +
      discharge * 0.2
    ) * envelope;
    
    data[i] = flashSound * 0.2;
  }

  return buffer;
};

// Enhanced play functions using the common playSound helper

/**
 * Plays a retro 8-bit melody sound (C-E-G progression)
 */
export const playMelodySound = () => {
  playSound(createMelodyBuffer, VOLUMES.MEDIUM, DURATIONS.VERY_LONG);
};

/**
 * Plays a realistic crayon scratching sound
 */
export const playScratchSound = () => {
  playSound(createScratchBuffer, VOLUMES.MEDIUM, DURATIONS.MEDIUM);
};

/**
 * Plays a cheerful quiz show bell sound
 */
export const playQuizSound = () => {
  playSound(createQuizBuffer, VOLUMES.HIGH, DURATIONS.MEDIUM_LONG);
};

/**
 * Plays a realistic camera shutter click
 */
export const playShutterSound = () => {
  playSound(createShutterBuffer, VOLUMES.HIGH, DURATIONS.SHORT);
};

/**
 * Plays a natural paper page flip sound
 */
export const playPageFlipSound = () => {
  playSound(createPageFlipBuffer, VOLUMES.MEDIUM, DURATIONS.MEDIUM_SHORT);
};

/**
 * Plays a rich guitar strum with harmonics
 */
export const playStrumSound = () => {
  playSound(createStrumBuffer, VOLUMES.MEDIUM, DURATIONS.LONG);
};

/**
 * Plays a metallic mailbox opening sound
 */
export const playMailboxSound = () => {
  playSound(createMailboxBuffer, VOLUMES.MEDIUM, DURATIONS.MEDIUM);
};

/**
 * Plays a bright camera flash pop sound
 */
export const playFlashSound = () => {
  playSound(createFlashBuffer, VOLUMES.HIGH, DURATIONS.VERY_SHORT);
};

// Cat meow sound generation for metronome

// Cat emotional states for enhanced expressiveness
export type CatEmotion = 'happy' | 'sleepy' | 'playful' | 'affectionate' | 'neutral';

/**
 * Creates a realistic cat meow sound buffer with natural frequency modulation
 * @param audioContext The audio context
 * @param pitch Pitch variation: 'kitten' (high), 'adult' (medium), 'large' (low)
 * @param isAccent Whether this is an accented first beat
 * @param duration Duration in seconds
 * @returns AudioBuffer containing the cat meow
 */
export const createCatMeowBuffer = (
  audioContext: AudioContext, 
  pitch: 'kitten' | 'adult' | 'large' = 'adult',
  isAccent: boolean = false,
  duration: number = DURATIONS.MEDIUM,
  emotion: CatEmotion = 'neutral'
): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  // Enhanced base frequencies for cuter cat sounds
  const baseFreqs = {
    kitten: { start: 1000, mid: 750, end: 500 },   // Even higher-pitched for cuteness
    adult: { start: 700, mid: 550, end: 350 },     // Slightly higher adult cat
    large: { start: 500, mid: 400, end: 250 }      // Warmer large cat
  };

  const freq = baseFreqs[pitch];
  const accentMultiplier = isAccent ? 1.3 : 1.0; // Accent makes it slightly lower and louder
  
  // Emotional frequency and timing modifications
  const emotionalMods = {
    happy: { freqMult: 1.1, speedMult: 1.2, vibratoMult: 1.5 },
    sleepy: { freqMult: 0.85, speedMult: 0.7, vibratoMult: 0.5 },
    playful: { freqMult: 1.15, speedMult: 1.4, vibratoMult: 2.0 },
    affectionate: { freqMult: 0.95, speedMult: 0.9, vibratoMult: 0.8 },
    neutral: { freqMult: 1.0, speedMult: 1.0, vibratoMult: 1.0 }
  };
  
  const emotionMod = emotionalMods[emotion];

  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    const progress = t / duration;
    
    // Frequency modulation - classic meow pattern with emotional adjustments
    const emotionalProgress = progress * emotionMod.speedMult; // Emotional timing
    let currentFreq;
    if (emotionalProgress < 0.2) {
      // Initial "mya" sound
      currentFreq = freq.start + (freq.mid - freq.start) * (emotionalProgress / 0.2);
    } else if (emotionalProgress < 0.6) {
      // Sustained "aaa" sound
      currentFreq = freq.mid;
    } else {
      // Final "ow" sound
      currentFreq = freq.mid + (freq.end - freq.mid) * ((emotionalProgress - 0.6) / 0.4);
    }
    
    // Apply emotional and accent frequency adjustments
    currentFreq = (currentFreq * emotionMod.freqMult) / accentMultiplier;
    
    // Generate the fundamental tone with enhanced cuteness
    let sample = Math.sin(t * currentFreq * 2 * Math.PI);
    
    // Add harmonics for more realistic and cute cat voice
    sample += Math.sin(t * currentFreq * 2 * 2 * Math.PI) * 0.25;  // 2nd harmonic (slightly reduced)
    sample += Math.sin(t * currentFreq * 3 * 2 * Math.PI) * 0.12;  // 3rd harmonic
    sample += Math.sin(t * currentFreq * 1.5 * 2 * Math.PI) * 0.08; // Sub-harmonic for warmth
    
    // Add cute chirping quality (higher frequency modulation)
    const chirp = Math.sin(t * currentFreq * 4 * 2 * Math.PI) * 0.05;
    sample += chirp;
    
    // Gentle breathiness instead of roughness
    const breathiness = (Math.random() * 2 - 1) * 0.05; // Reduced for cuteness
    sample += breathiness;
    
    // Enhanced amplitude envelope for cuter meow shape
    let envelope;
    if (progress < 0.08) {
      // Softer attack for "m" consonant (more gentle)
      envelope = Math.pow(progress / 0.08, 0.7); // Curved attack
    } else if (progress < 0.25) {
      // Extended peak of "ya" with slight vibrato
      const vibratoEnv = 1 + Math.sin(t * 15 * 2 * Math.PI) * 0.05;
      envelope = 1.0 * vibratoEnv;
    } else if (progress < 0.65) {
      // Sustained "aaa" with cute warble
      const warble = 1 + Math.sin(t * 8 * 2 * Math.PI) * 0.03;
      envelope = 0.85 * warble;
    } else {
      // Smoother decay for "ow" (more graceful ending)
      const fadeProgress = (progress - 0.65) / 0.35;
      envelope = 0.85 * Math.pow(1 - fadeProgress, 1.5); // Curved decay
    }
    
    // Apply accent volume boost
    if (isAccent) {
      envelope *= 1.4;
    }
    
    // Enhanced vibrato and cute modulations with emotional expression
    const baseVibratoFreq = 10 * emotionMod.vibratoMult;
    const vibratoDepth = emotion === 'playful' ? 0.06 : emotion === 'sleepy' ? 0.02 : 0.04;
    const vibrato = 1 + Math.sin(t * baseVibratoFreq * 2 * Math.PI) * vibratoDepth;
    
    // Add cute "purr" undertone with emotional variations
    let purrEffect = 1;
    if (pitch === 'kitten') {
      const purrFreq = emotion === 'sleepy' ? 15 : emotion === 'playful' ? 35 : 25;
      const purrDepth = emotion === 'affectionate' ? 0.04 : 0.02;
      purrEffect = 1 + Math.sin(t * purrFreq * 2 * Math.PI) * purrDepth;
    }
    
    // Emotional sound modifications
    let emotionalEffect = 1;
    if (emotion === 'happy') {
      // Add chirpy brightness
      emotionalEffect = 1 + Math.sin(t * 40 * 2 * Math.PI) * 0.03;
    } else if (emotion === 'sleepy') {
      // Add gentle warmth
      emotionalEffect = 1 + Math.sin(t * 5 * 2 * Math.PI) * 0.02;
    }
    
    data[i] = sample * envelope * vibrato * purrEffect * emotionalEffect * 0.22;
  }

  return buffer;
};

/**
 * Creates a special accented meow for first beats (longer "myaaow" sound)
 * @param audioContext The audio context
 * @param pitch Cat voice pitch variation
 * @param duration Duration in seconds
 * @returns AudioBuffer containing the accented cat meow
 */
export const createAccentMeowBuffer = (
  audioContext: AudioContext, 
  pitch: 'kitten' | 'adult' | 'large' = 'adult',
  duration: number = DURATIONS.MEDIUM_LONG,
  emotion: CatEmotion = 'neutral'
): AudioBuffer => {
  return createCatMeowBuffer(audioContext, pitch, true, duration, emotion);
};

/**
 * Plays a regular cat meow sound for metronome beats
 * @param pitch Cat voice pitch variation
 * @param emotion Cat emotional state
 */
export const playCatMeow = (
  pitch: 'kitten' | 'adult' | 'large' = 'adult',
  emotion: CatEmotion = 'neutral'
) => {
  playSound((ctx) => createCatMeowBuffer(ctx, pitch, false, DURATIONS.MEDIUM, emotion), VOLUMES.MEDIUM, DURATIONS.MEDIUM);
};

/**
 * Plays an accented cat meow sound for metronome first beats
 * @param pitch Cat voice pitch variation
 * @param emotion Cat emotional state
 */
export const playAccentCatMeow = (
  pitch: 'kitten' | 'adult' | 'large' = 'adult',
  emotion: CatEmotion = 'neutral'
) => {
  playSound((ctx) => createAccentMeowBuffer(ctx, pitch, DURATIONS.MEDIUM_LONG, emotion), VOLUMES.HIGH, DURATIONS.MEDIUM_LONG);
};

/**
 * Creates a "miyamiya" double meow pattern for extra cuteness
 * @param audioContext The audio context
 * @param pitch Cat voice pitch variation
 * @param emotion Emotional state
 * @returns AudioBuffer containing the double meow
 */
export const createMiyamiyaBuffer = (
  audioContext: AudioContext,
  pitch: 'kitten' | 'adult' | 'large' = 'adult',
  emotion: CatEmotion = 'playful'
): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const totalDuration = DURATIONS.MEDIUM_LONG + 0.1; // Slightly longer for double sound
  const frameCount = sampleRate * totalDuration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  // Create two short meows with a brief pause
  const firstMeowBuffer = createCatMeowBuffer(audioContext, pitch, false, DURATIONS.MEDIUM_SHORT, emotion);
  const secondMeowBuffer = createCatMeowBuffer(audioContext, pitch, false, DURATIONS.MEDIUM_SHORT, emotion);
  
  const firstMeowData = firstMeowBuffer.getChannelData(0);
  const secondMeowData = secondMeowBuffer.getChannelData(0);
  
  const pauseDuration = 0.08; // Brief pause between "miya" and "miya"
  const firstMeowFrames = firstMeowData.length;
  const pauseFrames = Math.floor(sampleRate * pauseDuration);
  
  // Copy first meow
  for (let i = 0; i < firstMeowFrames && i < frameCount; i++) {
    data[i] = firstMeowData[i];
  }
  
  // Copy second meow after pause
  const secondStart = firstMeowFrames + pauseFrames;
  for (let i = 0; i < secondMeowData.length && secondStart + i < frameCount; i++) {
    data[secondStart + i] = secondMeowData[i] * 0.9; // Slightly softer second meow
  }
  
  return buffer;
};

/**
 * Creates a purring "rrrr" sound effect
 * @param audioContext The audio context
 * @param duration Duration in seconds
 * @returns AudioBuffer containing the purr sound
 */
export const createPurringBuffer = (
  audioContext: AudioContext,
  duration: number = DURATIONS.MEDIUM
): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    
    // Base purr frequency around 25-50 Hz
    const baseFreq = 30 + Math.sin(t * 3) * 15; // Varying purr rhythm
    
    // Multiple harmonic layers for rich purr texture
    let sample = 0;
    sample += Math.sin(t * baseFreq * 2 * Math.PI) * 0.4;
    sample += Math.sin(t * baseFreq * 2 * 2 * Math.PI) * 0.2;
    sample += Math.sin(t * baseFreq * 3 * 2 * Math.PI) * 0.1;
    
    // Add rumbling texture with noise
    const rumble = (Math.random() * 2 - 1) * 0.15;
    sample += rumble;
    
    // Breathing pattern envelope
    const breathingRate = 1.5; // Breaths per second
    const breathingEnvelope = Math.sin(t * breathingRate * 2 * Math.PI) * 0.3 + 0.7;
    
    // Overall gentle envelope
    const envelope = Math.exp(-t * 0.5); // Slow fade
    
    data[i] = sample * envelope * breathingEnvelope * 0.18;
  }

  return buffer;
};

/**
 * Creates a sniffing "킁킁" sound effect
 * @param audioContext The audio context
 * @returns AudioBuffer containing the sniff sound
 */
export const createSniffingBuffer = (
  audioContext: AudioContext
): AudioBuffer => {
  const duration = 0.3;
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    
    // Two sharp intake sounds
    let sample = 0;
    
    // First sniff (higher pitch)
    if (t < 0.08) {
      const sniffT = t / 0.08;
      const freq = 2000 + sniffT * 1000; // Rising frequency
      sample += Math.sin(t * freq * 2 * Math.PI) * Math.exp(-sniffT * 10);
      
      // Add airflow noise
      const airflow = (Math.random() * 2 - 1) * 0.3 * Math.exp(-sniffT * 8);
      sample += airflow;
    }
    
    // Brief pause
    else if (t < 0.12) {
      // Silence
    }
    
    // Second sniff (slightly lower)
    else if (t < 0.2) {
      const sniffT = (t - 0.12) / 0.08;
      const freq = 1800 + sniffT * 800;
      sample += Math.sin((t - 0.12) * freq * 2 * Math.PI) * Math.exp(-sniffT * 10) * 0.8;
      
      const airflow = (Math.random() * 2 - 1) * 0.25 * Math.exp(-sniffT * 8);
      sample += airflow;
    }
    
    data[i] = sample * 0.2;
  }

  return buffer;
};

/**
 * Plays a "miyamiya" double meow sound
 * @param pitch Cat voice pitch variation
 */
export const playMiyamiya = (pitch: 'kitten' | 'adult' | 'large' = 'adult') => {
  playSound((ctx) => createMiyamiyaBuffer(ctx, pitch, 'playful'), VOLUMES.MEDIUM, DURATIONS.MEDIUM_LONG + 0.1);
};

/**
 * Plays a purring sound
 */
export const playPurring = () => {
  playSound(createPurringBuffer, VOLUMES.MEDIUM, DURATIONS.MEDIUM);
};

/**
 * Plays a sniffing sound
 */
export const playSniffing = () => {
  playSound(createSniffingBuffer, VOLUMES.MEDIUM, 0.3);
};