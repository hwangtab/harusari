// Generate a hidden track audio file using Web Audio API
// This creates a simple ambient/glitch track as placeholder

export const generateHiddenTrack = async (): Promise<Blob> => {
  const audioContext = new (window.AudioContext || (window as unknown as typeof AudioContext))();
  const sampleRate = audioContext.sampleRate;
  const duration = 2.5 * 60; // 2 minutes 30 seconds
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(2, frameCount, sampleRate);

  // Get channel data
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);

  // Generate ambient/hidden track with multiple layers
  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    
    // Base ambient tone (very quiet sine waves)
    const ambient1 = Math.sin(t * 2 * Math.PI * 110) * 0.05; // A2
    const ambient2 = Math.sin(t * 2 * Math.PI * 165) * 0.03; // E3
    const ambient3 = Math.sin(t * 2 * Math.PI * 220) * 0.02; // A3
    
    // Gentle white noise
    const noise = (Math.random() - 0.5) * 0.01;
    
    // Occasional glitches
    const glitch = Math.random() > 0.998 ? (Math.random() - 0.5) * 0.1 : 0;
    
    // Breathing effect (amplitude modulation)
    const breathe = Math.sin(t * 0.2) * 0.3 + 0.7;
    
    // Gentle panning for stereo effect
    const pan = Math.sin(t * 0.1) * 0.5 + 0.5;
    
    const sample = (ambient1 + ambient2 + ambient3 + noise + glitch) * breathe;
    
    leftChannel[i] = sample * (1 - pan);
    rightChannel[i] = sample * pan;
  }

  // Convert buffer to WAV blob
  return bufferToWav(buffer);
};

const bufferToWav = (buffer: AudioBuffer): Blob => {
  const length = buffer.length;
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
  const view = new DataView(arrayBuffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * numberOfChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 2, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * numberOfChannels * 2, true);

  // Convert float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, value, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

// Save the generated track (for development use)
export const saveHiddenTrack = async () => {
  try {
    const audioBlob = await generateHiddenTrack();
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hidden_track.wav';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to generate hidden track:', error);
  }
};