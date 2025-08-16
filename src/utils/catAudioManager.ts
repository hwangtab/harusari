/**
 * Cat Audio Manager - Real cat sound file management for metronome
 * Handles loading, caching, and playback of actual cat audio files
 * with pitch and speed control for different cat types and BPM requirements
 */

export type CatPitchType = 'kitten' | 'adult' | 'large';
export type CatEmotion = 'happy' | 'sleepy' | 'playful' | 'affectionate' | 'neutral';
export type BeatStrength = 'primary' | 'secondary' | 'regular';

// Audio file paths
const CAT_AUDIO_FILES = {
  cartoon: '/audio/cat/672993__ozzyfurryreal2023__cartoon-meow-from-scratch.wav',
  natural: '/audio/cat/686775__nathan-osman__meow-1.wav'
} as const;

// Pitch modification settings for different cat types
const PITCH_SETTINGS = {
  kitten: { pitchShift: 1.3, volume: 0.8 },
  adult: { pitchShift: 1.0, volume: 1.0 },
  large: { pitchShift: 0.75, volume: 1.1 }
} as const;

// Emotion-based audio processing settings
const EMOTION_SETTINGS = {
  happy: { volumeBoost: 1.1, speedMod: 1.05, brightness: 1.2 },
  sleepy: { volumeBoost: 0.9, speedMod: 0.95, brightness: 0.8 },
  playful: { volumeBoost: 1.15, speedMod: 1.1, brightness: 1.3 },
  affectionate: { volumeBoost: 0.95, speedMod: 0.98, brightness: 0.9 },
  neutral: { volumeBoost: 1.0, speedMod: 1.0, brightness: 1.0 }
} as const;

interface AudioCacheEntry {
  buffer: AudioBuffer;
  originalDuration: number;
  sampleRate: number;
}

class CatAudioManager {
  private audioContext: AudioContext | null = null;
  private audioCache = new Map<string, AudioCacheEntry>();
  private loadingPromises = new Map<string, Promise<AudioBuffer>>();

  /**
   * Initialize audio context
   */
  private async initAudioContext(): Promise<AudioContext> {
    if (this.audioContext) return this.audioContext;

    try {
      const AudioContextClass = window.AudioContext || 
                               (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || 
                               (window as Window & typeof globalThis & { mozAudioContext?: typeof AudioContext }).mozAudioContext;
      
      if (!AudioContextClass) {
        throw new Error('Web Audio API not supported');
      }

      this.audioContext = new AudioContextClass();
      
      // Resume context if suspended (required for some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      return this.audioContext;
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
      throw error;
    }
  }

  /**
   * Load and decode audio file
   */
  private async loadAudioFile(url: string): Promise<AudioBuffer> {
    // Check if already loading
    const existingPromise = this.loadingPromises.get(url);
    if (existingPromise) return existingPromise;

    // Create loading promise
    const loadingPromise = this.performAudioLoad(url);
    this.loadingPromises.set(url, loadingPromise);

    try {
      const buffer = await loadingPromise;
      this.loadingPromises.delete(url);
      return buffer;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }

  private async performAudioLoad(url: string): Promise<AudioBuffer> {
    const audioContext = await this.initAudioContext();

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Cache the loaded audio
      const cacheEntry: AudioCacheEntry = {
        buffer: audioBuffer,
        originalDuration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate
      };
      this.audioCache.set(url, cacheEntry);

      return audioBuffer;
    } catch (error) {
      console.error(`Failed to load audio file ${url}:`, error);
      throw error;
    }
  }

  /**
   * Apply pitch shift using Web Audio API
   */
  private createPitchShiftedBuffer(
    audioBuffer: AudioBuffer, 
    pitchShift: number
  ): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');

    const originalSampleRate = audioBuffer.sampleRate;
    const originalLength = audioBuffer.length;
    const newLength = Math.round(originalLength / pitchShift);

    // Create new buffer with adjusted length to maintain timing
    const pitchShiftedBuffer = this.audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      newLength,
      originalSampleRate // Keep original sample rate
    );

    // Process each channel
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const originalData = audioBuffer.getChannelData(channel);
      const newData = pitchShiftedBuffer.getChannelData(channel);

