/**
 * Cat Audio Manager - Real cat sound file management for metronome
 * Handles loading, caching, and playback of actual cat audio files
 * with pitch and speed control for different cat types and BPM requirements
 */

export type CatPitchType = 'kitten' | 'adult' | 'large';
export type CatEmotion = 'happy' | 'sleepy' | 'playful' | 'affectionate' | 'neutral';

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
   * Select appropriate audio file based on cat type, emotion, and accent
   */
  private selectAudioFile(
    catType: CatPitchType, 
    emotion: CatEmotion, 
    isAccent: boolean
  ): string {
    // Accent beats (strong beats) - use more dramatic/varied sounds
    if (isAccent) {
      // For kittens and playful emotions, use cartoon sound for cuteness
      if (catType === 'kitten' || emotion === 'playful' || emotion === 'happy') {
        return CAT_AUDIO_FILES.cartoon;
      }
      // For adult/large cats or calm emotions, use natural sound for depth
      return CAT_AUDIO_FILES.natural;
    } 
    // Regular beats (weak beats) - use contrasting sounds for rhythm clarity
    else {
      // Opposite strategy for regular beats to create contrast
      if (catType === 'kitten' || emotion === 'playful' || emotion === 'happy') {
        return CAT_AUDIO_FILES.natural; // Natural sound provides contrast to cartoon accent
      }
      // For adult/large cats, use cartoon sound for lighter regular beats
      return CAT_AUDIO_FILES.cartoon;
    }
  }

  /**
   * Calculate optimal duration for given BPM
   */
  private calculateOptimalDuration(bpm: number, isAccent: boolean = false): number {
    // Beat duration in seconds
    const beatDuration = 60 / bpm;
    
    // Use 60-80% of beat duration for sound, leaving gap for clarity
    const soundRatio = isAccent ? 0.8 : 0.6;
    return Math.max(0.1, Math.min(0.4, beatDuration * soundRatio));
  }

  /**
   * Process audio for specific cat type, emotion, and BPM
   */
  private async processAudioForMetronome(
    audioBuffer: AudioBuffer,
    catType: CatPitchType,
    emotion: CatEmotion,
    bpm: number,
    isAccent: boolean = false
  ): Promise<AudioBuffer> {
    const pitchSettings = PITCH_SETTINGS[catType];
    const emotionSettings = EMOTION_SETTINGS[emotion];
    const targetDuration = this.calculateOptimalDuration(bpm, isAccent);

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
    isAccent: boolean = false
  ): Promise<void> {
    try {
      const audioContext = await this.initAudioContext();
      
      // Choose audio file based on accent/regular beat and cat characteristics
      const audioFile = this.selectAudioFile(catType, emotion, isAccent);

      // Load audio file
      const originalBuffer = await this.loadAudioFile(audioFile);
      
      // Process for metronome use
      const processedBuffer = await this.processAudioForMetronome(
        originalBuffer, catType, emotion, bpm, isAccent
      );

      // Create and configure audio nodes
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = processedBuffer;

      // Calculate volume
      const pitchSettings = PITCH_SETTINGS[catType];
      const emotionSettings = EMOTION_SETTINGS[emotion];
      const baseVolume = isAccent ? 0.8 : 0.6;
      const finalVolume = baseVolume * pitchSettings.volume * emotionSettings.volumeBoost;

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
  bpm: number = 120
) => {
  return catAudioManager.playCatMeow(catType, emotion, bpm, false);
};

export const playAccentCatMeow = (
  catType: CatPitchType = 'adult', 
  emotion: CatEmotion = 'neutral',
  bpm: number = 120
) => {
  return catAudioManager.playCatMeow(catType, emotion, bpm, true);
};

// Preload function for initialization
export const preloadCatAudio = () => {
  return catAudioManager.preloadAudioFiles();
};