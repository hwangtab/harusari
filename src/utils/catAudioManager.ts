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

// Emotion-based audio processing settings - EXTREME DIFFERENCES for clear distinction
const EMOTION_SETTINGS = {
  happy: { volumeBoost: 1.8, speedMod: 1.4, brightness: 2.0 },        // 매우 밝고 활발함 (180% 볼륨)
  sleepy: { volumeBoost: 0.3, speedMod: 0.6, brightness: 0.2 },       // 매우 조용하고 느림 (30% 볼륨)
  playful: { volumeBoost: 2.2, speedMod: 1.6, brightness: 2.5 },      // 극도로 활발하고 높음 (220% 볼륨)
  affectionate: { volumeBoost: 0.6, speedMod: 0.8, brightness: 0.5 }, // 부드럽고 따뜻함 (60% 볼륨)
  neutral: { volumeBoost: 1.0, speedMod: 1.0, brightness: 1.0 }       // 기본값 (100% 볼륨)
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
  private currentEmotion: CatEmotion = 'neutral';

  /**
   * Set emotion state for dynamic audio processing
   */
  setEmotion(emotion: CatEmotion): void {
    this.currentEmotion = emotion;
    console.log(`🎭 Cat emotion updated to: ${emotion}`);
  }

  /**
   * Get current emotion state
   */
  getCurrentEmotion(): CatEmotion {
    return this.currentEmotion;
  }

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
   * Select appropriate audio file based on beat strength AND emotion for maximum distinction
   */
  private selectAudioFile(
    catType: CatPitchType, 
    emotion: CatEmotion, 
    beatStrength: BeatStrength
  ): string {
    // Emotion-based file selection for variety
    const emotionFilePreference = {
      happy: CAT_AUDIO_FILES.cartoon,     // 밝고 활발한 cartoon
      playful: CAT_AUDIO_FILES.cartoon,   // 장난스러운 cartoon  
      neutral: CAT_AUDIO_FILES.cartoon,   // 기본 cartoon
      sleepy: CAT_AUDIO_FILES.natural,    // 조용한 natural
      affectionate: CAT_AUDIO_FILES.natural // 애정어린 natural
    };

    // Beat strength에 따른 기본 전략 + 감정별 파일 선택
    switch (beatStrength) {
      case 'primary':
        // Primary beats (강박) - 감정별 파일 사용
        return emotionFilePreference[emotion];
        
      case 'secondary':
        // Secondary beats (중강박) - 반대 파일로 대비 효과
        return emotionFilePreference[emotion] === CAT_AUDIO_FILES.cartoon 
          ? CAT_AUDIO_FILES.natural 
          : CAT_AUDIO_FILES.cartoon;
        
      case 'regular':
      default:
        // Regular beats (약박) - 감정별 파일 그대로 사용 (볼륨으로 구분)
        return emotionFilePreference[emotion];
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
    // EXTREME volume differences for unmistakable 3-tier distinction
    switch (beatStrength) {
      case 'primary': return 1.0;    // Full volume for primary beats (강박)
      case 'secondary': return 0.7;  // Medium volume for secondary beats (중강박)
      case 'regular': return 0.2;    // Very low volume for regular beats (약박)
      default: return 0.2;
    }
  }


  /**
   * Calculate pitch adjustment based on beat strength for clear distinction
   */
  private getPitchMultiplier(beatStrength: BeatStrength): number {
    // EXTREME pitch differences to maximize distinction
    switch (beatStrength) {
      case 'primary': return 0.8;    // Lower pitch for primary beats (deep, authoritative)
      case 'secondary': return 1.0;  // Normal pitch for secondary beats
      case 'regular': return 1.8;    // Much higher pitch for regular beats (very light, almost whisper)
      default: return 1.8;
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
    
    // Get beat strength specific pitch adjustment
    const beatStrengthPitch = this.getPitchMultiplier(beatStrength);

    // Combine cat type pitch with beat strength pitch adjustment
    const combinedPitchShift = pitchSettings.pitchShift * beatStrengthPitch;

    // Apply combined pitch shift
    let processedBuffer = audioBuffer;
    if (combinedPitchShift !== 1.0) {
      processedBuffer = this.createPitchShiftedBuffer(audioBuffer, combinedPitchShift);
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
      // Use internal emotion state if available, fallback to parameter
      const effectiveEmotion = this.currentEmotion || emotion;
      
      const audioContext = await this.initAudioContext();
      
      // Choose audio file based on beat strength and cat characteristics
      const audioFile = this.selectAudioFile(catType, effectiveEmotion, beatStrength);
      
      // Get settings for detailed logging
      const pitchSettings = PITCH_SETTINGS[catType];
      const emotionSettings = EMOTION_SETTINGS[effectiveEmotion];
      const strengthVolume = this.getVolumeMultiplier(beatStrength);
      const beatStrengthPitch = this.getPitchMultiplier(beatStrength);
      const combinedPitchShift = pitchSettings.pitchShift * beatStrengthPitch;
      const baseVolume = 0.75;
      const finalVolume = baseVolume * strengthVolume * pitchSettings.volume * emotionSettings.volumeBoost;
      
      // DEBUG: Detailed logging for pattern verification
      console.log(`🎵 ${beatStrength.toUpperCase()} | 😸${effectiveEmotion} | File: ${audioFile.includes('cartoon') ? 'cartoon' : 'natural'}`);
      console.log(`   📊 Vol: ${strengthVolume}(beat) × ${emotionSettings.volumeBoost}(emotion) = ${(strengthVolume * emotionSettings.volumeBoost).toFixed(2)} | Final: ${finalVolume.toFixed(2)}`);
      console.log(`   🎼 Pitch: ${beatStrengthPitch}(beat) × ${pitchSettings.pitchShift}(cat) = ${combinedPitchShift.toFixed(2)} | Speed: ${emotionSettings.speedMod}`);
      

      // Load audio file
      const originalBuffer = await this.loadAudioFile(audioFile);
      
      // Process for metronome use
      const processedBuffer = await this.processAudioForMetronome(
        originalBuffer, catType, effectiveEmotion, bpm, beatStrength
      );

      // Create and configure audio nodes
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = processedBuffer;

      // Use already calculated volume values from above
      // finalVolume already calculated above for consistent logging

      // Apply emotion-specific audio effects
      const duration = processedBuffer.duration;
      
      // Emotion-based envelope and effects
      switch (effectiveEmotion) {
        case 'happy':
          // Quick attack, bright sustain
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(finalVolume, audioContext.currentTime + 0.005); // Very fast attack
          gainNode.gain.linearRampToValueAtTime(finalVolume * 0.95, audioContext.currentTime + duration - 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
          break;
          
        case 'sleepy':
          // Very slow fade in/out
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(finalVolume * 0.3, audioContext.currentTime + duration * 0.3); // Slow fade in
          gainNode.gain.linearRampToValueAtTime(finalVolume * 0.5, audioContext.currentTime + duration * 0.7); // Gentle peak
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration * 1.2); // Extended fade out
          break;
          
        case 'playful':
          // Bouncy envelope with quick changes
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(finalVolume * 1.2, audioContext.currentTime + 0.003); // Super fast attack
          gainNode.gain.linearRampToValueAtTime(finalVolume * 0.8, audioContext.currentTime + duration * 0.3);
          gainNode.gain.linearRampToValueAtTime(finalVolume, audioContext.currentTime + duration * 0.6);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration * 0.9); // Quick cutoff
          break;
          
        case 'affectionate':
          // Soft, warm envelope
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(finalVolume * 0.7, audioContext.currentTime + duration * 0.2); // Gentle rise
          gainNode.gain.linearRampToValueAtTime(finalVolume, audioContext.currentTime + duration * 0.5); // Warm peak
          gainNode.gain.linearRampToValueAtTime(finalVolume * 0.6, audioContext.currentTime + duration * 0.8);
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration * 1.1); // Soft fade
          break;
          
        case 'neutral':
        default:
          // Standard envelope
          const attackTime = 0.01;
          const releaseTime = Math.min(0.05, duration * 0.2);
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(finalVolume, audioContext.currentTime + attackTime);
          gainNode.gain.linearRampToValueAtTime(finalVolume * 0.9, audioContext.currentTime + duration - releaseTime);
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
          break;
      }

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