      // Simple linear interpolation for pitch shifting
      for (let i = 0; i < newLength; i++) {
        const originalIndex = i * pitchShift;
        const lowerIndex = Math.floor(originalIndex);
        const upperIndex = Math.min(lowerIndex + 1, originalLength - 1);
        const fraction = originalIndex - lowerIndex;

        // Linear interpolation
        const lowerValue = originalData[lowerIndex] || 0;
        const upperValue = originalData[upperIndex] || 0;
        newData[i] = lowerValue + (upperValue - lowerValue) * fraction;
      }
    }

    return pitchShiftedBuffer;
  }

  /**
   * Apply speed adjustment without pitch change using overlap-add method
   */
  private createTimeStretchedBuffer(
    audioBuffer: AudioBuffer, 
    speedRatio: number,
    targetDuration: number
  ): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');

    const originalLength = audioBuffer.length;
    const targetLength = Math.round(this.audioContext.sampleRate * targetDuration);
    
    // For metronome, we want shorter sounds, so we'll trim rather than stretch for most cases
    const effectiveLength = Math.min(targetLength, Math.round(originalLength / speedRatio));

    const stretchedBuffer = this.audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      effectiveLength,
      audioBuffer.sampleRate
    );

    // Simple time stretching with overlap-add
    const frameSize = 1024;
    const hopSize = Math.round(frameSize * speedRatio);

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const originalData = audioBuffer.getChannelData(channel);
      const stretchedData = stretchedBuffer.getChannelData(channel);

      let outputIndex = 0;
      let inputIndex = 0;

      while (outputIndex < effectiveLength && inputIndex < originalLength - frameSize) {
        // Copy frame with overlap
        for (let i = 0; i < frameSize && outputIndex + i < effectiveLength; i++) {
          if (inputIndex + i < originalLength) {
            // Apply windowing for smooth transitions
            const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / frameSize));
            stretchedData[outputIndex + i] += originalData[inputIndex + i] * window;
          }
        }

        inputIndex += hopSize;
        outputIndex += frameSize / 2; // 50% overlap
      }

      // Normalize to prevent clipping
      let maxValue = 0;
      for (let i = 0; i < effectiveLength; i++) {
        maxValue = Math.max(maxValue, Math.abs(stretchedData[i]));
      }
      if (maxValue > 1.0) {
        for (let i = 0; i < effectiveLength; i++) {
          stretchedData[i] /= maxValue;
        }
      }
    }

    return stretchedBuffer;
  }

  /**
   * Select appropriate audio file based on cat type, emotion, and beat strength
   */
  private selectAudioFile(
    catType: CatPitchType, 
    emotion: CatEmotion, 
    beatStrength: BeatStrength
  ): string {
    const isCuteType = catType === 'kitten' || emotion === 'playful' || emotion === 'happy';
    
    switch (beatStrength) {
      case 'primary':
        // Primary beats (strongest) - use most dramatic sound for each type
        return isCuteType ? CAT_AUDIO_FILES.cartoon : CAT_AUDIO_FILES.natural;
        
      case 'secondary':
        // Secondary beats (medium) - use contrasting sound for variety
        return isCuteType ? CAT_AUDIO_FILES.natural : CAT_AUDIO_FILES.cartoon;
        
      case 'regular':
      default:
        // Regular beats (weakest) - use lighter sound opposite to primary
        return isCuteType ? CAT_AUDIO_FILES.natural : CAT_AUDIO_FILES.cartoon;
    }
  }

  /**
   * Calculate optimal duration for given BPM and beat strength
   */
  private calculateOptimalDuration(bpm: number, beatStrength: BeatStrength = 'regular'): number {
    // Beat duration in seconds
    const beatDuration = 60 / bpm;
    
    // Use different ratios based on beat strength
    const soundRatios = {
      primary: 0.85,    // Longest for primary beats
      secondary: 0.75,  // Medium for secondary beats  
      regular: 0.65     // Shortest for regular beats
    };
    
    const soundRatio = soundRatios[beatStrength];
    return Math.max(0.1, Math.min(0.4, beatDuration * soundRatio));
  }

  /**
   * Calculate volume adjustment based on beat strength
   */
  private getVolumeMultiplier(beatStrength: BeatStrength): number {
    switch (beatStrength) {
      case 'primary': return 1.0;    // Full volume for primary beats
      case 'secondary': return 0.85; // Reduced volume for secondary beats
      case 'regular': return 0.7;    // Lowest volume for regular beats
      default: return 0.7;
    }
  }

  /**
   * Process audio for specific cat type, emotion, BPM, and beat strength
   */
  private async processAudioForMetronome(
    audioBuffer: AudioBuffer,
    catType: CatPitchType,
    emotion: CatEmotion,
    bpm: number,
    beatStrength: BeatStrength = 'regular'
  ): Promise<AudioBuffer> {
    const pitchSettings = PITCH_SETTINGS[catType];
    const emotionSettings = EMOTION_SETTINGS[emotion];
    const targetDuration = this.calculateOptimalDuration(bpm, beatStrength);

    // Apply pitch shift for cat type
    let processedBuffer = audioBuffer;
    if (pitchSettings.pitchShift !== 1.0) {
      processedBuffer = this.createPitchShiftedBuffer(audioBuffer, pitchSettings.pitchShift);
    }

    // Apply time stretching for BPM requirement
    const speedRatio = emotionSettings.speedMod;
    processedBuffer = this.createTimeStretchedBuffer(processedBuffer, speedRatio, targetDuration);

    return processedBuffer;
  }

  /**
   * Play cat meow sound optimized for metronome
   */
  async playCatMeow(
    catType: CatPitchType = 'adult',
    emotion: CatEmotion = 'neutral',
    bpm: number = 120,
    beatStrength: BeatStrength = 'regular'
  ): Promise<void> {
    try {
      const audioContext = await this.initAudioContext();
      
      // Choose audio file based on beat strength and cat characteristics
      const audioFile = this.selectAudioFile(catType, emotion, beatStrength);

      // Load audio file
      const originalBuffer = await this.loadAudioFile(audioFile);
      
      // Process for metronome use
      const processedBuffer = await this.processAudioForMetronome(
        originalBuffer, catType, emotion, bpm, beatStrength
      );

      // Create and configure audio nodes
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = processedBuffer;

      // Calculate volume based on beat strength and cat characteristics
      const pitchSettings = PITCH_SETTINGS[catType];
      const emotionSettings = EMOTION_SETTINGS[emotion];
      const strengthVolume = this.getVolumeMultiplier(beatStrength);
      const baseVolume = 0.75;
      const finalVolume = baseVolume * strengthVolume * pitchSettings.volume * emotionSettings.volumeBoost;

      // Smooth envelope to prevent clicks
      const duration = processedBuffer.duration;
      const attackTime = 0.01;
      const releaseTime = Math.min(0.05, duration * 0.2);

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(finalVolume, audioContext.currentTime + attackTime);
      gainNode.gain.linearRampToValueAtTime(finalVolume * 0.9, audioContext.currentTime + duration - releaseTime);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

      // Connect and play
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.start();
      source.stop(audioContext.currentTime + duration);

    } catch (error) {
      console.warn('Failed to play cat meow:', error);
      // Fallback to silence - metronome will continue working
    }
  }

  /**
   * Preload audio files for better performance
   */
  async preloadAudioFiles(): Promise<void> {
    try {
      await Promise.all([
        this.loadAudioFile(CAT_AUDIO_FILES.cartoon),
        this.loadAudioFile(CAT_AUDIO_FILES.natural)
      ]);
      console.log('Cat audio files preloaded successfully');
    } catch (error) {
      console.warn('Failed to preload some cat audio files:', error);
    }
  }

  /**
   * Clear audio cache and reset context
   */
  dispose(): void {
    this.audioCache.clear();
    this.loadingPromises.clear();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioContext = null;
  }
}

// Export singleton instance
export const catAudioManager = new CatAudioManager();

// Convenience functions for metronome integration
export const playCatMeow = (
  catType: CatPitchType = 'adult',
  emotion: CatEmotion = 'neutral',
  bpm: number = 120,
  beatStrength: BeatStrength = 'regular'
) => {
  return catAudioManager.playCatMeow(catType, emotion, bpm, beatStrength);
};

export const playAccentCatMeow = (
  catType: CatPitchType = 'adult', 
  emotion: CatEmotion = 'neutral',
  bpm: number = 120
) => {
  return catAudioManager.playCatMeow(catType, emotion, bpm, 'primary');
};

export const playSecondaryCatMeow = (
  catType: CatPitchType = 'adult', 
  emotion: CatEmotion = 'neutral',
  bpm: number = 120
) => {
  return catAudioManager.playCatMeow(catType, emotion, bpm, 'secondary');
};

// Preload function for initialization
export const preloadCatAudio = () => {
  return catAudioManager.preloadAudioFiles();
};